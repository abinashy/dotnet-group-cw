import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddBookModal from '../components/Admin/AddBookModal';

export default function AdminBooks() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [booksRes, publishersRes, authorsRes, genresRes] = await Promise.all([
          axios.get('http://localhost:5124/api/Books'),
          axios.get('http://localhost:5124/api/Publishers'),
          axios.get('http://localhost:5124/api/Authors'),
          axios.get('http://localhost:5124/api/Genres')
        ]);

        console.log('Books API response:', JSON.stringify(booksRes.data, null, 2));
        console.log('Authors from API:', authorsRes.data);
        console.log('Genres from API:', genresRes.data);
        
        // Process books data to include full author and genre information
        const processedBooks = booksRes.data.map(book => {
          // Log each book's details for debugging
          console.log(`Processing book: ${book.title} (ID: ${book.bookId})`);
          console.log('Book author IDs:', book.authorIds);
          console.log('Book genre IDs:', book.genreIds);
          
          // Match authors and genres by ID
          const bookAuthors = authorsRes.data.filter(author => 
            book.authorIds && book.authorIds.includes(author.authorId)
          );
          
          const bookGenres = genresRes.data.filter(genre => 
            book.genreIds && book.genreIds.includes(genre.genreId)
          );
          
          console.log('Matched authors:', bookAuthors);
          console.log('Matched genres:', bookGenres);
          
          return {
            ...book,
            authors: bookAuthors.length > 0 ? bookAuthors : [],
            genres: bookGenres.length > 0 ? bookGenres : []
          };
        });
        
        setBooks(processedBooks);
        setPublishers(publishersRes.data);
        setAuthors(authorsRes.data);
        setGenres(genresRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddBook = async (values, { setSubmitting, resetForm }) => {
    try {
      console.log('Form values submitted:', values);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      console.log('Auth token available:', token ? 'Yes (length: ' + token.length + ')' : 'No');

      // Determine if we're editing or adding a new book
      const isEditing = values.bookId != null;
      console.log('Is editing existing book:', isEditing, 'Book ID:', values.bookId);

      let coverImageUrl = values.coverImageUrl || '';
      if (values.coverImageFile) {
        console.log('Uploading new cover image...');
        try {
          const formData = new FormData();
          formData.append('file', values.coverImageFile);

          // Log the request headers and token info for debugging
          console.log('Upload request headers:', {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token.substring(0, 10)}...` // Log part of token for security
          });
          
          // Check if the token has the right format (Bearer token) 
          if (!token.startsWith('Bearer ')) {
            console.log('Adding Bearer prefix to token');
            // Ensure the token has the Bearer prefix
            const authToken = `Bearer ${token}`;
            
            const uploadResponse = await axios.post('http://localhost:5124/api/Upload/Image', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': authToken
              }
            });
            coverImageUrl = uploadResponse.data.url;
          } else {
            // Token already has Bearer prefix
            const uploadResponse = await axios.post('http://localhost:5124/api/Upload/Image', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': token
              }
            });
            coverImageUrl = uploadResponse.data.url;
          }
          
          console.log('New cover image URL:', coverImageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          console.error('Upload response:', uploadError.response?.status, uploadError.response?.statusText);
          console.error('Upload error details:', uploadError.response?.data);
          
          // Log more specific error information for debugging
          if (uploadError.response?.status === 401) {
            console.error('Authentication failed for image upload. Token might be invalid or expired.');
            // Use the existing image URL if editing, or continue without an image if creating new
            if (isEditing && values.coverImageUrl) {
              console.warn('Continuing with the existing cover image URL');
              coverImageUrl = values.coverImageUrl;
            } else {
              console.warn('Continuing with book save without image');
            }
          } else {
            console.warn('Continuing with book save without new image');
          }
        }
      } else {
        console.log('Using existing cover image URL:', coverImageUrl);
      }

      // Create new entities if needed
      let finalPublisherId = values.publisherId;
      let finalAuthorIds = [...values.authorIds];
      let finalGenreIds = [...values.genreIds];

      // Handle new publisher
      if (values.newPublisher?.name) {
        const publisherResponse = await axios.post('http://localhost:5124/api/Publishers', {
          name: values.newPublisher.name,
          description: values.newPublisher.description
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        finalPublisherId = publisherResponse.data.publisherId;
      }

      // Handle new authors
      if (values.newAuthors && values.newAuthors.length > 0) {
        for (const author of values.newAuthors) {
          // Skip empty author entries
          if (!author.firstName || !author.lastName) continue;
          
        const authorResponse = await axios.post('http://localhost:5124/api/Authors', {
            firstName: author.firstName,
            lastName: author.lastName,
            biography: author.biography
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
          finalAuthorIds.push(authorResponse.data.authorId.toString());
        }
      }

      // Handle new genres
      if (values.newGenres && values.newGenres.length > 0) {
        for (const genre of values.newGenres) {
          // Skip empty genre entries
          if (!genre.name) continue;
          
        const genreResponse = await axios.post('http://localhost:5124/api/Genres', {
            name: genre.name,
            description: genre.description
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
          finalGenreIds.push(genreResponse.data.genreId.toString());
        }
      }

      // Prepare the book data
      const bookData = {
        title: values.title,
        isbn: values.isbn,
        price: parseFloat(values.price),
        publicationYear: parseInt(values.publicationYear),
        pageCount: parseInt(values.pageCount),
        language: values.language,
        format: values.format,
        description: values.description,
        coverImageUrl: coverImageUrl,
        publisherId: finalPublisherId ? parseInt(finalPublisherId) : null,
        authorIds: finalAuthorIds.map(id => parseInt(id)),
        genreIds: finalGenreIds.map(id => parseInt(id)),
        isAwardWinning: values.isAwardWinning || false,
        status: values.status || 'Published'
      };

      console.log('Book data being sent to API:', bookData);

      if (isEditing) {
        // Update existing book
        console.log(`Updating book with ID ${values.bookId}...`);
        try {
          const response = await axios.put(`http://localhost:5124/api/Books/${values.bookId}`, bookData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Update response:', response.data);
        } catch (updateError) {
          console.error('Error updating book:', updateError.response?.data || updateError.message);
          throw new Error(`Failed to update book: ${updateError.response?.data?.message || updateError.message}`);
        }
      } else {
        // Create new book
        console.log('Creating new book...');
        try {
          const response = await axios.post('http://localhost:5124/api/Books', bookData, {
        headers: { Authorization: `Bearer ${token}` }
      });
          console.log('Create response:', response.data);
        } catch (createError) {
          console.error('Error creating book:', createError.response?.data || createError.message);
          throw new Error(`Failed to create book: ${createError.response?.data?.message || createError.message}`);
        }
      }

      console.log('Book saved successfully, refreshing data...');

      // Refresh the data
      const [booksRes, publishersRes, authorsRes, genresRes] = await Promise.all([
        axios.get('http://localhost:5124/api/Books'),
        axios.get('http://localhost:5124/api/Publishers'),
        axios.get('http://localhost:5124/api/Authors'),
        axios.get('http://localhost:5124/api/Genres')
      ]);

      console.log('New books data:', booksRes.data);
      
      // Process books data to include full author and genre information
      const processedBooks = booksRes.data.map(book => {
        // Match authors and genres by ID
        const bookAuthors = authorsRes.data.filter(author => 
          book.authorIds && book.authorIds.includes(author.authorId)
        );
        
        const bookGenres = genresRes.data.filter(genre => 
          book.genreIds && book.genreIds.includes(genre.genreId)
        );
        
        return {
          ...book,
          authors: bookAuthors.length > 0 ? bookAuthors : [],
          genres: bookGenres.length > 0 ? bookGenres : []
        };
      });
      
      setBooks(processedBooks);
      setPublishers(publishersRes.data);
      setAuthors(authorsRes.data);
      setGenres(genresRes.data);

      // Close modal and reset form
      setIsAddModalOpen(false);
      setEditingBook(null);
      resetForm();
      
      alert(isEditing ? 'Book updated successfully!' : 'Book added successfully!');
    } catch (error) {
      console.error('Error saving book:', error);
      alert(`Failed to ${values.bookId ? 'update' : 'add'} book: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setIsAddModalOpen(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        await axios.delete(`http://localhost:5124/api/Books/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Refresh the books list
        const booksRes = await axios.get('http://localhost:5124/api/Books');
        setBooks(booksRes.data);
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Failed to delete book. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Books Management</h1>
        <button
          onClick={() => {
            setEditingBook(null);
            setIsAddModalOpen(true);
          }}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Add New Book
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cover
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publisher
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Authors & Genres
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
        {books.map((book) => (
                <tr key={book.bookId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-20 bg-gray-200 flex items-center justify-center overflow-hidden rounded">
                      {book.coverImageUrl ? (
                        <img 
                          src={book.coverImageUrl} 
                          alt={`Cover of ${book.title}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => { 
                            e.target.onerror = null; 
                            // Use inline SVG instead of external placeholder with larger text
                            e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="200" viewBox="0 0 150 200" fill="none"><rect width="150" height="200" fill="%23E5E7EB"/><text x="75" y="100" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="%234B5563">No Cover</text></svg>`;
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 150 200" fill="none">
                            <rect width="150" height="200" fill="#E5E7EB"/>
                            <text x="75" y="100" fontFamily="Arial" fontSize="20" fontWeight="bold" textAnchor="middle" fill="#4B5563">No Cover</text>
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{book.title}</div>
                    <div className="text-sm text-gray-500">ISBN: {book.isbn}</div>
                    <div className="text-sm text-gray-500">Price: ${book.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">
                      {book.publicationYear} · {book.pageCount} pages · {book.language}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{book.publisherName || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">Authors:</span> {
                        book.authors && book.authors.length > 0 
                          ? book.authors
                              .map(a => {
                                if (!a) return '';
                                const firstName = a.firstName || '';
                                const lastName = a.lastName || '';
                                return `${firstName} ${lastName}`.trim();
                              })
                              .filter(name => name)
                              .join(', ') || 'None'
                          : 'None'
                      }
                    </div>
                    <div className="text-sm text-gray-900 mt-1">
                      <span className="font-medium">Genres:</span> {
                        book.genres && book.genres.length > 0 
                          ? book.genres
                              .map(g => g && g.name ? g.name : '')
                              .filter(name => name)
                              .join(', ') || 'None'
                          : 'None'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      book.status === 'Published' ? 'bg-green-100 text-green-800' :
                      book.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                      book.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {book.status}
                    </span>
                    {book.isAwardWinning && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        Award Winner
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditBook(book)}
                        className="text-gray-600 hover:text-black"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteBook(book.bookId)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {books.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No books found. Add your first book to get started.
          </div>
        )}
      </div>

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBook(null);
        }}
        onSubmit={handleAddBook}
        publishers={publishers}
        authors={authors}
        genres={genres}
        editingBook={editingBook}
      />
    </div>
  );
}
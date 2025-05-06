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

        setBooks(booksRes.data);
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      let coverImageUrl = '';
      if (values.coverImageFile) {
        const formData = new FormData();
        formData.append('file', values.coverImageFile);

        const uploadResponse = await axios.post('http://localhost:5124/api/Upload/Image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });

        coverImageUrl = uploadResponse.data.url;
      }

      // Create new entities if needed
      let finalPublisherId = values.publisherId;
      let finalAuthorIds = values.authorIds;
      let finalGenreIds = values.genreIds;

      if (values.newPublisher?.name) {
        const publisherResponse = await axios.post('http://localhost:5124/api/Publishers', {
          name: values.newPublisher.name,
          description: values.newPublisher.description
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        finalPublisherId = publisherResponse.data.publisherId;
      }

      if (values.newAuthor?.firstName) {
        const authorResponse = await axios.post('http://localhost:5124/api/Authors', {
          firstName: values.newAuthor.firstName,
          lastName: values.newAuthor.lastName,
          biography: values.newAuthor.biography
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        finalAuthorIds = [...(values.authorIds || []), authorResponse.data.authorId];
      }

      if (values.newGenre?.name) {
        const genreResponse = await axios.post('http://localhost:5124/api/Genres', {
          name: values.newGenre.name,
          description: values.newGenre.description
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        finalGenreIds = [...(values.genreIds || []), genreResponse.data.genreId];
      }

      // Create the book with all related data
      await axios.post('http://localhost:5124/api/Books', {
        title: values.title,
        isbn: values.isbn,
        price: parseFloat(values.price),
        publicationYear: parseInt(values.publicationYear),
        pageCount: parseInt(values.pageCount),
        language: values.language,
        format: values.format,
        description: values.description,
        coverImageUrl: coverImageUrl,
        publisherId: finalPublisherId,
        authorIds: finalAuthorIds,
        genreIds: finalGenreIds,
        isAwardWinning: values.isAwardWinning || false,
        status: values.status || 'Published'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh the data
      const [booksRes, publishersRes, authorsRes, genresRes] = await Promise.all([
        axios.get('http://localhost:5124/api/Books'),
        axios.get('http://localhost:5124/api/Publishers'),
        axios.get('http://localhost:5124/api/Authors'),
        axios.get('http://localhost:5124/api/Genres')
      ]);

      setBooks(booksRes.data);
      setPublishers(publishersRes.data);
      setAuthors(authorsRes.data);
      setGenres(genresRes.data);

      // Close modal and reset form
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Failed to add book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Books Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add New Book
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.bookId} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{book.title}</h3>
            <p className="text-gray-600">ISBN: {book.isbn}</p>
            <p className="text-gray-600">Price: ${book.price}</p>
            <p className="text-gray-600">Publisher: {book.publisherName}</p>
            <p className="text-gray-600">
              Authors: {book.authors?.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
            </p>
            <p className="text-gray-600">
              Genres: {book.genres?.map(g => g.name).join(', ')}
            </p>
          </div>
        ))}
      </div>

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBook}
        publishers={publishers}
        authors={authors}
        genres={genres}
      />
    </div>
  );
}
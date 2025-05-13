import React, { useEffect } from "react";
import { useWishlist } from "../context/WishlistContext";
import BooksCard from "../components/BooksCard";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const { wishlist, loading, fetchWishlist } = useWishlist();
  const navigate = useNavigate();
  
  // Fetch wishlist data when component mounts - this ensures up to date data
  useEffect(() => {
    // Always fetch fresh data when this component mounts
    const fetchData = async () => {
      await fetchWishlist();
    };
    
    fetchData();
  }, []); // intentionally not including fetchWishlist as dependency to avoid eslint warnings

  const handleBookClick = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex flex-col items-center justify-center">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold mb-8">Loading your wishlist...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-pink-500 mb-4">
            <svg className="w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-4">Your wishlist is empty. Start adding books you love!</p>
          <button 
            onClick={() => navigate('/books')}
            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
          >
            Explore Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
          {wishlist.map((book) => (
            <BooksCard 
              key={book.bookId} 
              book={{
                bookId: book.bookId,
                title: book.bookTitle,
                coverImageUrl: book.coverImageUrl,
                price: book.price,
                availability: book.availability,
                authors: [{ firstName: book.authorName.split(' ')[0], lastName: book.authorName.split(' ').slice(1).join(' ') }]
              }} 
              onClick={() => handleBookClick(book.bookId)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist; 
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [animationPosition, setAnimationPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchInProgress, setFetchInProgress] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Load wishlist from API on mount and when token changes
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setLoading(false);
    }
  }, []);

  // Clear animation position after animation
  useEffect(() => {
    if (animationPosition) {
      const timer = setTimeout(() => {
        setAnimationPosition(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [animationPosition]);

  const fetchWishlist = async () => {
    // Prevent multiple simultaneous fetch requests
    if (fetchInProgress) return;
    
    try {
      setFetchInProgress(true);
      // Only show loading indicator on initial load, not refreshes
      if (wishlist.length === 0) {
        setLoading(true);
      }
      
      const token = getAuthToken();
      if (!token) {
        setWishlist([]);
        return;
      }

      const response = await axios.get('http://localhost:5124/api/bookmarks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // Don't clear wishlist on error, maintain previous state
      if (error.response?.status === 401) {
        // Token expired
        localStorage.removeItem('token');
        setWishlist([]);
      }
    } finally {
      setLoading(false);
      setFetchInProgress(false);
    }
  };

  const checkWishlistStatus = async (bookId) => {
    try {
      const token = getAuthToken();
      if (!token) return false;

      const response = await axios.get(`http://localhost:5124/api/bookmarks/check/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.isBookmarked;
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  };

  const isInWishlist = (bookId) => {
    return wishlist.some((item) => item.bookId === bookId);
  };

  const addToWishlist = async (book, clientX, clientY) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please log in to add to wishlist');
        return;
      }

      // Set animation position if coordinates provided
      if (clientX && clientY) {
        setAnimationPosition({ x: clientX, y: clientY });
      }

      // Check if already in wishlist to prevent duplicates
      if (isInWishlist(book.bookId)) {
        return;
      }

      const response = await axios.post(
        'http://localhost:5124/api/bookmarks',
        { bookId: book.bookId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        // Optimistically update the UI immediately
        setWishlist(prev => {
          // Check to avoid duplicates
          const exists = prev.some(item => item.bookId === response.data.bookId);
          if (exists) return prev;
          return [...prev, response.data];
        });
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      if (error.response?.status === 409) {
        // Item already in wishlist, just show animation
        return;
      }
      alert('Failed to add to wishlist. Please try again.');
    }
  };

  const removeFromWishlist = async (bookId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Optimistically update UI first for faster feedback
      setWishlist(prev => prev.filter(item => item.bookId !== bookId));

      await axios.delete(`http://localhost:5124/api/bookmarks/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // No need to update wishlist state here since we've already done it optimistically
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist. Please try again.');
      
      // Revert the optimistic update if the API call failed
      fetchWishlist();
    }
  };

  const toggleWishlist = async (book, event) => {
    const clientX = event?.clientX;
    const clientY = event?.clientY;
    
    try {
      if (isInWishlist(book.bookId)) {
        await removeFromWishlist(book.bookId);
      } else {
        await addToWishlist(book, clientX, clientY);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // If there was an error, refresh the wishlist to get the correct state
      const token = getAuthToken();
      if (token) {
        fetchWishlist();
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      loading, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist, 
      toggleWishlist, 
      fetchWishlist,
      checkWishlistStatus 
    }}>
      {children}
      {animationPosition && (
        <div
          style={{
            position: 'fixed',
            left: animationPosition.x - 20,
            top: animationPosition.y - 20,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24"
            style={{
              animation: 'flyToWishlist 1s forwards',
            }}
          >
            <defs>
              <linearGradient id="animHeartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <filter id="animHeartShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#EC4899" floodOpacity="0.5"/>
              </filter>
            </defs>
            <path 
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
              fill="url(#animHeartGradient)" 
              filter="url(#animHeartShadow)"
            />
          </svg>
        </div>
      )}
      <style jsx>{`
        @keyframes flyToWishlist {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            transform: scale(1.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(0.1) translateY(-100px);
            opacity: 0;
          }
        }
      `}</style>
    </WishlistContext.Provider>
  );
} 
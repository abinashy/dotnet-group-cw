import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BookContext = createContext();

export function useBooks() {
  return useContext(BookContext);
}

export function BookProvider({ children }) {
  const [booksCache, setBooksCache] = useState({});
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  
  // Function to refresh book details (especially discounts)
  const refreshBookDetails = async (bookId) => {
    if (!bookId) return null;
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log(`Refreshing book ${bookId} at ${new Date().toLocaleTimeString()}`);
      const response = await axios.get(`http://localhost:5124/api/Books/${bookId}`, { headers });
      
      if (response.data) {
        // Check if discount status changed
        const oldBookData = booksCache[bookId];
        const newBookData = response.data;
        
        if (oldBookData) {
          const oldIsOnSale = oldBookData.isOnSale;
          const newIsOnSale = newBookData.isOnSale;
          const oldDiscountedPrice = oldBookData.discountedPrice;
          const newDiscountedPrice = newBookData.discountedPrice;
          
          if (oldIsOnSale !== newIsOnSale || oldDiscountedPrice !== newDiscountedPrice) {
            console.log(`Discount changed for book ${bookId}:`, {
              id: bookId,
              title: newBookData.title,
              oldIsOnSale,
              newIsOnSale,
              oldDiscountedPrice,
              newDiscountedPrice
            });
          }
        }
        
        // Update the book in our cache
        setBooksCache(prevCache => ({
          ...prevCache,
          [bookId]: {
            ...response.data,
            lastUpdated: Date.now()
          }
        }));
        
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error(`Error refreshing book ${bookId}:`, error);
      return null;
    }
  };
  
  // Function to get book details, using cache if available and recent
  const getBookDetails = async (bookId) => {
    // If we have it in cache and it's less than a minute old, return it
    const cachedBook = booksCache[bookId];
    if (cachedBook && (Date.now() - cachedBook.lastUpdated < 60000)) {
      return cachedBook;
    }
    
    // Otherwise fetch fresh data
    return refreshBookDetails(bookId);
  };
  
  // Set up a refresh interval to update pricing every minute
  useEffect(() => {
    console.log("Setting up discount refresh interval");
    
    const refreshInterval = setInterval(() => {
      // Refresh all books in cache
      const now = new Date();
      console.log(`Refreshing ${Object.keys(booksCache).length} books at ${now.toLocaleTimeString()}`);
      
      setLastRefreshTime(Date.now());
      
      Object.keys(booksCache).forEach(bookId => {
        refreshBookDetails(bookId);
      });
    }, 60000); // Refresh every minute
    
    return () => {
      console.log("Clearing discount refresh interval");
      clearInterval(refreshInterval);
    };
  }, [booksCache]); // Dependency on booksCache so we refresh the right books
  
  // Value to provide through context
  const value = {
    getBookDetails,
    refreshBookDetails,
    lastRefreshTime
  };
  
  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
} 
import React, { useState } from 'react';
import { useAnnouncements } from '../context/AnnouncementContext';

function AnnouncementBanner() {
  const { announcements, showBanner } = useAnnouncements();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!showBanner || !announcements || announcements.length === 0) return null;
  
  const currentAnnouncement = announcements[currentIndex];
  
  // Use a lighter yellow gradient theme
  const themeColor = 'bg-gradient-to-r from-yellow-200 to-amber-300';
  
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };
  
  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };
  
  // Calculate remaining time (duration)
  const calculateRemainingTime = () => {
    const now = new Date();
    const endDate = new Date(currentAnnouncement.endDate);
    
    // Calculate the time difference in milliseconds
    const timeDiff = endDate - now;
    
    if (timeDiff <= 0) {
      return 'Ending soon';
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    // Return concise format matching the image (1d 18h remaining)
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h remaining`;
    } else {
      return 'Ending soon';
    }
  };
  
  // Get the remaining time
  const remainingTime = calculateRemainingTime();
  
  return (
    <div className={`relative w-full ${themeColor} text-gray-700 py-3 shadow-sm border-b border-amber-100`}>
      <div className="container mx-auto max-w-6xl px-8 relative">
        {/* Left arrow - moved further left */}
        {announcements.length > 1 && (
          <button 
            onClick={handlePrev}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 text-amber-600/80 hover:text-amber-700 focus:outline-none"
            aria-label="Previous announcement"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Content with timer */}
        <div className="flex items-center justify-between">
          {/* Main content - center aligned */}
          <div className="text-center mx-auto">
            {/* Show title if it exists, with proper styling */}
            {currentAnnouncement.title && (
              <span className="font-bold mr-2 md:mr-3 text-amber-700">
                {currentAnnouncement.title}:
              </span>
            )}
            <span className="font-medium text-sm md:text-base">
              {currentAnnouncement.content}
            </span>
          </div>

          {/* Remaining time badge - right aligned, with more spacing */}
          <div className="whitespace-nowrap ml-6">
            <span className="text-xs bg-amber-100 px-2 py-1 rounded-full text-amber-700 font-medium border border-amber-200">
              {remainingTime}
            </span>
          </div>
        </div>
        
        {/* Right arrow - moved further right */}
        {announcements.length > 1 && (
          <button 
            onClick={handleNext}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-amber-600/80 hover:text-amber-700 focus:outline-none"
            aria-label="Next announcement"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default AnnouncementBanner; 
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const AnnouncementContext = createContext();

export function useAnnouncements() {
  return useContext(AnnouncementContext);
}

export function AnnouncementProvider({ children }) {
  const [announcements, setAnnouncements] = useState([]);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [closedAnnouncements, setClosedAnnouncements] = useState([]);

  // Initialize SignalR connection
  useEffect(() => {
    let isMounted = true;
    let newConnection = null;
    let connectionTimeout = null;
    
    const setupConnection = async () => {
      if (!isMounted) return;
      
      // Clear any pending connection attempts
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      
      // Create connection with optimized settings
      newConnection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5124/announcementHub', {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
          logger: signalR.LogLevel.Error // Reduce logging
        })
        .withAutomaticReconnect([0, 3000, 5000, 10000]) // More efficient reconnect pattern
        .build();
      
      setConnection(newConnection);
      
      // Start connection
      try {
        await newConnection.start();
        if (isMounted) {
          setIsConnected(true);
          console.log('SignalR connection established');
          fetchActiveAnnouncements();
        }
      } catch (err) {
        console.error('Error starting SignalR connection:', err);
        if (isMounted) {
          // Retry after 5 seconds with exponential backoff
          connectionTimeout = setTimeout(setupConnection, 5000);
        }
      }
    };
    
    setupConnection();
    
    // Cleanup function - more robust
    return () => {
      isMounted = false;
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (newConnection) {
        try {
          if (newConnection.state === signalR.HubConnectionState.Connected) {
            newConnection.stop();
          }
        } catch (err) {
          console.error('Error stopping SignalR connection:', err);
        }
      }
    };
  }, []);
  
  // Setup SignalR event handlers once connection is established
  useEffect(() => {
    if (!connection) return;
    
    // Handler for receiving announcements
    connection.on('ReceiveAnnouncement', (announcement) => {
      console.log('Received announcement:', announcement);
      
      // Add to announcements list if not already present
      setAnnouncements(prev => {
        const exists = prev.some(a => a.announcementId === announcement.announcementId);
        if (exists) {
          return prev.map(a => a.announcementId === announcement.announcementId ? announcement : a);
        } else {
          return [announcement, ...prev];
        }
      });
      
      // Set as latest announcement
      setLatestAnnouncement(announcement);
      setShowBanner(true);
    });
    
    // Cleanup on component unmount
    return () => {
      connection.off('ReceiveAnnouncement');
    };
  }, [connection]);
  
  // Add a timer to check for expired announcements every 30 seconds
  useEffect(() => {
    if (!announcements.length) return;
    
    // Check for expired announcements
    const checkExpiredAnnouncements = () => {
      const now = new Date();
      
      setAnnouncements(currentAnnouncements => {
        // Filter out expired announcements
        const validAnnouncements = currentAnnouncements.filter(announcement => {
          const endDate = new Date(announcement.endDate);
          return endDate > now;
        });
        
        // If announcements were removed, update showBanner and latestAnnouncement
        if (validAnnouncements.length !== currentAnnouncements.length) {
          // If we have no valid announcements left, hide the banner
          if (validAnnouncements.length === 0) {
            setShowBanner(false);
            setLatestAnnouncement(null);
          } 
          // Otherwise, update the latest announcement if the current one expired
          else if (latestAnnouncement) {
            const latestExpired = !validAnnouncements.find(
              a => a.announcementId === latestAnnouncement.announcementId
            );
            
            if (latestExpired && validAnnouncements.length > 0) {
              // Set the most recent valid announcement as the latest
              const sortedAnnouncements = [...validAnnouncements].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );
              setLatestAnnouncement(sortedAnnouncements[0]);
            }
          }
        }
        
        return validAnnouncements.length !== currentAnnouncements.length ? 
          validAnnouncements : currentAnnouncements;
      });
    };
    
    // Run the check immediately
    checkExpiredAnnouncements();
    
    // Set up interval to check regularly
    const interval = setInterval(checkExpiredAnnouncements, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [announcements, latestAnnouncement]);
  
  // Function to fetch active announcements
  const fetchActiveAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:5124/api/announcements/active');
      if (response.ok) {
        const data = await response.json();
        
        // Filter out any announcements that the user has closed
        const filteredData = data.filter(
          announcement => !closedAnnouncements.includes(announcement.announcementId)
        );
        
        // Also filter out any expired announcements
        const now = new Date();
        const validAnnouncements = filteredData.filter(announcement => {
          const endDate = new Date(announcement.endDate);
          return endDate > now;
        });
        
        setAnnouncements(validAnnouncements);
        
        // Set the most recent announcement as the latest one
        if (validAnnouncements.length > 0) {
          const sortedData = [...validAnnouncements].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setLatestAnnouncement(sortedData[0]);
          setShowBanner(validAnnouncements.length > 0);
        } else {
          setShowBanner(false);
        }
      }
    } catch (error) {
      console.error('Error fetching active announcements:', error);
    }
  };
  
  // Close banner function - now can close specific announcements
  const closeBanner = (announcementId) => {
    if (announcementId) {
      // Close a specific announcement
      setClosedAnnouncements(prev => [...prev, announcementId]);
      
      // Remove the announcement from the current list
      setAnnouncements(prev => prev.filter(a => a.announcementId !== announcementId));
      
      // If we're closing the latest announcement, update it
      if (latestAnnouncement && latestAnnouncement.announcementId === announcementId) {
        const remaining = announcements.filter(a => a.announcementId !== announcementId);
        if (remaining.length > 0) {
          const sortedRemaining = [...remaining].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setLatestAnnouncement(sortedRemaining[0]);
        } else {
          setLatestAnnouncement(null);
          setShowBanner(false);
        }
      }
      
      // If no announcements left, hide the banner
      if (announcements.length <= 1) {
        setShowBanner(false);
      }
    } else {
      // Close all announcements (legacy behavior)
      setShowBanner(false);
    }
  };
  
  const value = {
    announcements,
    latestAnnouncement,
    showBanner,
    closeBanner,
    isConnected
  };

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
} 
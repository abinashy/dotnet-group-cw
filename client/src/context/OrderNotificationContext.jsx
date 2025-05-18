import React, { createContext, useContext, useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const OrderNotificationContext = createContext();

export function useOrderNotifications() {
  return useContext(OrderNotificationContext);
}

export function OrderNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isStaff, setIsStaff] = useState(false);

  // Get user info from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Parse the JWT token to get user info
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        
        // Try different possible userId fields in the token
        const userId = tokenPayload.nameid || 
                      tokenPayload.sub || 
                      tokenPayload.UserID || 
                      tokenPayload["UserId"] || 
                      tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        
        if (!userId) {
          console.error('Could not find userId in token payload:', tokenPayload);
        } else {
          setUserId(userId);
          console.log('Successfully set userId:', userId);
        }
        
        // Get roles from the correct claim
        const userRoles = tokenPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
        
        // Check if user has staff role - handle both array and string formats
        const isUserStaff = Array.isArray(userRoles) 
          ? userRoles.includes('Staff') || userRoles.includes('Admin')
          : userRoles === 'Staff' || userRoles === 'Admin';
        
        console.log('Token payload:', { 
          roles: userRoles, 
          isStaff: isUserStaff,
          userId: userId,
          originalPayload: tokenPayload
        });
        
        setIsStaff(isUserStaff);
        console.log('Successfully set isStaff flag to:', isUserStaff);
      } catch (err) {
        console.error('Error parsing JWT token:', err);
      }
    } else {
      console.error('No token found in localStorage');
    }
  }, []);

  // Initialize SignalR connection
  useEffect(() => {
    if (!userId) return; // Only connect if we have a userId
    
    let isMounted = true;
    let newConnection = null;
    let connectionTimeout = null;
    
    // Debug logging to help diagnose connection issues
    console.log('OrderNotificationContext init:', { 
      userId, 
      isStaff, 
      tokenAvailable: !!localStorage.getItem('token') 
    });
    
    const setupConnection = async () => {
      if (!isMounted) return;
      
      // Clear any pending connection attempts
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      
      // Create connection
      newConnection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5124/orderNotificationHub', {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
          accessTokenFactory: () => localStorage.getItem('token')
        })
        .withAutomaticReconnect([0, 3000, 5000, 10000])
        .build();
      
      setConnection(newConnection);
      
      // Make connection available globally for other components
      window.connection = newConnection;
      
      // Start connection
      try {
        await newConnection.start();
        if (isMounted) {
          setIsConnected(true);
          console.log('OrderNotification SignalR connection established');
          
          // Join the appropriate groups based on user role
          if (isStaff) {
            await newConnection.invoke('JoinStaffGroup');
            console.log('Joined staff notification group');
          }
          
          // Every user joins their own personal group
          await newConnection.invoke('JoinUserGroup', userId);
          console.log(`Joined user notification group: ${userId}`);
        }
      } catch (err) {
        console.error('Error starting OrderNotification SignalR connection:', err);
        if (isMounted) {
          connectionTimeout = setTimeout(setupConnection, 5000);
        }
      }
    };
    
    setupConnection();
    
    // Cleanup function
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
          console.error('Error stopping OrderNotification SignalR connection:', err);
        }
      }
      // Remove global reference
      window.connection = null;
    };
  }, [userId, isStaff]);
  
  // Setup SignalR event handlers once connection is established
  useEffect(() => {
    if (!connection) return;
    
    console.log('Setting up SignalR event handlers for OrderNotification');
    
    // Utility to detect duplicates
    const isOrderAlreadyInNotifications = (orderId, notificationType, notifications) => {
      return notifications.some(
        n => n.type === notificationType && n.order.orderId === orderId
      );
    };
    
    // Handler for receiving new orders (staff only)
    connection.on('ReceiveNewOrder', (order) => {
      console.log('📣 Received new order notification:', order);
      
      // Ignore notifications that aren't for staff if this isn't a staff user
      if (!isStaff) {
        console.log('Ignoring new order notification (not a staff user)');
        return;
      }
      
      // Play a sound notification
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play error:', e));
      } catch (err) {
        console.log('Could not play notification sound:', err);
      }
      
      // Add to notifications list (avoid duplicates)
      setNotifications(prev => {
        // Check if we already have this notification
        if (isOrderAlreadyInNotifications(order.orderId, 'new-order', prev)) {
          console.log('Duplicate notification, ignoring');
          return prev;
        }
        
        // Add the new notification
        const newNotifications = [
          {
            id: `new-order-${order.orderId}-${Date.now()}`,
            type: 'new-order',
            order,
            timestamp: new Date()
          },
          ...prev
        ];
        console.log('Updated notifications array:', newNotifications);
        return newNotifications;
      });
    });
    
    // Handler for receiving order cancellation notifications (staff only)
    connection.on('ReceiveOrderCancelled', (order) => {
      console.log('📣 Received order cancellation notification:', order);
      
      // Log connection and user details for debugging
      console.log('Connection state:', connection.state);
      console.log('User is staff:', isStaff);
      console.log('User ID:', userId);
      
      // Ignore notifications that aren't for staff if this isn't a staff user
      if (!isStaff) {
        console.log('Ignoring order cancellation notification (not a staff user)');
        return;
      }
      
      // Play a sound notification
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play error:', e));
      } catch (err) {
        console.log('Could not play notification sound:', err);
      }
      
      // Add to notifications list (avoid duplicates)
      setNotifications(prev => {
        // Log current notifications for debugging
        console.log('Current notifications before update:', prev);
        
        // Check if we already have this notification
        if (isOrderAlreadyInNotifications(order.orderId, 'cancelled-order', prev)) {
          console.log('Duplicate notification, ignoring');
          return prev;
        }
        
        // Create the new notification object
        const newNotification = {
          id: `cancelled-order-${order.orderId}-${Date.now()}`,
          type: 'cancelled-order',
          order,
          timestamp: new Date()
        };
        
        // Add the new notification
        const newNotifications = [newNotification, ...prev];
        console.log('Updated notifications array:', newNotifications);
        return newNotifications;
      });
    });
    
    // Handler for receiving order completed notifications (users)
    connection.on('ReceiveOrderCompleted', (order) => {
      console.log('📣 Received order completed notification:', order);
      
      // Log connection and user details for debugging
      console.log('Connection state:', connection.state);
      console.log('User is staff:', isStaff);
      console.log('User ID:', userId);
      
      // Play a sound notification
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play error:', e));
      } catch (err) {
        console.log('Could not play notification sound:', err);
      }
      
      // Add to notifications list (avoid duplicates)
      setNotifications(prev => {
        // Log current notifications for debugging
        console.log('Current notifications before update:', prev);
        
        // Check if we already have this notification
        if (isOrderAlreadyInNotifications(order.orderId, 'completed-order', prev)) {
          console.log('Duplicate notification, ignoring');
          return prev;
        }
        
        // Create the new notification object
        const newNotification = {
          id: `completed-order-${order.orderId}-${Date.now()}`,
          type: 'completed-order',
          order,
          timestamp: new Date()
        };
        
        // Add the new notification
        const newNotifications = [newNotification, ...prev];
        console.log('Updated notifications array:', newNotifications);
        return newNotifications;
      });
    });
    
    // Add a general connection status event handler
    connection.onreconnecting(error => {
      console.log('SignalR reconnecting due to error:', error);
    });
    
    connection.onreconnected(connectionId => {
      console.log('SignalR reconnected with ID:', connectionId);
      
      // Rejoin groups after reconnection
      if (isStaff) {
        connection.invoke('JoinStaffGroup').catch(err => 
          console.error('Error rejoining staff group:', err)
        );
      }
      
      connection.invoke('JoinUserGroup', userId).catch(err => 
        console.error('Error rejoining user group:', err)
      );
    });
    
    connection.onclose(error => {
      console.log('SignalR connection closed:', error);
      setIsConnected(false);
    });
    
    // Cleanup on component unmount
    return () => {
      console.log('Cleaning up SignalR event handlers');
      connection.off('ReceiveNewOrder');
      connection.off('ReceiveOrderCompleted');
      connection.off('ReceiveOrderCancelled');
    };
  }, [connection, isStaff, userId]);
  
  // Close notification function
  const closeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };
  
  const value = {
    notifications,
    closeNotification,
    isConnected
  };

  return (
    <OrderNotificationContext.Provider value={value}>
      {children}
    </OrderNotificationContext.Provider>
  );
} 
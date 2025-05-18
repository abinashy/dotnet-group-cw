import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OrderNotification({ notifications, onClose }) {
  const [visibleNotifications, setVisibleNotifications] = useState({});
  const navigate = useNavigate();
  
  // Log notifications for debugging
  console.log('OrderNotification component received notifications:', notifications);
  
  // Check if the user is staff (check current URL path)
  const isStaffPage = window.location.pathname.startsWith('/staff') || 
                      window.location.pathname.startsWith('/admin');
                      
  console.log('OrderNotification component rendering with path:', window.location.pathname);
  console.log('isStaffPage detected as:', isStaffPage);
  
  // Initialize visibility state for each notification
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const newVisibility = {};
      
      notifications.forEach(notification => {
        if (!(notification.id in visibleNotifications)) {
          newVisibility[notification.id] = true;
        } else {
          newVisibility[notification.id] = visibleNotifications[notification.id];
        }
      });
      
      setVisibleNotifications(newVisibility);
    }
  }, [notifications]);
  
  if (!notifications || notifications.length === 0) return null;
  
  const handleClose = (id) => {
    setVisibleNotifications(prev => ({ 
      ...prev, 
      [id]: false 
    }));
    
    setTimeout(() => {
      onClose(id);
    }, 300); // Give time for animation to complete
  };
  
  const handleViewOrder = (orderId) => {
    // Check if the user is staff (check current URL path)
    const isStaffPage = window.location.pathname.startsWith('/staff');
    
    if (isStaffPage) {
      // Staff should stay on staff dashboard which already shows orders
      handleClose(orderId);
    } else {
      // Regular users navigate to their order details
      navigate(`/myorders`);
      handleClose(orderId);
    }
  };
  
  // Get items count for order
  const getItemsCount = (order) => {
    return order.orderItems ? order.orderItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-4">
      {notifications.map((notification) => {
        // Skip if this notification is not visible
        if (!visibleNotifications[notification.id]) return null;
        
        // Determine if this is a new order or completed order notification
        const isNewOrder = notification.type === 'new-order';
        const isCompletedOrder = notification.type === 'completed-order';
        const isCancelledOrder = notification.type === 'cancelled-order';
        
        // Use different color scheme based on notification type
        let headerBgColor = 'bg-indigo-600';
        if (isCompletedOrder) headerBgColor = 'bg-green-600';
        if (isCancelledOrder) headerBgColor = 'bg-red-600';
        
        const headerTextColor = 'text-white';
        
        // Calculate vertical position based on number of visible popups and this one's position
        const positionIndex = Array.from(Object.entries(visibleNotifications))
          .filter(([, isVisible]) => isVisible)
          .findIndex(([id]) => id === notification.id.toString());
        
        return (
          <div 
            key={notification.id}
            className={`w-80 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out 
                     opacity-100 transform translate-y-0`}
            style={{ 
              zIndex: 50 - positionIndex,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' 
            }}
          >
            <div className={`${headerBgColor} ${headerTextColor} p-3 flex justify-between items-center`}>
              <h3 className="font-bold text-lg">
                {isNewOrder ? 'New Order' : 
                 isCompletedOrder ? 'Order Completed' : 
                 isCancelledOrder ? 'Order Cancelled' : 'Order Update'}
              </h3>
              <button 
                onClick={() => handleClose(notification.id)}
                className="text-white hover:text-gray-300"
                aria-label="Close popup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-3">
                <h4 className="font-semibold text-lg mb-1">Order #{notification.order.orderId}</h4>
                <p className="text-gray-700">
                  {isNewOrder 
                    ? 'A new order has been placed and is waiting for processing.' 
                    : isCompletedOrder 
                    ? 'Your order has been marked as completed and is ready for pickup.'
                    : isCancelledOrder
                    ? 'An order has been cancelled by the customer.'
                    : 'Order status has been updated.'}
                </p>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                <p>Date: {new Date(notification.order.orderDate).toLocaleString()}</p>
                <p>Total Amount: ₹{notification.order.finalAmount.toFixed(2)}</p>
                {isStaffPage && (
                  <>
                    <p>Items: {getItemsCount(notification.order)}</p>
                    {isNewOrder && <p>Claim Code: {notification.order.claimCode}</p>}
                  </>
                )}
              </div>
              
              {/* Only show View Details button for non-cancelled orders */}
              {!isCancelledOrder && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleViewOrder(notification.order.orderId)}
                    className={`px-4 py-2 rounded text-white ${
                      isNewOrder ? 'bg-indigo-600 hover:bg-indigo-700' : 
                      isCompletedOrder ? 'bg-green-600 hover:bg-green-700' : 
                      'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OrderNotification; 
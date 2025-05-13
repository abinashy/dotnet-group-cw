import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import OrderList from '../../components/Staff/OrderList';
import StaffSideNav from '../../components/Staff/StaffSideNav';
import { useOrderNotifications } from '../../context/OrderNotificationContext';

const StaffDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { notifications } = useOrderNotifications();

  // Listen for new order notifications
  useEffect(() => {
    // When a new order notification is received, update the orders list
    if (notifications && notifications.length > 0) {
      const newOrderNotifications = notifications.filter(notif => notif.type === 'new-order');
      
      if (newOrderNotifications.length > 0) {
        // Refresh the orders list to include the new orders
        fetchOrders();
      }
    }
  }, [notifications]);

  const fetchOrders = useCallback(async (search = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const ordersResponse = await axios.get(`http://localhost:5124/api/order${search ? `?search=${encodeURIComponent(search)}` : ''}`, { headers });
      setOrders(ordersResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (search) => {
    fetchOrders(search);
  };

  const handleOrderCompleted = (completedOrder) => {
    setOrders(orders.map(order => 
      order.orderId === completedOrder.orderId ? completedOrder : order
    ));
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StaffSideNav />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              View and manage customer orders
            </p>
            {loading && (
              <div className="mt-2 text-sm text-blue-600">
                <span className="mr-2">Refreshing orders...</span>
                <span className="inline-block animate-spin h-4 w-4 border-t-2 border-b-2 border-blue-500 rounded-full"></span>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg">
            <OrderList 
              orders={orders} 
              onOrderCompleted={handleOrderCompleted} 
              onSearch={handleSearch} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard; 
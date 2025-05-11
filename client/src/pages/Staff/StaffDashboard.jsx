import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OrderList from '../../components/Staff/OrderList';
import StaffSideNav from '../../components/Staff/StaffSideNav';

const StaffDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const ordersResponse = await axios.get('http://localhost:5124/api/order', { headers });
        setOrders(ordersResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOrderCompleted = (completedOrder) => {
    setOrders(orders.map(order => 
      order.orderId === completedOrder.orderId ? completedOrder : order
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
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
          </div>

          <div className="bg-white shadow rounded-lg">
            <OrderList orders={orders} onOrderCompleted={handleOrderCompleted} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard; 
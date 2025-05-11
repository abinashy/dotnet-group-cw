import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserList from '../../components/Staff/UserList';
import OrderList from '../../components/Staff/OrderList';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [users, setUsers] = useState([]);
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

        // Fetch both users and orders
        const [usersResponse, ordersResponse] = await Promise.all([
          axios.get('http://localhost:5124/api/user', { headers }),
          axios.get('http://localhost:5124/api/order', { headers })
        ]);

        setUsers(usersResponse.data);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage users and process orders
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Users
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg">
          {activeTab === 'orders' ? (
            <OrderList orders={orders} onOrderCompleted={handleOrderCompleted} />
          ) : (
            <UserList users={users} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard; 
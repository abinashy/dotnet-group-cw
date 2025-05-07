import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const navigate = useNavigate();

  const fetchUserReviews = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5124/api/review/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUserReviews(response.data);
    } catch (error) {
      setUserReviews([]);
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5124/api/order/history', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    fetchUserReviews();
  }, [fetchUserReviews]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCanceling(orderId);
    try {
      await axios.post(`http://localhost:5124/api/order/${orderId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setOrders(orders => orders.map(o => o.orderId === orderId ? { ...o, status: 'Cancelled', orderHistory: { ...o.orderHistory, status: 'Cancelled' } } : o));
    } catch (error) {
      alert('Failed to cancel order.');
    } finally {
      setCanceling(null);
    }
  };

  const handleLeaveReview = (orderId) => {
    // Redirect to a review page or open a modal (implement as needed)
    navigate(`/review?orderId=${orderId}`);
  };

  // Helper to check if all books in an order are reviewed
  const isOrderReviewed = (order) => {
    if (!userReviews.length) return false;
    return order.orderItems.every(item =>
      userReviews.some(r => r.bookId === (item.bookId || item.book?.bookId))
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen rounded-xl shadow-2xl">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-purple-800 drop-shadow-lg tracking-tight">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-gray-500 text-center text-lg">No orders found.</div>
      ) : (
        <div className="space-y-10">
          {orders.map(order => (
            <div key={order.orderId} className="bg-white shadow-xl rounded-2xl p-8 border border-purple-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                <div>
                  <span className="font-bold text-lg text-purple-700">Order #{order.orderId}</span>
                  <span className="ml-4 text-gray-400 text-sm">{new Date(order.orderDate).toLocaleString()}</span>
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-semibold shadow-sm ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{order.status}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                <div className="text-gray-700">Claim Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-purple-700">{order.claimCode}</span></div>
                <div className="text-gray-700">Total: <span className="font-bold text-green-700">₹{order.finalAmount.toFixed(2)}</span></div>
                <div className="text-gray-700">Status Date: {order.orderHistory && new Date(order.orderHistory.statusDate).toLocaleString()}</div>
                <div className="text-gray-700">Notes: {order.orderHistory && order.orderHistory.notes}</div>
              </div>
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-purple-700 text-lg">Items:</h4>
                <ul className="space-y-2">
                  {order.orderItems.map(item => (
                    <li key={item.orderItemId} className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-2 last:border-b-0">
                      <span className="text-gray-800 font-medium">{item.book ? item.book.title : 'Book'}</span>
                      <span className="text-gray-500">Qty: {item.quantity}</span>
                      <span className="text-green-700 font-semibold">₹{item.unitPrice.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                {order.status === 'Pending' && (
                  <button
                    className="px-8 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-bold shadow hover:from-red-600 hover:to-pink-600 transition-colors duration-200"
                    onClick={() => handleCancelOrder(order.orderId)}
                    disabled={canceling === order.orderId}
                  >
                    {canceling === order.orderId ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
                {order.status === 'Completed' && (
                  isOrderReviewed(order) ? (
                    <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold text-lg shadow">
                      <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Review Submitted
                    </span>
                  ) : (
                    <button
                      className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold shadow hover:from-blue-700 hover:to-purple-700 transition-colors duration-200"
                      onClick={() => handleLeaveReview(order.orderId)}
                    >
                      Leave a Review
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrder;

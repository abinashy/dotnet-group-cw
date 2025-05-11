import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';

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

  // Helper to check if all books in an order are reviewed (order-focused)
  const isOrderReviewed = (order) => {
    if (!userReviews.length) return false;
    return order.orderItems.every(item =>
      userReviews.some(r => r.bookId === (item.bookId || item.book?.bookId) && r.orderId === order.orderId)
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 bg-white min-h-screen rounded-xl shadow-2xl border border-gray-200">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-black drop-shadow-lg tracking-tight">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-gray-400 text-center text-lg">No orders found.</div>
      ) : (
        <div className="space-y-10">
          {orders.map(order => (
            <div key={order.orderId} className="bg-gray-50 shadow-xl rounded-2xl p-8 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                <div>
                  <span className="font-bold text-lg text-black">Order #{order.orderId}</span>
                  <span className="ml-4 text-gray-400 text-sm">{new Date(order.orderDate).toLocaleString()}</span>
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-semibold shadow-sm ${order.status === 'Pending' ? 'bg-gray-200 text-gray-700' : order.status === 'Completed' ? 'bg-green-100 text-green-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-300 text-gray-600'}`}>{order.status}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                <div className="text-gray-700">Claim Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-black">{order.claimCode}</span></div>
                <div className="text-gray-700">Total: <span className="font-bold text-black">₹{order.finalAmount.toFixed(2)}</span></div>
                <div className="text-gray-700">Status Date: {order.orderHistory && new Date(order.orderHistory.statusDate).toLocaleString()}</div>
                <div className="text-gray-700">Notes: {order.orderHistory && order.orderHistory.notes}</div>
              </div>
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-black text-lg">Items:</h4>
                <ul className="space-y-2">
                  {Object.values(_.groupBy(order.orderItems, item => item.book ? item.book.title : 'Book')).map((group, idx) => {
                    const item = group[0];
                    const quantity = group.reduce((sum, i) => sum + i.quantity, 0);
                    return (
                      <li key={item.orderItemId || idx} className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-200 pb-2 last:border-b-0">
                        <span className="text-black font-medium">{item.book ? item.book.title : 'Book'}{quantity > 1 ? ` x${quantity}` : ''}</span>
                        <span className="text-black font-semibold">₹{item.unitPrice.toFixed(2)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                {order.status === 'Pending' && (
                  <button
                    className="px-8 py-2 bg-gray-900 text-white rounded-full font-bold shadow hover:bg-black transition-colors duration-200"
                    onClick={() => handleCancelOrder(order.orderId)}
                    disabled={canceling === order.orderId}
                  >
                    {canceling === order.orderId ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
                {order.status === 'Completed' && (
                  isOrderReviewed(order) ? (
                    <span className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-full font-semibold text-lg shadow">
                      <svg className="w-6 h-6 mr-2 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Review Submitted
                    </span>
                  ) : (
                    <button
                      className="px-8 py-2 bg-black text-white rounded-full font-bold shadow hover:bg-gray-800 transition-colors duration-200"
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

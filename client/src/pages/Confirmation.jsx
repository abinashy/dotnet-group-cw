import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderId = location.state?.orderId;
        if (orderId) {
          const response = await axios.get(`http://localhost:5124/api/order/${orderId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          setOrderDetails(response.data);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate('/home')}
            className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              Order Confirmed!
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Order Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">#{orderDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">
                  {new Date(orderDetails.orderDate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">{orderDetails.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Claim Code:</span>
                <span className="font-medium bg-yellow-100 px-3 py-1 rounded">
                  {orderDetails.claimCode}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Order Items
            </h3>
            {orderDetails.orderItems.some(item => item.discountPercent > 0) ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Book</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Original Price</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Discount</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Price Paid</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-b">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails.orderItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2 font-medium text-gray-900">{item.bookTitle}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{item.discountPercent > 0 ? (<span className="line-through text-gray-400">₹{item.originalPrice.toFixed(2)}</span>) : (<>₹{item.originalPrice.toFixed(2)}</>)}</td>
                        <td className="px-4 py-2">{item.discountPercent > 0 ? `${item.discountPercent.toFixed(0)}%` : '-'}</td>
                        <td className="px-4 py-2 font-bold text-black">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 text-green-700">{item.discountPercent > 0 ? `₹${item.savings.toFixed(2)}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                {orderDetails.orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.bookTitle}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900">₹{item.unitPrice.toFixed(2)} each</p>
                      <p className="font-medium text-gray-900">₹{item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{orderDetails.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discount:</span>
                <span>-₹{orderDetails.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span>₹{orderDetails.finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Important Information</h4>
            <p className="text-yellow-700">
              Please bring your membership ID and the claim code above when picking up your order at the store.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Shop More
            </button>
            <button
              onClick={() => navigate('/myorders')}
              className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order details from location state or fetch from API
    const fetchOrderDetails = async () => {
      try {
        // Assuming we have orderId in location state
        const orderId = location.state?.orderId;
        if (orderId) {
          const response = await axios.get(`/api/orders/${orderId}`);
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

          {orderDetails && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Order Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{orderDetails.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Claim Code:</span>
                  <span className="font-medium">{orderDetails.claimCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">${orderDetails.totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Shop More
            </button>
            <button
              onClick={() => navigate('/orders')}
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

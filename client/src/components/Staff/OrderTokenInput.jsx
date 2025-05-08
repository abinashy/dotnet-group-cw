import React, { useState } from 'react';
import axios from 'axios';
import OrderDetailsModal from './OrderDetailsModal';

const OrderTokenInput = ({ onOrderCompleted }) => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [validatedOrder, setValidatedOrder] = useState(null);

  const validateToken = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess('');
    
    // Validate token format
    if (!/^[A-F0-9]{8}$/.test(token)) {
      setError('Token must be exactly 8 characters (hexadecimal)');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5124/api/order/validate-token', {
        token: token
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.isValid) {
        setSuccess('Token validated successfully!');
        setValidatedOrder(response.data.order);
        setShowModal(true);
        onOrderCompleted?.(response.data.order);
      } else {
        setError('Invalid token. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error validating token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderCompleted = () => {
    setToken('');
    setSuccess('Order marked as completed successfully!');
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Validate Order Token</h2>
        <form onSubmit={validateToken} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              Enter Order Token
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  if (value.length <= 8) {
                    setToken(value);
                    setError('');
                    setSuccess('');
                  }
                }}
                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  error ? 'border-red-300' : success ? 'border-green-300' : ''
                }`}
                placeholder="Enter 8-character token"
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            {success && (
              <p className="mt-2 text-sm text-green-600">{success}</p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading || token.length !== 8}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading || token.length !== 8
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validating...
                </>
              ) : (
                'Validate Token'
              )}
            </button>
          </div>
        </form>
      </div>

      <OrderDetailsModal
        order={validatedOrder}
        show={showModal}
        onClose={() => setShowModal(false)}
        onOrderCompleted={handleOrderCompleted}
      />
    </>
  );
};

export default OrderTokenInput; 
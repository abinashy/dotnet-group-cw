import React, { useState } from 'react';
import axios from 'axios';
import OrderDetailsModal from './OrderDetailsModal';

export default function OrderTokenInput({ onTokenValidated }) {
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
    if (!/^\d{8}$/.test(token)) {
      setError('Token must be exactly 8 digits');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5124/api/orders/validate-token', {
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
        onTokenValidated?.(response.data.order);
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
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Order Token Validation</h5>
          <form onSubmit={validateToken}>
            <div className="input-group">
              <input
                type="text"
                className={`form-control ${error ? 'is-invalid' : success ? 'is-valid' : ''}`}
                placeholder="Enter 8-digit order token"
                value={token}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/\D/g, '');
                  // Limit to 8 digits
                  if (value.length <= 8) {
                    setToken(value);
                    setError('');
                    setSuccess('');
                  }
                }}
                disabled={isLoading}
              />
              <button 
                className="btn btn-primary" 
                type="submit"
                disabled={isLoading || token.length !== 8}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Validating...
                  </>
                ) : (
                  'Validate Token'
                )}
              </button>
            </div>
            {error && <div className="invalid-feedback d-block mt-2">{error}</div>}
            {success && <div className="valid-feedback d-block mt-2">{success}</div>}
          </form>
        </div>
      </div>

      <OrderDetailsModal
        order={validatedOrder}
        show={showModal}
        onClose={() => setShowModal(false)}
        onOrderCompleted={handleOrderCompleted}
      />
    </>
  );
} 
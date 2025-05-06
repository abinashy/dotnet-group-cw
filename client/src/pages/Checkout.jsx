import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Checkout = () => {
  const navigate = useNavigate();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Get the auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Configure axios defaults
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    // Get user ID from token
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    fetch(`http://localhost:5124/api/cart/checkout?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setCheckoutItems(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching cart items:', error);
        setLoading(false);
      });
  }, [navigate]);

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const totalQuantity = checkoutItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handlePlaceOrder = async () => {
    try {
      setSubmitting(true);
      
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      // Prepare order items
      const orderItems = checkoutItems.map(item => ({
        bookId: item.bookId,
        quantity: item.quantity
      }));

      // Create order
      const response = await axios.post('http://localhost:5124/api/order', {
        items: orderItems
      });

      // Get user ID from token
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

      // Clear cart after successful order
      await axios.delete(`http://localhost:5124/api/cart/clear?userId=${userId}`);

      // Navigate to confirmation page with order details
      navigate('/confirmation', { 
        state: { 
          orderId: response.data.orderId,
          claimCode: response.data.claimCode,
          totalAmount: response.data.totalAmount,
          finalAmount: response.data.finalAmount,
          discountAmount: response.data.discountAmount
        }
      });
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to place order. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-lg text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full p-4 gap-8">
        {/* Checkout Items */}
        <section className="flex-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Review Your Order</h2>
          {checkoutItems.length === 0 ? (
            <div className="text-gray-500 text-center py-12">Your cart is empty.</div>
          ) : (
            <ul className="space-y-6">
              {checkoutItems.map((item, idx) => (
                <li key={item.cartId ?? `${item.bookId}-${idx}`} className="flex items-start gap-6 p-4 rounded-lg bg-gray-50 shadow-sm">
                  {item.coverImageUrl ? (
                    <img
                      src={item.coverImageUrl}
                      alt={item.title || `Book #${item.bookId}`}
                      className="w-20 h-28 object-cover rounded shadow"
                    />
                  ) : (
                    <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-900 mb-1">{item.title || `Book #${item.bookId}`}</div>
                    <div className="text-sm text-gray-700 mb-1">By: {item.authorNames && item.authorNames.length > 0 ? item.authorNames.join(", ") : "N/A"}</div>
                    <div className="text-xs text-gray-500 mb-1">Genres: {item.genres && item.genres.length > 0 ? item.genres.join(", ") : "N/A"}</div>
                    <div className="text-xs text-gray-500 mb-1">Format: <span className="font-semibold text-black">{item.format}</span></div>
                    <div className="text-xs text-gray-500 mb-1">Publisher: {item.publisher}</div>
                    <div className="text-xs text-gray-500 mb-1">ISBN: {item.ISBN}</div>
                    <div className="text-xs text-gray-500 mb-1">Year: {item.publicationYear} | Pages: {item.pageCount}</div>
                    <div className="text-xs text-gray-500 mb-1">Language: {item.language}</div>
                    {item.description && <div className="text-xs text-gray-500 mb-1">{item.description}</div>}
                    <div className="text-xs mt-1">
                      <span className={item.availability > 0 ? "text-green-600" : "text-red-600 font-semibold"}>
                        {item.availability > 0 ? `In Stock (${item.availability})` : "Out of Stock"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-700">Qty: <span className="font-semibold text-black">{item.quantity}</span></span>
                      <span className="text-base font-semibold text-blue-700">₹{(item.price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Order Summary */}
        <aside className="w-full md:w-[28rem] bg-white rounded-lg shadow p-8 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h2>
          <ul className="mb-4 divide-y divide-gray-200">
            {checkoutItems.map((item, idx) => (
              <li key={item.cartId ?? `${item.bookId}-${idx}`} className="flex items-center py-2 gap-2">
                <span className="flex-1 text-gray-800 break-words whitespace-normal">{item.title}</span>
                <span className="text-gray-600 min-w-[2.5rem] text-center">x{item.quantity}</span>
                <span className="font-semibold text-gray-900 min-w-[4.5rem] text-right">₹{(item.price || 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mb-2 text-gray-700">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2 text-gray-700">
            <span>Total Items</span>
            <span>{totalQuantity}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mb-6 text-gray-900">
            <span>Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={handlePlaceOrder}
            disabled={submitting || checkoutItems.length === 0}
            className={`w-full py-2 rounded transition ${
              submitting || checkoutItems.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {submitting ? 'Processing...' : 'Place Order'}
          </button>
        </aside>
      </main>
    </div>
  );
};

export default Checkout;

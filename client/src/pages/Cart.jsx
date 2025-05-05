import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CartDrawer = ({ open, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    const userId = tokenData.nameid;
    const fetchUrl = `http://localhost:5124/api/cart?userId=${userId}`;
    console.log('Decoded userId from token:', userId);
    console.log('Cart fetch URL:', fetchUrl);

    fetch(fetchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setCartItems(data);
        console.log('Fetched cart data:', data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching cart items:', error);
        setLoading(false);
      });
  }, [navigate]);

  const total = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-lg text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ maxWidth: 400 }}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Your Cart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">&times;</button>
        </div>
        {cartItems.length === 0 ? (
          <div className="text-gray-500 text-center py-12">Your cart is empty.</div>
        ) : (
          <ul>
            {cartItems.map((item, idx) => (
              <li key={item.cartId ?? `${item.bookId}-${idx}`} className="flex items-center justify-between border-b py-4 last:border-b-0">
                <div className="flex items-center gap-4">
                  {item.coverImageUrl ? (
                    <img
                      src={item.coverImageUrl}
                      alt={item.title || `Book #${item.bookId}`}
                      className="w-16 h-20 object-cover rounded shadow"
                    />
                  ) : null}
                  <div>
                    <div className="font-medium">{item.title || `Book #${item.bookId}`}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Added: {item.addedAt ? new Date(item.addedAt).toLocaleString() : 'Invalid Date'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-lg">
                    ₹{(item.price || 0).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between font-bold text-lg p-4">
          <span>Total Items</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex justify-between font-bold text-lg p-4">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          onClick={() => navigate("/checkout")}
          disabled={cartItems.length === 0}
        >
          Go to Checkout
        </button>
      </aside>
    </>
  );
};

export default CartDrawer;

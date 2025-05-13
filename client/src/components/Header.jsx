import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from '../context/CartContext';
import { theme } from '../theme';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const { openCart } = useCart();
  let userRoles = [];
  if (token) {
    const payload = parseJwt(token);
    userRoles = payload && payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  }
  // Hide header for staff or admin
  if (userRoles && (userRoles.includes?.('Staff') || userRoles.includes?.('Admin') || userRoles === 'Staff' || userRoles === 'Admin')) {
    return null;
  }
  return (
    <header className="p-4 flex justify-between items-center sticky top-0 z-50" 
            style={{ 
                backgroundColor: theme.colors.background.paper,
                boxShadow: theme.shadows.sm,
                borderBottom: `1px solid ${theme.colors.background.default}`
            }}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
        <span className="text-3xl font-extrabold tracking-tight" style={{ color: theme.colors.text.primary }}>BookNook</span>
      </div>
      <nav className="flex items-center gap-6 text-lg font-medium">
        <Link to="/home" className="transition-colors" style={{ color: theme.colors.text.primary }}>Home</Link>
        <Link to="/books" className="transition-colors" style={{ color: theme.colors.text.primary }}>Books</Link>
        {isLoggedIn && (
          <>
            <Link
              to="/wishlist"
              className="relative ml-2 p-2 rounded-full transition shadow-sm"
              style={{ 
                border: `1px solid ${theme.colors.background.default}`,
                backgroundColor: theme.colors.background.paper
              }}
              aria-label="Wishlist"
            >
              <svg 
                className="w-7 h-7 transition-transform duration-300 ease-in-out group-hover:scale-110" 
                viewBox="0 0 24 24" 
                fill={theme.colors.secondary.main}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </Link>
            <button
              onClick={openCart}
              className="relative ml-2 p-2 rounded-full transition shadow-sm"
              style={{ 
                border: `1px solid ${theme.colors.background.default}`,
                backgroundColor: theme.colors.background.paper
              }}
              aria-label="Open cart"
            >
              <svg className="w-7 h-7" fill={theme.colors.text.primary} viewBox="0 0 24 24">
                <path d="M7 20a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7.16 16h9.68c.92 0 1.72-.62 1.93-1.52l2.18-8.7A1 1 0 0 0 20 4H6.21l-.94-2.36A1 1 0 0 0 4.34 1H1v2h2.34l3.6 9.03-1.35 2.44C4.52 15.37 5.48 17 7.16 17zm12.24-10l-1.6 6.4H8.53l-1.1-2h10.7l1.27-4.4z" />
              </svg>
            </button>
          </>
        )}
        {!isLoggedIn ? (
          <Link to="/login" className="ml-4 px-5 py-2 rounded-full bg-black text-white shadow font-bold hover:bg-gray-900 transition">Login</Link>
        ) : (
          <>
            <Link to="/myorders" className="ml-4 px-5 py-2 rounded-full bg-gray-100 text-black font-bold border border-gray-300 shadow hover:bg-gray-200 transition">My Orders</Link>
            <Link to="/logout" className="ml-2 px-5 py-2 rounded-full bg-black text-white shadow font-bold hover:bg-gray-900 transition">Logout</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header; 
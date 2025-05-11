import React from "react";
import { Link, useNavigate } from "react-router-dom";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const Header = ({ onCartClick }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
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
    <header className="bg-white shadow-lg p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
        <img src="/logo192.png" alt="BookNook Logo" className="w-10 h-10 rounded-full shadow border-2 border-gray-300" />
        <span className="text-3xl font-extrabold text-black tracking-tight drop-shadow">BookNook</span>
      </div>
      <nav className="flex items-center gap-6 text-lg font-medium">
        <Link to="/home" className="hover:text-black transition-colors">Home</Link>
        <Link to="/explore" className="hover:text-black transition-colors">Books Catalogue</Link>
        <Link to="/about" className="hover:text-black transition-colors">About Us</Link>
        {isLoggedIn && (
          <button
            onClick={() => {
              console.log('Cart button in header clicked');
              onCartClick();
            }}
            className="relative ml-2 p-2 rounded-full hover:bg-gray-100 transition shadow-sm border border-gray-200"
            aria-label="Open cart"
          >
            {/* Modern cart icon: filled, bold, black/gray */}
            <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 20a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7.16 16h9.68c.92 0 1.72-.62 1.93-1.52l2.18-8.7A1 1 0 0 0 20 4H6.21l-.94-2.36A1 1 0 0 0 4.34 1H1v2h2.34l3.6 9.03-1.35 2.44C4.52 15.37 5.48 17 7.16 17zm12.24-10l-1.6 6.4H8.53l-1.1-2h10.7l1.27-4.4z" />
            </svg>
          </button>
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
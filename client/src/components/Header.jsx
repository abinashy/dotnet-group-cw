import React from "react";

const Header = ({ onCartClick }) => (
  <header className="bg-white shadow p-4 flex justify-between items-center">
    <h1 className="text-2xl font-bold">BookNook</h1>
    <nav className="space-x-6 text-gray-600 flex items-center">
      <a href="/home" className="hover:text-black">HOME</a>
      <a href="/explore" className="hover:text-black">EXPLORE</a>
      <a href="/shop" className="hover:text-black">SHOP</a>
      <a href="/sell" className="hover:text-black">SELL YOUR BOOK</a>
      <button
        onClick={onCartClick}
        className="relative ml-4 p-2 rounded hover:bg-gray-100 transition"
        aria-label="Open cart"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m1-9h2a2 2 0 002-2V7a2 2 0 00-2-2h-2.28a2 2 0 01-1.72-1H7.28a2 2 0 01-1.72 1H3"></path>
        </svg>
      </button>
    </nav>
  </header>
);

export default Header; 
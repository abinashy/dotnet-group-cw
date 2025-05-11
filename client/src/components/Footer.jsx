import React from "react";
import { Link } from "react-router-dom";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const Footer = () => {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  let userRoles = [];
  if (token) {
    const payload = parseJwt(token);
    userRoles = payload && payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  }
  // Hide footer for staff or admin
  if (userRoles && (userRoles.includes?.('Staff') || userRoles.includes?.('Admin') || userRoles === 'Staff' || userRoles === 'Admin')) {
    return null;
  }
  return (
    <footer className="w-full bg-transparent">
      <div className="w-full bg-black rounded-t-3xl p-10 flex flex-col md:flex-row justify-between items-start gap-10 shadow-xl max-w-none">
        {/* Brand & Description */}
        <div className="flex-1 mb-8 md:mb-0">
          <div className="flex items-center gap-3 mb-4">
            
            <span className="text-2xl font-extrabold text-white tracking-tight">BookNook</span>
          </div>
          <p className="text-gray-300 mb-6 max-w-xs">Your one-stop platform to discover, review, and order your favorite books. Join our community of book lovers today!</p>
          <div className="flex gap-4 mt-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full p-2 hover:bg-gray-200 transition" aria-label="Instagram"><svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 2.25a5.25 5.25 0 1 1-5.25 5.25 5.25 5.25 0 0 1 5.25-5.25zm0 1.5a3.75 3.75 0 1 0 3.75 3.75 3.75 3.75 0 0 0-3.75-3.75zm5.25 1.25a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/></svg></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full p-2 hover:bg-gray-200 transition" aria-label="Facebook"><svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M17 2.1A2.1 2.1 0 0 1 19.1 4.2v15.6A2.1 2.1 0 0 1 17 21.9H7A2.1 2.1 0 0 1 4.9 19.8V4.2A2.1 2.1 0 0 1 7 2.1zm-2.1 4.2h-1.4c-.6 0-.7.2-.7.7v1.4h2.1l-.3 2.1h-1.8v5.6h-2.1v-5.6H7.1V8.4h1.1V7.1c0-1.2.7-1.9 1.9-1.9h1.4z"/></svg></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full p-2 hover:bg-gray-200 transition" aria-label="X"><svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M17.53 6.47a.75.75 0 0 0-1.06 0L12 10.94 7.53 6.47A.75.75 0 1 0 6.47 7.53L10.94 12l-4.47 4.47a.75.75 0 1 0 1.06 1.06L12 13.06l4.47 4.47a.75.75 0 0 0 1.06-1.06L13.06 12l4.47-4.47a.75.75 0 0 0 0-1.06z"/></svg></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-full p-2 hover:bg-gray-200 transition" aria-label="YouTube"><svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M21.8 8.001a2.75 2.75 0 0 0-1.94-1.94C18.2 6 12 6 12 6s-6.2 0-7.86.06a2.75 2.75 0 0 0-1.94 1.94A28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.94 1.94C5.8 18 12 18 12 18s6.2 0 7.86-.06a2.75 2.75 0 0 0 1.94-1.94A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.2-3.999zM10 15.5v-7l6 3.5-6 3.5z"/></svg></a>
          </div>
        </div>
        {/* Links */}
        <div className="flex-1 mb-8 md:mb-0">
          <h3 className="text-white font-semibold mb-4">Links</h3>
          <ul className="space-y-2 text-gray-200">
            <li><Link to="/home" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/explore" className="hover:text-white transition-colors">Books Catalogue</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            {isLoggedIn && <li><Link to="/myorders" className="hover:text-white transition-colors">My Orders</Link></li>}
        
          </ul>
        </div>
        {/* Contact */}
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <div className="text-gray-300 text-sm mb-2">BookNook HQ<br />123 Book Lane<br />Novel City, 45678</div>
          <div className="text-gray-300 text-sm mb-2">support@booknook.com</div>
          <div className="text-gray-300 text-sm">+1 (555) 123-4567</div>
        </div>
      </div>
      
    </footer>
  );
};

export default Footer; 
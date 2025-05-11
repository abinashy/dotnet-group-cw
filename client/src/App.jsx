import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import AuthLayout from './components/Auth/AuthLayout';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LogoutHandler from './components/Auth/LogoutHandler';
import BooksCatalogue from './pages/BooksCatalogue';
import BookDetails from './pages/BookDetails';
import './App.css';
import Checkout from './pages/Checkout';
import CartDrawer from './pages/Cart';
import Header from './components/Header';
import React from 'react';
import Confirmation from './pages/Confirmation';
import MyOrder from './pages/MyOrder';
import Review from './pages/Review';
import StaffDashboard from './pages/Staff/StaffDashboard';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';

function App() {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  return (
    <CartProvider>
      <Router>
        <Header />
        {isLoggedIn && <CartDrawer />}
        <Routes>
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginForm />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <RegisterForm />
              </AuthLayout>
            }
          />
          <Route path="/home" element={<Home />} />
          <Route path="/books" element={<BooksCatalogue />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/logout" element={<LogoutHandler />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/myorders" element={<MyOrder />} />
          <Route path="/review" element={<Review />} />
          <Route path="/reviews" element={<Navigate to="/review" />} />
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={['Staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />
          {/* Redirect root to home */}
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App;
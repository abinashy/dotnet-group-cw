import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import AuthLayout from './components/Auth/AuthLayout';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';
import AuthenticatedRoute from './components/Auth/AuthenticatedRoute';
import LogoutHandler from './components/Auth/LogoutHandler';
import BooksCatalogue from './pages/BooksCatalogue';
import BookDetails from './pages/BookDetails';
import './App.css';
import Checkout from './pages/Checkout';
import CartDrawer from './pages/Cart';
import Header from './components/Header';
import React, { useState } from 'react';
import Confirmation from './pages/Confirmation';
import MyOrder from './pages/MyOrder';
import Review from './pages/Review';
import StaffDashboard from './pages/Staff/StaffDashboard';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import { AnnouncementProvider } from './context/AnnouncementContext';
import { OrderNotificationProvider, useOrderNotifications } from './context/OrderNotificationContext';
import AnnouncementBanner from './components/AnnouncementBanner';
import OrderNotification from './components/OrderNotification';
import Wishlist from './pages/Wishlist';
import { WishlistProvider } from './context/WishlistContext';

function AppContent() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  let userRoles = [];
  
  // Get order notifications
  const { notifications, closeNotification } = useOrderNotifications();
  
  // Always use banner mode, no toggle needed
  // eslint-disable-next-line no-unused-vars
  const [displayMode] = useState('banner');
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRoles = payload && payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    } catch (e) {
      console.error('Error parsing token:', e);
    }
  }

  const isAdminOrStaff = userRoles && (
    userRoles.includes?.('Staff') || 
    userRoles.includes?.('Admin') || 
    userRoles === 'Staff' || 
    userRoles === 'Admin'
  );

  const shouldShowFooter = !isAdminOrStaff && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/staff');

  // Don't show announcements in admin or staff pages
  const shouldShowAnnouncements = !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/staff');

  return (
    <>
      {/* Announcement section - banner only */}
      {shouldShowAnnouncements && <AnnouncementBanner />}
      
      {/* Order notifications */}
      {isLoggedIn && <OrderNotification notifications={notifications} onClose={closeNotification} />}
      
      <Header />
      {isLoggedIn && <CartDrawer />}
      
      <Routes>
        <Route
          path="/login"
          element={
            <AuthLayout>
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <PublicRoute>
                <RegisterForm />
              </PublicRoute>
            </AuthLayout>
          }
        />
        <Route 
          path="/home" 
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          } 
        />
        <Route 
          path="/books" 
          element={
            <PublicRoute>
              <BooksCatalogue />
            </PublicRoute>
          } 
        />
        <Route 
          path="/books/:id" 
          element={
            <PublicRoute>
              <BookDetails />
            </PublicRoute>
          } 
        />
        <Route path="/logout" element={<LogoutHandler />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/checkout" 
          element={
            <AuthenticatedRoute>
              <Checkout />
            </AuthenticatedRoute>
          } 
        />
        <Route 
          path="/confirmation" 
          element={
            <AuthenticatedRoute>
              <Confirmation />
            </AuthenticatedRoute>
          } 
        />
        <Route 
          path="/myorders" 
          element={
            <AuthenticatedRoute>
              <MyOrder />
            </AuthenticatedRoute>
          } 
        />
        <Route 
          path="/orders/:orderId" 
          element={
            <AuthenticatedRoute>
              <MyOrder />
            </AuthenticatedRoute>
          } 
        />
        <Route 
          path="/review" 
          element={
            <AuthenticatedRoute>
              <Review />
            </AuthenticatedRoute>
          } 
        />
        <Route path="/reviews" element={<Navigate to="/review" />} />
        <Route 
          path="/staff" 
          element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wishlist" 
          element={
            <AuthenticatedRoute>
              <Wishlist />
            </AuthenticatedRoute>
          } 
        />
        {/* Redirect root to home */}
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
      {shouldShowFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <CartProvider>
  <WishlistProvider>
    <AnnouncementProvider>
      <OrderNotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </OrderNotificationProvider>
    </AnnouncementProvider>
  </WishlistProvider>
</CartProvider>
  );
}

export default App;
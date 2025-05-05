import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import AuthLayout from './components/Auth/AuthLayout';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LogoutHandler from './components/Auth/LogoutHandler';
import './App.css';
import Checkout from '../Checkout';

function App() {
  return (
    <Router>
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
        {/* Redirect root to home */}
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;
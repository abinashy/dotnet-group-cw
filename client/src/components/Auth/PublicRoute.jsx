import { Navigate, useLocation } from 'react-router-dom';

export default function PublicRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  if (!token) return children;

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  const payload = parseJwt(token);
  const userRoles = payload && payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  
  // If user is admin or staff, redirect to their respective dashboard
  if (userRoles) {
    if (Array.isArray(userRoles)) {
      if (userRoles.includes('Admin')) {
        return <Navigate to="/admin" />;
      }
      if (userRoles.includes('Staff')) {
        return <Navigate to="/staff" />;
      }
    } else {
      if (userRoles === 'Admin') {
        return <Navigate to="/admin" />;
      }
      if (userRoles === 'Staff') {
        return <Navigate to="/staff" />;
      }
    }
  }

  // If user is logged in and trying to access login/register pages, redirect to home
  if (location.pathname === '/login' || location.pathname === '/register') {
    return <Navigate to="/home" />;
  }

  return children;
} 
import { Navigate } from 'react-router-dom';

export default function AuthenticatedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }

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

  return children;
} 
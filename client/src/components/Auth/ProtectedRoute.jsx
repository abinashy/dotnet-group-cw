import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole, allowedRoles }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  const payload = parseJwt(token);
  const userRoles = payload && payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  
  // Handle both single role and multiple roles
  const hasRequiredRole = requiredRole && (
    Array.isArray(userRoles) 
      ? userRoles.includes(requiredRole)
      : userRoles === requiredRole
  );

  const hasAllowedRole = allowedRoles && (
    Array.isArray(userRoles)
      ? userRoles.some(role => allowedRoles.includes(role))
      : allowedRoles.includes(userRoles)
  );

  if (!hasRequiredRole && !hasAllowedRole) {
    return <Navigate to="/home" />;
  }

  return children;
} 
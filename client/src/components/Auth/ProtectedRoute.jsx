import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
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
  const roles = payload && payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  const hasRole = Array.isArray(roles)
    ? roles.includes(requiredRole)
    : roles === requiredRole;

  if (!hasRole) return <Navigate to="/home" />;
  return children;
} 
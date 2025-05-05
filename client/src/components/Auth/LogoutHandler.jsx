import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LogoutHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        console.log('Attempting to logout...');
        const response = await axios.post(
          'http://localhost:5124/api/Auth/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Logout response:', response.data);
      } catch (error) {
        console.error('Logout error:', error);
        console.error('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      } finally {
        // Always remove token and redirect to login
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    logout();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Logging out...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    </div>
  );
} 
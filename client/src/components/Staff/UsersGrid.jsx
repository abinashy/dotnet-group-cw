import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserDetailsModal from './UserDetailsModal';

export default function UsersGrid() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('member'); // 'member' or 'staff'

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5124/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
      console.log('Fetched users:', response.data);
    } catch (err) {
      setError('Error fetching users. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      console.log('Sample user object:', users[0]);
    }
  }, [users]);

  // Robust role extraction
  const getRoles = (user) => {
    if (Array.isArray(user.roles)) return user.roles.map(r => r.toLowerCase());
    if (typeof user.role === 'string') return [user.role.toLowerCase()];
    if (user.userRole) return [user.userRole.toLowerCase()];
    if (user.type) return [user.type.toLowerCase()];
    return [];
  };

  const filteredUsers = users.filter(user => {
    // Fallback: if no role property, show all users
    if (user.role === undefined && user.userRole === undefined && user.type === undefined) return true;
    // Numeric role logic
    const role = user.role ?? user.userRole ?? user.type;
    if (role === 3) return false;
    if (activeTab === 'member' && role !== 1) return false;
    if (activeTab === 'staff' && role !== 2) return false;
    const idMatch = String(user.id || user.userId).toLowerCase().includes(searchTerm.toLowerCase());
    const nameMatch = (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
    return idMatch || nameMatch;
  });

  const handleViewDetails = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5124/api/users/${userId}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSelectedUser(response.data);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-0">All Users (Raw Data)</h5>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                {users[0] && Object.keys(users[0]).map(key => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={users[0] ? Object.keys(users[0]).length : 1} className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={users[0] ? Object.keys(users[0]).length : 1} className="text-center text-danger">{error}</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={users[0] ? Object.keys(users[0]).length : 1} className="text-center">No users found</td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.id || user.userId || idx}>
                    {Object.keys(user).map(key => (
                      <td key={key}>{String(user[key])}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserDetailsModal
        user={selectedUser}
        show={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
} 
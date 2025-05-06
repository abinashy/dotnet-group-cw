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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5124/api/users?search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      setError('Error fetching users. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="card-title mb-0">Users</h5>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Total Orders</th>
                <th>Member Since</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="text-center text-danger">{error}</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No users found</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{`${user.firstName} ${user.lastName}`}</td>
                    <td>{user.email}</td>
                    <td>{user.totalOrders}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleViewDetails(user.id)}
                      >
                        View Details
                      </button>
                    </td>
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'orderDate',
    direction: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
        ...(filters.status && { status: filters.status })
      });

      const response = await axios.get(`http://localhost:5124/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setOrders(response.data.items);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages
      }));
    } catch (err) {
      setError('Error fetching orders. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters, sortConfig, pagination.page]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'fulfilled':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-4">Recent Orders</h5>

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-md-3">
            <label className="form-label">Start Date</label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              className="form-control"
              placeholderText="Select start date"
              isClearable
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">End Date</label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              className="form-control"
              placeholderText="Select end date"
              isClearable
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th onClick={() => handleSort('orderId')} style={{ cursor: 'pointer' }}>
                  Order ID
                  {sortConfig.key === 'orderId' && (
                    <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th>Member Email</th>
                <th onClick={() => handleSort('booksCount')} style={{ cursor: 'pointer' }}>
                  Books
                  {sortConfig.key === 'booksCount' && (
                    <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('orderDate')} style={{ cursor: 'pointer' }}>
                  Order Date
                  {sortConfig.key === 'orderDate' && (
                    <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('totalAmount')} style={{ cursor: 'pointer' }}>
                  Total Amount
                  {sortConfig.key === 'totalAmount' && (
                    <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Status
                  {sortConfig.key === 'status' && (
                    <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
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
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No orders found</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.orderId}>
                    <td>{order.orderId}</td>
                    <td>{order.memberEmail}</td>
                    <td>{order.booksCount}</td>
                    <td>{new Date(order.orderDate).toLocaleString()}</td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <nav aria-label="Page navigation" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
            </li>
            {[...Array(pagination.totalPages)].map((_, index) => (
              <li key={index + 1} className={`page-item ${pagination.page === index + 1 ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
} 
import React from 'react';

export default function UserDetailsModal({ user, show, onClose }) {
  if (!show || !user) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">User Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* User Information */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h6>User Information</h6>
                <p><strong>Name:</strong> {`${user.firstName} ${user.lastName}`}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>

            {/* Order History */}
            <div className="mb-4">
              <h6>Order History</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.orderHistory.map(order => (
                      <tr key={order.orderId}>
                        <td>#{order.orderId}</td>
                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>{order.itemsCount}</td>
                        <td>${order.totalAmount.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${
                            order.status === 'Fulfilled' ? 'bg-success' :
                            order.status === 'Pending' ? 'bg-warning' :
                            'bg-danger'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Whitelisted Books */}
            <div>
              <h6>Whitelisted Books</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Added Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.whitelistedBooks.map(book => (
                      <tr key={book.bookId}>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{new Date(book.addedDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
} 
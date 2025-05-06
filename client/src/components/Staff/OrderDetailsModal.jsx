import React from 'react';
import axios from 'axios';

export default function OrderDetailsModal({ order, show, onClose, onOrderCompleted }) {
  if (!show || !order) return null;

  const handleMarkAsCompleted = async () => {
    try {
      await axios.put(`http://localhost:5124/api/orders/${order.orderId}/complete`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      onOrderCompleted?.();
      onClose();
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Order Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <h6>Order Information</h6>
                <p><strong>Order ID:</strong> {order.orderId}</p>
                <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                <p><strong>Status:</strong> {order.status}</p>
              </div>
              <div className="col-md-6">
                <h6>Member Information</h6>
                <p><strong>Member Name:</strong> {order.memberName}</p>
                <p><strong>Pickup Deadline:</strong> {new Date(order.pickupDeadline).toLocaleString()}</p>
              </div>
            </div>

            <h6>Order Items</h6>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.bookTitle}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unitPrice.toFixed(2)}</td>
                      <td>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="row mt-3">
              <div className="col-md-6 offset-md-6">
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Subtotal:</strong></td>
                      <td className="text-end">${order.totalAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td><strong>Discount:</strong></td>
                      <td className="text-end">-${order.discountAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td><strong>Final Amount:</strong></td>
                      <td className="text-end">${order.finalAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            <button 
              type="button" 
              className="btn btn-success" 
              onClick={handleMarkAsCompleted}
              disabled={order.status === 'Fulfilled'}
            >
              Mark as Completed
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
} 
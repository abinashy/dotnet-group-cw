import React, { useState } from 'react';
import OrderDetailsModal from './OrderDetailsModal';
import axios from 'axios';

const OrderList = ({ orders, onOrderCompleted }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [resendStatus, setResendStatus] = useState({});

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order =>
    searchOrderId.trim() === '' || String(order.orderId).includes(searchOrderId.trim())
  );

  const handleResendEmail = async (orderId) => {
    setResendStatus((prev) => ({ ...prev, [orderId]: 'loading' }));
    try {
      await axios.post(`http://localhost:5124/api/order/${orderId}/resend-confirmation`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      setResendStatus((prev) => ({ ...prev, [orderId]: 'success' }));
      setTimeout(() => setResendStatus((prev) => ({ ...prev, [orderId]: undefined })), 2000);
    } catch (error) {
      console.error('Error resending email:', error);
      setResendStatus((prev) => ({ ...prev, [orderId]: 'error' }));
      setTimeout(() => setResendStatus((prev) => ({ ...prev, [orderId]: undefined })), 2000);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Search by Order ID"
          value={searchOrderId}
          onChange={e => setSearchOrderId(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500 text-sm">Showing {filteredOrders.length} of {orders.length} orders</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.orderId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  #{order.orderId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.userId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.customerName || order.userName || (order.firstName && order.lastName ? `${order.firstName} ${order.lastName}` : order.userId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(order.orderDate).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{order.finalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    View Details
                  </button>
                  {order.status.toLowerCase() === 'pending' && (
                    <button
                      onClick={() => handleResendEmail(order.orderId)}
                      className="text-yellow-600 hover:text-yellow-900 border border-yellow-400 rounded px-2 py-1 ml-1"
                      disabled={resendStatus[order.orderId] === 'loading'}
                    >
                      {resendStatus[order.orderId] === 'loading' ? 'Sending...' : 'Resend Email'}
                    </button>
                  )}
                  {resendStatus[order.orderId] === 'success' && (
                    <span className="ml-2 text-green-600">Sent!</span>
                  )}
                  {resendStatus[order.orderId] === 'error' && (
                    <span className="ml-2 text-red-600">Failed!</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <OrderDetailsModal
        order={selectedOrder}
        show={showModal}
        onClose={() => setShowModal(false)}
        onOrderCompleted={onOrderCompleted}
      />
    </>
  );
};

export default OrderList; 
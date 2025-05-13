import React from 'react';

const OrderDetailsModal = ({ order, show, onClose }) => {
  if (!show || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Order Details
                </h3>
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Order ID</p>
                      <p className="mt-1 text-sm text-gray-900">#{order.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="mt-1 text-sm text-gray-900">{order.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Order Date</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(order.orderDate).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Claim Code</p>
                      <p className="mt-1 text-sm font-mono bg-gray-100 px-1 rounded">{order.claimCode}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                    <div className="border-t border-gray-200">
                      {order.orderItems.map((item, index) => (
                        <div key={index} className="py-3 flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.bookTitle}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">₹{item.unitPrice.toFixed(2)} each</p>
                            <p className="text-sm font-medium text-gray-900">
                              ₹{item.totalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-500">Subtotal</p>
                      <p className="text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <p className="text-gray-500">Discount</p>
                      <p className="text-gray-900">-₹{order.discountAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-base font-medium mt-2">
                      <p className="text-gray-900">Total</p>
                      <p className="text-gray-900">₹{order.finalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal; 
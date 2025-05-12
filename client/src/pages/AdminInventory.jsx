import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminInventory() {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');

  useEffect(() => {
    fetchInventories();
  }, []);

  const fetchInventories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5124/api/Inventory');
      setInventories(response.data);
    } catch (err) {
      setError('Failed to fetch inventory data');
      console.error('Error fetching inventories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (inventory) => {
    setEditingQuantity(inventory.inventoryId);
    setNewQuantity((inventory.quantity !== undefined && inventory.quantity !== null) ? inventory.quantity.toString() : '');
  };

  const handleSaveClick = async (inventoryId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Ensure quantity is a valid number
      const quantityToSend = Number.isNaN(Number(newQuantity)) || newQuantity === '' ? 0 : parseInt(newQuantity, 10);

      await axios.put(
        `http://localhost:5124/api/Inventory/${inventoryId}`,
        { quantity: quantityToSend },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh the inventory list
      await fetchInventories();
      setEditingQuantity(null);
    } catch (err) {
      console.error('Error updating inventory:', err);
      alert('Failed to update inventory quantity');
    }
  };

  const handleCancelClick = () => {
    setEditingQuantity(null);
    setNewQuantity('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISBN
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventories.map((inventory) => (
                <tr key={inventory.inventoryId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{inventory.bookTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{inventory.isbn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingQuantity === inventory.inventoryId ? (
                      <input
                        type="number"
                        min="0"
                        value={newQuantity !== undefined && newQuantity !== null ? newQuantity : ''}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        className="w-20 px-2 py-1 border rounded-md"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{inventory.quantity}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(inventory.lastUpdated).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingQuantity === inventory.inventoryId ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveClick(inventory.inventoryId)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelClick}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(inventory)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {inventories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No inventory records found.
          </div>
        )}
      </div>
    </div>
  );
} 
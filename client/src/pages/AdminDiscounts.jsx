import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5124/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const DiscountSchema = Yup.object().shape({
  bookId: Yup.number().required('Book is required'),
  discountPercentage: Yup.number()
    .min(0, 'Discount must be at least 0%')
    .max(100, 'Discount cannot exceed 100%')
    .required('Discount percentage is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
  isOnSale: Yup.boolean(),
});

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [books, setBooks] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [discountsRes, booksRes] = await Promise.all([
        api.get('/Discounts'),
        api.get('/Books')
      ]);
      setDiscounts(discountsRes.data);
      setBooks(booksRes.data);
    } catch (error) {
      const errorMessage = error.response?.data || 'Failed to fetch data. Please try again.';
      setError(errorMessage);
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDiscount = async (values, { resetForm }) => {
    try {
      setFormError(null);
      setFormSuccess(null);
      // Convert dates to UTC
      const discountData = {
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString()
      };
      await api.post('/Discounts', discountData);
      setIsAddModalOpen(false);
      resetForm();
      fetchData();
      setFormError(null); // Clear any previous error
      setFormSuccess('Discount added successfully!');
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (error) {
      const errorMessage = error.response?.data || 'Failed to add discount. Please try again.';
      setFormError(errorMessage);
      setFormSuccess(null);
      console.error('Error adding discount:', error);
    }
  };

  const handleDeleteDiscount = async (discountId) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) {
      return;
    }

    try {
      await api.delete(`/Discounts/${discountId}`);
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data || 'Failed to delete discount. Please try again.';
      alert(errorMessage);
      console.error('Error deleting discount:', error);
    }
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
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {formSuccess && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {formSuccess}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Discount Management</h1>
        <button
          onClick={() => {
            setIsAddModalOpen(true);
            setFormError(null);
            setFormSuccess(null);
          }}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Add New Discount
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discounts.map((discount) => (
                <tr key={discount.discountId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {books.find(b => b.bookId === discount.bookId)?.title || 'Unknown Book'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{discount.discountPercentage}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      discount.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {discount.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {discount.isOnSale && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        On Sale
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteDiscount(discount.discountId)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {discounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No discounts found. Add your first discount to get started.
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Discount</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormError(null);
                  setFormSuccess(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {formError}
              </div>
            )}

            <Formik
              initialValues={{
                bookId: '',
                discountPercentage: '',
                startDate: '',
                endDate: '',
                isOnSale: false,
              }}
              validationSchema={DiscountSchema}
              onSubmit={handleAddDiscount}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Book</label>
                    <Field
                      name="bookId"
                      as="select"
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                    >
                      <option value="">Select a book</option>
                      {books.map((book) => (
                        <option key={book.bookId} value={book.bookId}>
                          {book.title}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="bookId" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Discount Percentage</label>
                    <Field
                      name="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                    />
                    <ErrorMessage name="discountPercentage" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <Field
                      name="startDate"
                      type="date"
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                    />
                    <ErrorMessage name="startDate" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <Field
                      name="endDate"
                      type="date"
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                    />
                    <ErrorMessage name="endDate" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="flex items-center">
                    <Field
                      name="isOnSale"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-gray-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Mark as On Sale</label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Discount'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
} 
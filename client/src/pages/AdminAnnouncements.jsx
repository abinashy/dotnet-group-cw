import React, { useEffect, useState } from 'react';

const initialForm = {
  title: '',
  content: '',
  startDate: '',
  endDate: '',
  isActive: true,
  announceNow: false
};

export default function AdminAnnouncements() {
  const [form, setForm] = useState(initialForm);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const token = localStorage.getItem('token');

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5124/api/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch announcements: ${res.status}`);
      }
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error loading announcements:', err);
      setError('Failed to load announcements: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateForm = () => {
    const errors = {};
    const now = new Date();
    if (!form.announceNow) {
      if (!form.startDate) {
        errors.startDate = 'Start date is required';
      } else if (new Date(form.startDate) < now.setSeconds(0,0)) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }
    if (!form.endDate) {
      errors.endDate = 'End date is required';
    } else if (!form.announceNow && form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
      errors.endDate = 'End date cannot be earlier than start date';
    } else if (form.announceNow && new Date(form.endDate) < new Date()) {
      errors.endDate = 'End date cannot be in the past';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      setIsLoading(true);
      let payload;
      const now = new Date();
      if (form.announceNow) {
        const startDate = new Date();
        const endDate = new Date(form.endDate);
        payload = {
          title: form.title,
          content: form.content,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isActive: startDate <= endDate && startDate <= now && now < endDate,
        };
      } else {
        const startDate = new Date(form.startDate);
        const endDate = new Date(form.endDate);
        payload = {
          title: form.title,
          content: form.content,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isActive: startDate <= endDate && startDate <= now && now < endDate,
        };
      }
      const res = await fetch('http://localhost:5124/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to create announcement: ${res.status} ${errorData}`);
      }
      
      // Successfully created announcement
      await res.json();
      
      setSuccess('Announcement created successfully!');
      setForm(initialForm);
      setIsAddModalOpen(false);
      await fetchAnnouncements();
    } catch (err) {
      console.error('Create error:', err);
      setError(err.message || 'Failed to create announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    console.log('Submitting update form for announcement ID:', currentAnnouncementId);
    
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      let payload;
      const now = new Date();
      if (form.announceNow) {
        const startDate = new Date();
        const endDate = new Date(form.endDate);
        payload = {
          title: form.title,
          content: form.content,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isActive: startDate <= endDate && startDate <= now && now < endDate,
        };
      } else {
        const startDate = new Date(form.startDate);
        const endDate = new Date(form.endDate);
        payload = {
          title: form.title,
          content: form.content,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isActive: startDate <= endDate && startDate <= now && now < endDate,
        };
      }

      // Display loading feedback
      setIsLoading(true);
      
      // Log the request details
      console.log('Update request details:', {
        id: currentAnnouncementId,
        payload: payload,
        tokenPresent: !!token
      });

      // Use the proper RESTful PUT method for updates
      const updateUrl = `http://localhost:5124/api/announcements/${currentAnnouncementId}`;
      console.log('Using standard PUT endpoint:', updateUrl);
      
      const res = await fetch(updateUrl, {
        method: 'PUT',  // Using proper RESTful PUT method
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', {
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries([...res.headers.entries()]),
          body: errorText
        });
        
        if (res.status === 404) {
          throw new Error(`Announcement with ID ${currentAnnouncementId} not found. This may be due to the announcement being deleted by another user or a data mismatch.`);
        }
        
        throw new Error(`Failed to update announcement: ${res.status} ${res.statusText}\nDetails: ${errorText}`);
      }
      
      setSuccess('Announcement updated successfully!');
      setForm(initialForm);
      setIsEditModalOpen(false);
      await fetchAnnouncements();
    } catch (e) {
      console.error('Update error:', e);
      setError(e.message || 'Failed to update announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (id) => {
    setError('');
    setSuccess('');
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5124/api/announcements/${id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to publish announcement: ${res.status} ${errorData}`);
      }
      setSuccess('Announcement published successfully!');
      await fetchAnnouncements();
    } catch (err) {
      console.error('Publish error:', err);
      setError(err.message || 'Failed to publish announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5124/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to delete announcement: ${res.status} ${errorData}`);
      }
      setSuccess('Announcement deleted successfully!');
      await fetchAnnouncements();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (announcement) => {
    // Format dates for datetime-local input
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      
      // Format to local timezone YYYY-MM-DDTHH:MM format
      // Get year, month, day, hours, minutes with proper padding
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      // Return the formatted string
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    console.log('Opening edit modal for announcement:', announcement);
    console.log('Announcement ID:', announcement.announcementId);
    
    setCurrentAnnouncementId(announcement.announcementId);
    setForm({
      title: announcement.title,
      content: announcement.content,
      startDate: formatDate(announcement.startDate),
      endDate: formatDate(announcement.endDate),
      isActive: announcement.isActive,
      announceNow: false, // Set to false for editing
    });
    setFormErrors({});
    setError('');
    setSuccess('');
    setIsEditModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <button
          onClick={() => {
            setIsAddModalOpen(true);
            setError('');
            setSuccess('');
            setForm(initialForm);
          }}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          disabled={isLoading}
        >
          Add New Announcement
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcements.map(a => {
                const isActive = new Date(a.startDate) <= new Date() && new Date() < new Date(a.endDate);
                return (
                  <tr key={a.announcementId}>
                    <td className="px-6 py-4 whitespace-nowrap">{a.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{a.content}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(a.startDate).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(a.endDate).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{isActive ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button 
                        onClick={() => openEditModal(a)} 
                        className="bg-indigo-600 text-white px-2 py-1 rounded"
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      {!isActive && new Date(a.startDate) > new Date() && (
                        <button 
                          onClick={() => handlePublish(a.announcementId)} 
                          className="bg-green-600 text-white px-2 py-1 rounded"
                          disabled={isLoading}
                        >
                          Publish Now
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(a.announcementId)} 
                        className="bg-red-600 text-white px-2 py-1 rounded"
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!isLoading && announcements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No announcements found. Add your first announcement to get started.
          </div>
        )}
      </div>

      {/* Add Announcement Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Announcement</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input name="title" value={form.title} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500" required maxLength={200} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea name="content" value={form.content} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500" required />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="announceNow" checked={form.announceNow} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-gray-500" id="announceNow" />
                <label htmlFor="announceNow" className="ml-2 block text-sm text-gray-700">Announce Now</label>
              </div>
              {!form.announceNow && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500" required />
                  {formErrors.startDate && <div className="mt-1 text-sm text-red-600">{formErrors.startDate}</div>}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500" required />
                {formErrors.endDate && <div className="mt-1 text-sm text-red-600">{formErrors.endDate}</div>}
              </div>
              
              <div className="text-right">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Announcement</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input name="title" value={form.title} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500" required maxLength={200} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea name="content" value={form.content} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500" required />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="announceNow" checked={form.announceNow} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-gray-500" id="editAnnounceNow" />
                <label htmlFor="editAnnounceNow" className="ml-2 block text-sm text-gray-700">Update and Announce Now</label>
              </div>
              {!form.announceNow && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500" required />
                  {formErrors.startDate && <div className="mt-1 text-sm text-red-600">{formErrors.startDate}</div>}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500" required />
                {formErrors.endDate && <div className="mt-1 text-sm text-red-600">{formErrors.endDate}</div>}
              </div>
              
              <div className="text-right">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
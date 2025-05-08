import { Routes, Route } from 'react-router-dom';
import AdminSideNav from '../components/Admin/AdminSideNav';
import AdminBooks from './AdminBooks';
import AdminInventory from './AdminInventory';
import AdminDiscounts from './AdminDiscounts';
// import other admin pages as needed

function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-2">Total Books</h3>
          <p className="text-3xl font-semibold">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-2">Active Users</h3>
          <p className="text-3xl font-semibold">567</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-2">Total Orders</h3>
          <p className="text-3xl font-semibold">890</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSideNav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="discounts" element={<AdminDiscounts />} />
          {/* Add other admin routes here */}
        </Routes>
      </main>
    </div>
  );
}

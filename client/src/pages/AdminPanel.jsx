import { Routes, Route } from 'react-router-dom';
import AdminSideNav from '../components/Admin/AdminSideNav';
import AdminBooks from './AdminBooks';
// import other admin pages as needed

function AdminDashboard() {
  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
      <h1 className="text-4xl font-extrabold mb-4 text-orange-600">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6 text-center">Welcome to the BookNook admin panel. Use the sidebar to manage books, users, and more.</p>
      <a
        href="#"
        className="inline-block mb-4 text-orange-500 hover:text-orange-700 underline text-lg"
      >
        Need help? Visit our docs
      </a>
      <button
        className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold shadow hover:bg-orange-600 transition"
      >
        Example Action
      </button>
    </div>
  );
}

export default function AdminPanel() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <AdminSideNav />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="books" element={<AdminBooks />} />
          {/* Add other admin routes here */}
        </Routes>
      </main>
    </div>
  );
}

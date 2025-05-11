import { Routes, Route } from 'react-router-dom';
import AdminSideNav from '../components/Admin/AdminSideNav';
import AdminBooks from './AdminBooks';
import AdminInventory from './AdminInventory';
import AdminDiscounts from './AdminDiscounts';
import AdminAnnouncements from './AdminAnnouncements';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const [stats, setStats] = useState({ books: 0, users: 0, orders: 0 });
  const [orderData, setOrderData] = useState({ labels: [], datasets: [] });
  const [statusData, setStatusData] = useState({ labels: [], datasets: [] });
  const [topBooksData, setTopBooksData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [booksRes, usersRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5124/api/books'),
          axios.get('http://localhost:5124/api/user'),
          axios.get('http://localhost:5124/api/order', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);
        setStats({
          books: booksRes.data.length,
          users: usersRes.data.length,
          orders: ordersRes.data.length
        });
        // Orders per month
        const orders = ordersRes.data;
        const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'short' }));
        const orderCounts = Array(12).fill(0);
        orders.forEach(order => {
          const d = new Date(order.orderDate);
          orderCounts[d.getMonth()]++;
        });
        setOrderData({
          labels: months,
          datasets: [
            {
              label: 'Orders per Month',
              data: orderCounts,
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderRadius: 8,
              barThickness: 32
            }
          ]
        });
        // Order status distribution
        const statusCounts = { Completed: 0, Pending: 0, Cancelled: 0 };
        orders.forEach(order => {
          const status = (order.status || '').toLowerCase();
          if (status === 'completed') statusCounts.Completed++;
          else if (status === 'pending') statusCounts.Pending++;
          else if (status === 'cancelled') statusCounts.Cancelled++;
        });
        setStatusData({
          labels: ['Completed', 'Pending', 'Cancelled'],
          datasets: [
            {
              label: 'Order Status',
              data: [statusCounts.Completed, statusCounts.Pending, statusCounts.Cancelled],
              backgroundColor: [
                'rgba(34,197,94,0.7)', // green
                'rgba(251,191,36,0.7)', // yellow
                'rgba(239,68,68,0.7)' // red
              ],
              borderWidth: 1
            }
          ]
        });
        // Top 5 books by order count
        const bookCounts = {};
        orders.forEach(order => {
          (order.orderItems || []).forEach(item => {
            const title = item.BookTitle || item.bookTitle || (item.Book && item.Book.Title) || 'Unknown';
            bookCounts[title] = (bookCounts[title] || 0) + item.quantity || item.Quantity || 1;
          });
        });
        const sortedBooks = Object.entries(bookCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        setTopBooksData({
          labels: sortedBooks.map(([title]) => title),
          datasets: [
            {
              label: 'Orders',
              data: sortedBooks.map(([, count]) => count),
              backgroundColor: [
                'rgba(59,130,246,0.7)',
                'rgba(139,92,246,0.7)',
                'rgba(16,185,129,0.7)',
                'rgba(251,191,36,0.7)',
                'rgba(239,68,68,0.7)'
              ],
              borderRadius: 8,
              barThickness: 32
            }
          ]
        });
      } catch (err) {
        setStats({ books: 0, users: 0, orders: 0 });
        setOrderData({ labels: [], datasets: [] });
        setStatusData({ labels: [], datasets: [] });
        setTopBooksData({ labels: [], datasets: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-xl shadow-lg flex flex-col items-center">
          <span className="text-5xl font-bold mb-2">{stats.books}</span>
          <span className="text-lg">Total Books</span>
        </div>
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-8 rounded-xl shadow-lg flex flex-col items-center">
          <span className="text-5xl font-bold mb-2">{stats.users}</span>
          <span className="text-lg">Total Users</span>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-8 rounded-xl shadow-lg flex flex-col items-center">
          <span className="text-5xl font-bold mb-2">{stats.orders}</span>
          <span className="text-lg">Total Orders</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Orders Trend (This Year)</h2>
          <Bar data={orderData} options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: false }
            },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
          }} height={300} />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Order Status Distribution</h2>
          <Pie data={statusData} options={{
            responsive: true,
            plugins: {
              legend: { position: 'bottom' },
              title: { display: false }
            }
          }} height={300} />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4">Top 5 Books by Orders</h2>
        <Bar data={topBooksData} options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false }
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }} height={180} />
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
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          {/* Add other admin routes here */}
        </Routes>
      </main>
    </div>
  );
}

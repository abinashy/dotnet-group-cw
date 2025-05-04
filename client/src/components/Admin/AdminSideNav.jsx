import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '🏠' },
  { to: '/admin/books', label: 'Manage Books', icon: '📚' },
  { to: '/admin/upload', label: 'Upload Books', icon: '⬆️' },
  { to: '/admin/users', label: 'Users', icon: '👤' },
  { to: '/admin/product', label: 'Product', icon: '📦' },
  { to: '/logout', label: 'Logout', icon: '🚪', className: 'mt-auto' },
  { to: '/admin/help', label: 'Help', icon: '❓' },
];

export default function AdminSideNav() {
  return (
    <aside className="w-64 bg-gradient-to-b from-orange-500 to-orange-400 text-white min-h-screen shadow-lg flex flex-col">
      <div className="py-8 px-6 border-b border-orange-300">
        <h2 className="text-2xl font-extrabold tracking-wide">BookNook Admin</h2>
      </div>
      <nav className="flex-1 px-4 py-8">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to} className={item.className}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-lg hover:bg-orange-600 hover:shadow-md ${
                    isActive ? 'bg-white text-orange-600 shadow font-bold' : 'text-white'
                  }`
                }
                end={item.to === '/admin'}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-6 py-4 border-t border-orange-300 text-xs text-orange-100">
        &copy; {new Date().getFullYear()} BookNook
      </div>
    </aside>
  );
}

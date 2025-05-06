import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/staff', label: 'Dashboard', icon: '🏠' },
  { to: '/staff/users', label: 'Users', icon: '👥' },
  { to: '/staff/books', label: 'Books', icon: '📚' },
  { to: '/staff/reviews', label: 'Reviews', icon: '⭐' },
  { to: '/staff/orders', label: 'Orders', icon: '🛒' },
  { to: '/logout', label: 'Logout', icon: '🚪', className: 'mt-auto' },
];

export default function StaffSideNav() {
  return (
    <aside className="w-64 bg-dark text-white min-vh-100 shadow-lg flex flex-col">
      <div className="py-4 px-4 border-bottom border-secondary">
        <h2 className="h4 mb-0">BookNook Staff</h2>
      </div>
      <nav className="flex-grow-1 px-3 py-4">
        <ul className="nav flex-column">
          {navItems.map((item) => (
            <li key={item.to} className={`nav-item ${item.className || ''}`}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 py-2 px-3 rounded ${
                    isActive ? 'bg-primary text-white' : 'text-white-50 hover-bg-light'
                  }`
                }
                end={item.to === '/staff'}
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-3 py-2 border-top border-secondary text-white-50 small">
        &copy; {new Date().getFullYear()} BookNook
      </div>
    </aside>
  );
} 
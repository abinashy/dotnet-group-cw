import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/staff', label: 'Orders', icon: '📝' },
  { to: '/logout', label: 'Logout', icon: '🚪', className: 'mt-auto' },
];

export default function StaffSideNav() {
  return (
    <aside className="w-64 bg-black text-white min-h-screen flex flex-col">
      <div className="py-6 px-6 border-b border-gray-800">
        <h2 className="text-xl font-semibold tracking-wide">BookNook Staff</h2>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to} className={item.className}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition font-medium text-sm hover:bg-gray-800 ${
                    isActive ? 'bg-gray-800 text-white' : 'text-gray-400'
                  }`
                }
                end={item.to === '/staff'}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 
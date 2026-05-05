import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Store, Wrench, Menu, LogOut, PackageCheck, ShoppingBag, CalendarDays, Megaphone } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/carkit-logo.png';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = admin?.role === 'superadmin';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navigation = isSuperAdmin 
    ? [
        { name: 'DB Explorer', href: '/db-explorer', icon: LayoutDashboard }
      ]
    : [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Pending Products', href: '/pending-products', icon: PackageCheck },
        { name: 'Pending Services', href: '/pending-services', icon: Wrench },
        { name: 'Pending Ads', href: '/pending-ads', icon: Megaphone },
        { name: 'Vendors', href: '/vendors', icon: Store },
        { name: 'Service Providers', href: '/service-providers', icon: Wrench },
      ];

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#0F0F1A', fontFamily: "'Poppins', sans-serif" }}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 h-screen w-64 shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col overflow-hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#0A0A14', borderRight: '1px solid #2A2A3A' }}
      >
        {/* Logo area */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5" style={{ background: '#08080F', borderBottom: '1px solid #2A2A3A' }}>
          <div className="flex items-center gap-2">
            <img src={logo} alt="CarKit" className="h-8 w-auto" />
            <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#9E9E9E' }}>Admin</span>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-white/5" style={{ color: '#9E9E9E' }} onClick={() => setSidebarOpen(false)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex min-h-0 flex-1 flex-col">
          <nav className="flex-1 min-h-0 space-y-1.5 overflow-y-auto px-3 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'shadow-sm'
                        : 'hover:bg-white/5'
                    }`
                  }
                  style={({ isActive }) => isActive ? {
                    background: 'rgba(233, 30, 140, 0.1)',
                    color: '#E91E8C',
                    border: '1px solid rgba(233, 30, 140, 0.2)',
                  } : {
                    color: '#9E9E9E',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User info + Logout */}
          <div className="shrink-0 px-3 py-4" style={{ borderTop: '1px solid #2A2A3A' }}>
            {admin && (
              <div className="px-4 py-2 mb-2">
                <p className="text-xs font-medium truncate" style={{ color: '#FFFFFF' }}>{admin.name}</p>
                <p className="text-xs truncate" style={{ color: '#6B6B80' }}>{admin.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-white/5 cursor-pointer"
              style={{ color: '#9E9E9E' }}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex h-14 items-center px-4 shadow-sm" style={{ background: '#0A0A14', borderBottom: '1px solid #2A2A3A' }}>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-white/5"
            style={{ color: '#9E9E9E' }}
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <img src={logo} alt="CarKit" className="h-6 w-auto" />
            <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#9E9E9E' }}>Admin</span>
          </div>
        </div>

        {/* Main section */}
        <main className="flex-1 overflow-y-auto py-8 px-4 sm:px-6 lg:px-8" style={{ background: '#0F0F1A' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

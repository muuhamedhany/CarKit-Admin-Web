import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Wrench, Menu, LogOut, PackageCheck, ShoppingBag, CalendarDays, Megaphone, Database, Truck, Siren } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/carkit-logo.png';
import { useTheme } from '../theme/ThemeContext';
import splashIconBlack from '../assets/splash-icon-black.png';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isSuperAdmin = admin?.role === 'superadmin';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pending Products', href: '/pending-products', icon: PackageCheck },
    { name: 'Pending Services', href: '/pending-services', icon: Wrench },
    { name: 'Pending Ads', href: '/pending-ads', icon: Megaphone },
    { name: 'Vendors', href: '/vendors', icon: Store },
    { name: 'Service Providers', href: '/service-providers', icon: Wrench },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Bookings', href: '/bookings', icon: CalendarDays },
    { name: 'Drivers', href: '/drivers', icon: Truck },
    { name: 'Emergency', href: '/emergency', icon: Siren },
    ...(isSuperAdmin
      ? [
          { name: 'DB Explorer', href: '/db-explorer', icon: Database }
        ]
      : []),
  ];

  return (
    <div className="h-dvh flex overflow-hidden font-['Space_Grotesk']" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 h-screen transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] 
          md:translate-x-0 md:static md:inset-auto flex flex-col overflow-hidden glass-panel rounded-none border-y-0 border-l-0 
          group w-72 md:w-20 md:hover:w-72 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {/* Logo area */}
        <div className="flex h-20 shrink-0 items-center justify-between px-4 bg-black/20" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 flex justify-center shrink-0">
              <img src={isDark ? logo : splashIconBlack} alt="CarKit" className="h-6 w-auto object-contain" />
            </div>
            <div className="md:opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap overflow-hidden">
              <h1 className="text-sm font-bold tracking-widest uppercase text-white leading-tight">CarKit</h1>
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-cyber-pink">System Control</span>
            </div>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-white/5 text-text-secondary" onClick={() => setSidebarOpen(false)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
        {/* Navigation */}
        <div className="flex min-h-0 flex-1 flex-col">
          <nav className="flex-1 min-h-0 space-y-2 overflow-y-auto px-4 py-4 custom-scrollbar">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group/item flex items-center gap-4 px-4 py-3.5 text-xs font-bold tracking-wider uppercase rounded-xl transition-all duration-300 overflow-hidden ${
                      isActive
                        ? 'text-white'
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`
                  }
                  style={({ isActive }) => isActive ? {
                    background: 'linear-gradient(90deg, rgba(255, 0, 128, 0.15) 0%, transparent 100%)',
                    boxShadow: 'inset 4px 0 0 var(--accent-pink)',
                  } : {}}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover/item:scale-110 ${sidebarOpen ? 'animate-pulse' : ''}`} />
                  <span className="display-font md:opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap overflow-hidden">
                    {item.name}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* User info + Logout */}
          <div className="shrink-0 px-4 py-6 bg-black/10" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {admin && (
              <div className="flex items-center gap-3  py-3 mb-4 rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                <div className="w-12 flex justify-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-cyber-purple/20 flex items-center justify-center text-cyber-purple font-bold text-xs border border-cyber-purple/30">
                    {admin.name?.[0]?.toUpperCase()}
                  </div>
                </div>
                <div className="min-w-0 md:opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap overflow-hidden">
                  <p className="text-[11px] font-bold text-white truncate">{admin.name}</p>
                  <p className="text-[9px] text-text-secondary truncate uppercase tracking-tighter">{admin.role}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="cyber-button flex items-center px-2 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 hover:bg-cyber-pink hover:text-white group/btn border border-white/5 w-full"
              style={{ color: 'var(--text-secondary)' }}
            >
              <div className="w-8 flex justify-center shrink-0">
                <LogOut className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
              </div>
              <span className="md:opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap overflow-hidden ml-1">
                Sign Out
              </span>
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
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Mobile header */}
        <div className="md:hidden flex h-16 items-center px-6 glass-panel rounded-none border-x-0 border-t-0" style={{ background: 'rgba(10, 10, 15, 0.8)' }}>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-white/5 text-text-secondary"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-3 ml-4">
            <img src={isDark ? logo : splashIconBlack} alt="CarKit" className="h-6 w-auto" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white">Admin Control</span>
          </div>
        </div>

        {/* Main section */}
        <main className="flex-1 overflow-y-auto py-10 px-6 sm:px-10 lg:px-12 relative z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Background Decorative Element */}
        <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyber-purple/5 blur-[120px] pointer-events-none" />
      </div>
    </div>
  );
};

export default Layout;

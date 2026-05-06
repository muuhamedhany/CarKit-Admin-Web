import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Users, ShoppingBag, Wrench, Package, Calendar, Loader2, Store, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#E91E8C' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-6 text-center mt-8 animate-pulse" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
        {error}
      </div>
    );
  }

  // Animation delay helper
  const getDelay = (index) => ({
    animation: 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    animationDelay: `${index * 100}ms`,
    opacity: 0,
  });

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Header section with high-craft typography */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyber-pink" />
            <span className="display-font">Terminal Overview</span>
          </h1>
          <p className="mt-3 text-text-secondary max-w-xl font-medium tracking-wide">
            Real-time telemetry and operational metrics for the <span className="text-cyber-blue font-bold">CarKit</span> ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass-panel neo-border-purple">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#10B981]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">System Live</span>
        </div>
      </div>

      {/* SECTION 1: Core Demographics */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-text-secondary display-font px-4">Core Demographics</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Total Users" value={stats.users} icon={Users} color="var(--accent-blue)" />
          <StatCard title="Vendors" value={stats.vendors} icon={Store} color="var(--accent-purple)" />
          <StatCard title="Providers" value={stats.providers} icon={Wrench} color="var(--accent-pink)" />
        </div>
      </section>

      {/* SECTION 2: Catalog & Fulfillment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-cyber-blue display-font">Catalog & Approvals</h2>
          <div className="grid grid-cols-1 gap-6">
            <DetailedCard 
              title="Products" 
              total={stats.catalog.products.total} 
              pending={stats.catalog.products.pending} 
              icon={Package} 
              color="var(--accent-blue)" 
            />
            <DetailedCard 
              title="Services" 
              total={stats.catalog.services.total} 
              pending={stats.catalog.services.pending} 
              icon={Wrench} 
              color="var(--accent-purple)" 
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-cyber-pink display-font">Fulfillment Activity</h2>
          <div className="grid grid-cols-1 gap-6">
            <DetailedCard 
              title="Orders" 
              total={stats.fulfillment.orders.total} 
              completed={stats.fulfillment.orders.delivered} 
              icon={ShoppingBag} 
              color="var(--accent-pink)" 
              isActivity
            />
            <DetailedCard 
              title="Bookings" 
              total={stats.fulfillment.bookings.total} 
              completed={stats.fulfillment.bookings.completed} 
              icon={Calendar} 
              color="var(--accent-blue)" 
              isActivity
            />
          </div>
        </section>
      </div>
    </div>
  );
};

// ─── Reusable Components ───────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="cyber-button glass-panel p-6 group hover:scale-[1.02] transition-all duration-500 overflow-hidden relative">
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 transition-opacity duration-500 group-hover:opacity-20" style={{ background: color }} />
    <div className="relative z-10 flex items-center gap-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] transition-colors duration-500 group-hover:border-white/20">
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <div>
        <div className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mb-1">{title}</div>
        <div className="text-4xl font-extrabold text-white display-font">{value.toLocaleString()}</div>
      </div>
    </div>
  </div>
);

const DetailedCard = ({ title, total, pending, completed, icon: Icon, color, isActivity = false }) => {
  const secondaryValue = isActivity ? completed : pending;
  const secondaryLabel = isActivity 
    ? (title === 'Orders' ? 'Delivered' : 'Completed') 
    : 'Pending Approval';
  const SecondaryIcon = isActivity ? CheckCircle2 : AlertCircle;
  const secondaryColor = isActivity ? '#10B981' : '#F59E0B'; 
  
  const percent = total > 0 ? Math.round((secondaryValue / total) * 100) : 0;

  return (
    <div className="glass-panel p-8 relative group overflow-hidden transition-all duration-500 hover:bg-white/[0.02]">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-[0.03] pointer-events-none" style={{ background: color }} />
      
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <span className="text-2xl font-bold text-white display-font">{title}</span>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mb-1">Gross Inventory</div>
          <div className="text-3xl font-extrabold text-white display-font">{total.toLocaleString()}</div>
        </div>
      </div>

      <div className="rounded-2xl p-6 bg-black/40 border border-white/5 neo-border-purple shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <SecondaryIcon className="w-4 h-4" style={{ color: secondaryColor }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: secondaryColor }}>{secondaryLabel}</span>
          </div>
          <span className="text-xl font-bold text-white display-font">{secondaryValue.toLocaleString()}</span>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="w-full h-3 rounded-full bg-white/[0.03] border border-white/5 p-0.5 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_10px_rgba(255,255,255,0.1)]"
            style={{ width: `${percent}%`, background: `linear-gradient(90deg, transparent, ${secondaryColor})` }}
          />
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Utilization Metric</span>
          <span className="text-[10px] font-black text-white px-2 py-0.5 rounded bg-white/5">{percent}%</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

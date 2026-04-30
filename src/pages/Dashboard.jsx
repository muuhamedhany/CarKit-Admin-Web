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
    <div className="space-y-10 pb-12">
      {/* Inline styles for custom animations */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-card:hover .glow {
          opacity: 0.2;
          transform: scale(1.1);
        }
      `}</style>

      {/* Header */}
      <div style={getDelay(0)}>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#FFFFFF' }}>Admin Overview</h1>
        <p className="mt-2 text-base" style={{ color: '#9E9E9E' }}>Live operational metrics for CarKit Platform.</p>
      </div>

      {/* SECTION 1: User Demographics */}
      <section style={getDelay(1)} className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2" style={{ color: '#FFFFFF', borderColor: '#2A2A3A' }}>Demographics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard title="Total Users" value={stats.users} icon={Users} color="#3B82F6" />
          <StatCard title="Vendors" value={stats.vendors} icon={Store} color="#8B5CF6" />
          <StatCard title="Service Providers" value={stats.providers} icon={Wrench} color="#EC4899" />
        </div>
      </section>

      {/* SECTION 2: Catalog & Approvals */}
      <section style={getDelay(2)} className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2" style={{ color: '#FFFFFF', borderColor: '#2A2A3A' }}>Catalog & Approvals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <DetailedCard 
            title="Products" 
            total={stats.catalog.products.total} 
            pending={stats.catalog.products.pending} 
            icon={Package} 
            color="#10B981" 
          />
          <DetailedCard 
            title="Services" 
            total={stats.catalog.services.total} 
            pending={stats.catalog.services.pending} 
            icon={Wrench} 
            color="#F59E0B" 
          />
        </div>
      </section>

      {/* SECTION 3: Fulfillment Activity */}
      <section style={getDelay(3)} className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2" style={{ color: '#FFFFFF', borderColor: '#2A2A3A' }}>Fulfillment Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <DetailedCard 
            title="Orders" 
            total={stats.fulfillment.orders.total} 
            completed={stats.fulfillment.orders.delivered} 
            icon={ShoppingBag} 
            color="#06B6D4" 
            isActivity
          />
          <DetailedCard 
            title="Bookings" 
            total={stats.fulfillment.bookings.total} 
            completed={stats.fulfillment.bookings.completed} 
            icon={Calendar} 
            color="#F43F5E" 
            isActivity
          />
        </div>
      </section>
    </div>
  );
};

// ─── Reusable Components ───────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="stat-card relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
       style={{ background: '#1A1A24', border: '1px solid #2A2A3A' }}>
    <div className="glow absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full opacity-10 blur-3xl transition-all duration-500" style={{ background: color }} />
    <div className="relative z-10 flex items-center gap-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: `${color}15` }}>
        <Icon className="w-6 h-6" style={{ color: color }} />
      </div>
      <div>
        <div className="text-sm font-medium tracking-wide mb-1" style={{ color: '#9E9E9E' }}>{title}</div>
        <div className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>{value.toLocaleString()}</div>
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
  const secondaryColor = isActivity ? '#10B981' : '#F59E0B'; // Green for complete, Orange for pending
  
  // Calculate percentage for a fun little progress bar
  const percent = total > 0 ? Math.round((secondaryValue / total) * 100) : 0;

  return (
    <div className="stat-card relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
         style={{ background: '#1A1A24', border: '1px solid #2A2A3A' }}>
      <div className="glow absolute top-0 left-0 w-full h-full opacity-[0.03] transition-all duration-500" style={{ background: `linear-gradient(135deg, transparent, ${color})` }} />
      
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ background: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color: color }} />
          </div>
          <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{title}</span>
        </div>
        <div className="text-right">
          <div className="text-sm" style={{ color: '#9E9E9E' }}>Total</div>
          <div className="text-2xl font-black" style={{ color: '#FFFFFF' }}>{total.toLocaleString()}</div>
        </div>
      </div>

      <div className="relative z-10 rounded-xl p-4" style={{ background: '#12121A' }}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <SecondaryIcon className="w-4 h-4" style={{ color: secondaryColor }} />
            <span className="text-sm font-medium" style={{ color: secondaryColor }}>{secondaryLabel}</span>
          </div>
          <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{secondaryValue.toLocaleString()}</span>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#2A2A3A' }}>
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percent}%`, background: secondaryColor }}
          />
        </div>
        <div className="mt-2 text-xs text-right" style={{ color: '#6B6B80' }}>
          {percent}% of total
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

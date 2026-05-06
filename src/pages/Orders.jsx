import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, CircleDashed, Clock3, Loader2, Package, Search, ShoppingBag } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const STATUS_OPTIONS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const Orders = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/orders/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setOrders(res.data.data || []);
        }
      } catch (err) {
        console.error('Orders fetch error:', err);
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const filteredOrders = orders.filter((order) => {
    const haystack = [
      order.order_id,
      order.user_name,
      order.user_email,
      order.status,
      order.total_amount,
      order.shipping_title,
      order.shipping_street,
      order.shipping_city,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return (
      haystack.includes(search.toLowerCase()) &&
      (statusFilter === 'all' || String(order.status || '').toLowerCase() === statusFilter)
    );
  });

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered':
        return { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', border: 'rgba(34,197,94,0.2)', glow: '0 0 10px rgba(34,197,94,0.2)' };
      case 'processing':
      case 'shipped':
        return { bg: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: 'rgba(0,212,255,0.2)', glow: '0 0 10px rgba(0,212,255,0.2)' };
      case 'cancelled':
        return { bg: 'rgba(255,0,128,0.1)', color: '#FF0080', border: 'rgba(255,0,128,0.2)', glow: '0 0 10px rgba(255,0,128,0.2)' };
      default:
        return { bg: 'rgba(180,92,255,0.1)', color: '#B45CFF', border: 'rgba(180,92,255,0.2)', glow: '0 0 10px rgba(180,92,255,0.2)' };
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter display-font uppercase">
            Order Stream
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mt-2">
            Monitoring global product fulfillment logistics.
            {!loading && <span className="text-cyber-pink ml-2">[{filteredOrders.length} transits detected]</span>}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group w-full md:w-72">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-cyber-pink transition-colors z-10" />
            <input
              type="text"
              placeholder="SEARCH PROTOCOLS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase outline-none bg-black border border-white/10 text-white focus:neo-border-pink transition-all placeholder:text-white/20"
            />
          </div>

          <div className="relative group w-full md:w-56">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-blue to-cyber-purple opacity-20 group-hover:opacity-40 transition-opacity blur rounded-xl" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="relative w-full rounded-xl py-3 pl-4 pr-10 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer bg-black border border-white/10 text-white appearance-none"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'FILTER: GLOBAL' : `STATUS: ${status.toUpperCase()}`}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary group-hover:text-cyber-blue transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-cyber-pink/20 border-t-cyber-pink animate-spin" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-pink animate-pulse">Syncing Nexus</span>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center border-cyber-pink/30 bg-cyber-pink/5">
          <p className="text-xs font-black text-cyber-pink uppercase tracking-widest">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-panel p-20 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyber-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Package className="w-16 h-16 mx-auto mb-6 text-white/5 group-hover:text-cyber-purple/20 transition-colors" />
          <p className="text-sm font-black uppercase tracking-widest text-text-secondary">
            {search || statusFilter !== 'all' ? 'No matching logs in cache' : 'Stream idle - zero orders'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredOrders.map((order) => {
            const status = String(order.status || 'pending').toLowerCase();
            const s = getStatusStyle(status);
            return (
              <button
                key={order.order_id}
                onClick={() => navigate(`/orders/${order.order_id}`)}
                className="glass-panel p-6 group cursor-pointer relative overflow-hidden flex flex-col h-full text-left border-white/5 hover:border-white/20 transition-all active:scale-[0.98]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-pink/5 skew-x-[-20deg] translate-x-12 -translate-y-12 group-hover:translate-x-8 transition-transform duration-700" />
                
                <div className="flex items-start justify-between gap-4 mb-8 relative z-10">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center text-cyber-purple transition-all group-hover:neo-border-purple">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">TRACKING #{order.order_id}</p>
                      <p className="text-sm font-black text-white display-font uppercase tracking-tight truncate mt-0.5">
                        {order.user_name || 'ANONYMOUS_ENTITY'}
                      </p>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest border shrink-0 transition-all"
                    style={{ background: s.bg, color: s.color, borderColor: s.border, boxShadow: s.glow }}
                  >
                    <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                    {status}
                  </span>
                </div>

                <div className="space-y-4 flex-1 relative z-10 mb-8">
                  <div className="flex justify-between items-center px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">NEXUS ID</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tight truncate max-w-[150px]">{order.user_email || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">CREDIT</span>
                    <span className="text-xs font-black text-cyber-pink display-font">{Number(order.total_amount || 0).toLocaleString('en-EG')} EGP</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">LAUNCH</span>
                      <span className="text-[10px] font-bold text-white uppercase tracking-tight">{formatDate(order.order_date)}</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">ETA</span>
                      <span className="text-[10px] font-bold text-white uppercase tracking-tight">{formatDate(order.preferred_delivery_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-text-secondary truncate max-w-[180px]">
                    <Clock3 className="w-3 h-3 shrink-0 text-cyber-purple" />
                    <span className="truncate uppercase tracking-wider">
                      {order.estimated_delivery_start || order.estimated_delivery_end ? `${formatDate(order.estimated_delivery_start)} - ${formatDate(order.estimated_delivery_end)}` : 'ESTIMATE_PENDING'}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-cyber-pink opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    ACCESS <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
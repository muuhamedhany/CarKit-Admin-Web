import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, CalendarDays, CircleDashed, Clock3, Loader2, MapPin, Search, Wrench } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

const Bookings = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/bookings/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setBookings(res.data.data || []);
        }
      } catch (err) {
        console.error('Bookings fetch error:', err);
        setError('Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  const filteredAndSortedBookings = React.useMemo(() => {
    const filtered = bookings.filter((booking) => {
      const haystack = [
        booking.booking_id,
        booking.user_name,
        booking.service_name,
        booking.provider_name,
        booking.status,
        booking.location,
        booking.address_title,
        booking.street,
        booking.city,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        haystack.includes(search.toLowerCase()) &&
        (statusFilter === 'all' || String(booking.status || '').toLowerCase() === statusFilter)
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = a.booking_date && a.start_time ? new Date(`${String(a.booking_date).slice(0, 10)}T${a.start_time}`).getTime() : (a.booking_date ? new Date(a.booking_date).getTime() : 0);
      const dateB = b.booking_date && b.start_time ? new Date(`${String(b.booking_date).slice(0, 10)}T${b.start_time}`).getTime() : (b.booking_date ? new Date(b.booking_date).getTime() : 0);

      if (sortBy === 'newest') {
        if (dateA !== dateB) return dateB - dateA;
        return b.booking_id - a.booking_id;
      } else {
        if (dateA !== dateB) return dateA - dateB;
        return a.booking_id - b.booking_id;
      }
    });
  }, [bookings, search, statusFilter, sortBy]);

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (value) => {
    if (!value) return '—';
    return new Date(`1970-01-01T${value}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', border: 'rgba(34,197,94,0.2)', glow: '0 0 10px rgba(34,197,94,0.2)' };
      case 'confirmed':
      case 'in-progress':
        return { bg: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: 'rgba(0,212,255,0.2)', glow: '0 0 10px rgba(0,212,255,0.2)' };
      case 'cancelled':
        return { bg: 'rgba(255,0,128,0.1)', color: '#FF0080', border: 'rgba(255,0,128,0.2)', glow: '0 0 10px rgba(255,0,128,0.2)' };
      default:
        return { bg: 'rgba(180,92,255,0.1)', color: '#B45CFF', border: 'rgba(180,92,255,0.2)', glow: '0 0 10px rgba(180,92,255,0.2)' };
    }
  };

  const getLocationText = (booking) => {
    const parts = [booking.location, booking.address_title, booking.street, booking.city].filter(Boolean);
    return parts.length ? parts.join(' • ') : '—';
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter display-font uppercase">
            Service Logistics
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mt-2">
            Monitoring active service fulfillment nodes.
            {!loading && <span className="text-cyber-pink ml-2">[{filteredAndSortedBookings.length} operations active]</span>}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group w-full md:w-72">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-cyber-pink transition-colors z-10" />
            <input
              type="text"
              placeholder="SEARCH OPERATIONS..."
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

          <div className="relative group w-full md:w-56">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-blue to-cyber-purple opacity-20 group-hover:opacity-40 transition-opacity blur rounded-xl" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="relative w-full rounded-xl py-3 pl-4 pr-10 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer bg-black border border-white/10 text-white appearance-none"
            >
              <option value="newest">SORT: NEWEST FIRST</option>
              <option value="oldest">SORT: OLDEST FIRST</option>
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
            <div className="w-16 h-16 rounded-full border-2 border-cyber-blue/20 border-t-cyber-blue animate-spin" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-blue animate-pulse">Syncing Hub</span>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center border-cyber-pink/30 bg-cyber-pink/5">
          <p className="text-xs font-black text-cyber-pink uppercase tracking-widest">{error}</p>
        </div>
      ) : filteredAndSortedBookings.length === 0 ? (
        <div className="glass-panel p-20 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyber-pink/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Wrench className="w-16 h-16 mx-auto mb-6 text-white/5 group-hover:text-cyber-pink/20 transition-colors" />
          <p className="text-sm font-black uppercase tracking-widest text-text-secondary">
            {search || statusFilter !== 'all' ? 'Zero matches found in grid' : 'No bookings in stream'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAndSortedBookings.map((booking) => {
            const status = String(booking.status || 'pending').toLowerCase();
            const s = getStatusStyle(status);
            return (
              <button
                key={booking.booking_id}
                onClick={() => navigate(`/bookings/${booking.booking_id}`)}
                className="glass-panel p-6 group cursor-pointer relative overflow-hidden flex flex-col h-full text-left border-white/5 hover:border-white/20 transition-all active:scale-[0.98]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-blue/5 skew-x-[-20deg] translate-x-12 -translate-y-12 group-hover:translate-x-8 transition-transform duration-700" />
                
                <div className="flex items-start justify-between gap-4 mb-8 relative z-10">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center text-cyber-pink transition-all group-hover:neo-border-pink">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">LOG #{booking.booking_id}</p>
                      <p className="text-sm font-black text-white display-font uppercase tracking-tight truncate mt-0.5">
                        {booking.service_name || 'UNDEFINED_SERVICE'}
                      </p>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest border shrink-0 transition-all"
                    style={{ background: s.bg, color: s.color, borderColor: s.border, boxShadow: s.glow }}
                  >
                    <CircleDashed className="w-3 h-3 animate-spin-slow" />
                    {status}
                  </span>
                </div>

                <div className="space-y-4 flex-1 relative z-10 mb-8">
                  <div className="flex justify-between items-center px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">SUBJECT</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">{booking.user_name || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">ENTITY</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tight">{booking.provider_name || '—'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">CHRONOS</span>
                      <span className="text-[10px] font-bold text-white uppercase tracking-tight">{formatDate(booking.booking_date)}</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">WINDOW</span>
                      <span className="text-[10px] font-bold text-white uppercase tracking-tight">{formatTime(booking.start_time)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-text-secondary truncate max-w-[180px]">
                    <MapPin className="w-3 h-3 shrink-0 text-cyber-blue" />
                    <span className="truncate uppercase tracking-wider">{getLocationText(booking)}</span>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-cyber-pink opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    DETAILS <ArrowRight className="w-3 h-3" />
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

export default Bookings;
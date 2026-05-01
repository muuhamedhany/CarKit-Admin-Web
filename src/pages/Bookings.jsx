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

  const filteredBookings = bookings.filter((booking) => {
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
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.25)' };
      case 'confirmed':
      case 'in-progress':
        return { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' };
      case 'cancelled':
        return { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)' };
      default:
        return { bg: 'rgba(234,179,8,0.12)', color: '#facc15', border: 'rgba(234,179,8,0.25)' };
    }
  };

  const getLocationText = (booking) => {
    const parts = [booking.location, booking.address_title, booking.street, booking.city].filter(Boolean);
    return parts.length ? parts.join(' • ') : '—';
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>Bookings</h1>
          <p className="mt-1 text-sm" style={{ color: '#9E9E9E' }}>
            Review service bookings and update fulfillment status.
            {!loading && <span style={{ color: '#E91E8C' }}> ({filteredBookings.length} shown)</span>}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B6B80' }} />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl text-sm w-full sm:w-72 outline-none transition-all duration-200"
              style={{ background: '#1E1E2C', border: '1px solid #2A2A3A', color: '#FFFFFF' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
            style={{ background: '#1E1E2C', border: '1px solid #2A2A3A', color: '#FFFFFF' }}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E91E8C' }} />
        </div>
      ) : error ? (
        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.3)', color: '#FF69B4' }}>
          {error}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <Wrench className="w-12 h-12 mx-auto mb-3" style={{ color: '#6B6B80' }} />
          <p style={{ color: '#6B6B80' }}>{search || statusFilter !== 'all' ? 'No matching bookings found.' : 'No bookings yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => {
            const status = String(booking.status || 'pending').toLowerCase();
            const s = getStatusStyle(status);
            return (
              <button
                key={booking.booking_id}
                type="button"
                onClick={() => navigate(`/bookings/${booking.booking_id}`)}
                className="text-left rounded-xl p-5 transition-all duration-200 hover:scale-[1.01] group cursor-pointer flex flex-col h-full"
                style={{ background: '#12121F', border: '1px solid #2A2A3A' }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: 'rgba(233,30,140,0.15)', color: '#E91E8C' }}>
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: '#FFFFFF' }}>Booking #{booking.booking_id}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#6B6B80' }}>{booking.service_name || 'Unknown service'}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
                    <CircleDashed className="w-3.5 h-3.5" />
                    {status}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs" style={{ color: '#9E9E9E' }}>Customer</span>
                    <span className="text-sm text-right truncate" style={{ color: '#FFFFFF' }}>{booking.user_name || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs" style={{ color: '#9E9E9E' }}>Provider</span>
                    <span className="text-sm text-right truncate" style={{ color: '#FFFFFF' }}>{booking.provider_name || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs" style={{ color: '#9E9E9E' }}>Date</span>
                    <span className="text-sm" style={{ color: '#FFFFFF' }}>{formatDate(booking.booking_date)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs" style={{ color: '#9E9E9E' }}>Time</span>
                    <span className="text-sm" style={{ color: '#FFFFFF' }}>{formatTime(booking.start_time)}{booking.end_time ? ` - ${formatTime(booking.end_time)}` : ''}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #1E1E2C' }}>
                  <div className="flex items-center gap-2 text-xs truncate" style={{ color: '#6B6B80' }}>
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{getLocationText(booking)}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#E91E8C' }}>
                    View details
                    <ArrowRight className="w-3.5 h-3.5" />
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
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CalendarDays, Car, CheckCircle2, CircleDashed, Clock3, Loader2, Mail, MapPin, Phone, UserCircle, Wrench, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const STATUS_OPTIONS = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

const BookingDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/bookings/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setBooking(res.data.data);
        }
      } catch (err) {
        console.error('Booking detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, token]);

  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      const res = await axios.patch(
        `${API_URL}/api/bookings/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setBooking((prev) => (prev ? { ...prev, status } : prev));
      }
    } catch (err) {
      console.error('Booking status update error:', err);
    } finally {
      setUpdating(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E91E8C' }} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p style={{ color: '#6B6B80' }}>Booking not found.</p>
        <button onClick={() => navigate('/bookings')} className="mt-4 text-sm cursor-pointer" style={{ color: '#E91E8C' }}>Back to Bookings</button>
      </div>
    );
  }

  const status = String(booking.status || 'pending').toLowerCase();
  const s = getStatusStyle(status);
  const locationText = [booking.location, booking.address_title, booking.street, booking.city].filter(Boolean).join(' • ') || '—';
  const vehicleText = [booking.make_name, booking.model_name, booking.vehicle_year].filter(Boolean).join(' ') || '—';

  return (
    <div className="space-y-6 max-w-6xl">
      <button
        onClick={() => navigate('/bookings')}
        className="inline-flex items-center gap-2 text-sm transition-colors duration-200 cursor-pointer"
        style={{ color: '#9E9E9E' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#E91E8C')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#9E9E9E')}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Bookings
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl text-lg font-bold" style={{ background: 'rgba(233,30,140,0.15)', color: '#E91E8C' }}>
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Booking #{booking.booking_id}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mt-1 border" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
              <CircleDashed className="w-3.5 h-3.5" />
              {status}
            </span>
          </div>
        </div>

        <div className="rounded-xl px-4 py-3 text-right" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <div className="text-xs" style={{ color: '#9E9E9E' }}>Booking price</div>
          <div className="text-xl font-bold" style={{ color: '#E91E8C' }}>{Number(booking.booking_price || 0).toLocaleString('en-EG')} EGP</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: '#FFFFFF' }}>Customer Information</h2>
          <div className="space-y-4">
            <InfoRow label="Customer" value={booking.customer_name || '—'} icon={UserCircle} />
            <InfoRow label="Email" value={booking.customer_email || '—'} icon={Mail} />
            <InfoRow label="Phone" value={booking.customer_phone || '—'} icon={Phone} />
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: '#FFFFFF' }}>Service Information</h2>
          <div className="space-y-4">
            <InfoRow label="Service" value={booking.service_name || '—'} icon={Wrench} />
            <InfoRow label="Provider" value={booking.provider_name || '—'} icon={UserCircle} />
            <InfoRow label="Duration" value={booking.service_duration ? `${booking.service_duration} min` : '—'} icon={Clock3} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: '#FFFFFF' }}>Booking Schedule & Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Date" value={formatDate(booking.booking_date)} icon={CalendarDays} />
            <InfoRow label="Time" value={`${formatTime(booking.start_time)}${booking.end_time ? ` - ${formatTime(booking.end_time)}` : ''}`} icon={Clock3} />
            <InfoRow label="Location" value={locationText} icon={MapPin} />
            <InfoRow label="Location Type" value={booking.location_type || '—'} icon={MapPin} />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Vehicle" value={vehicleText} icon={Car} />
            <InfoRow label="Vehicle Color" value={booking.vehicle_color || '—'} icon={Car} />
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#6B6B80' }}>Notes</p>
            <div className="rounded-xl p-4" style={{ background: '#1E1E2C', border: '1px solid #2A2A3A' }}>
              <p className="text-sm whitespace-pre-line" style={{ color: '#FFFFFF' }}>{booking.notes || 'No notes provided.'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: '#FFFFFF' }}>Status Actions</h2>
          <div className="space-y-3">
            {STATUS_OPTIONS.map((nextStatus) => {
              const active = nextStatus === status;
              const isDanger = nextStatus === 'cancelled';
              return (
                <button
                  key={nextStatus}
                  type="button"
                  onClick={() => updateStatus(nextStatus)}
                  disabled={updating || active}
                  className="w-full inline-flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-60"
                  style={{
                    background: active ? 'rgba(233,30,140,0.12)' : isDanger ? 'rgba(239,68,68,0.12)' : 'rgba(233,30,140,0.08)',
                    color: active ? '#E91E8C' : isDanger ? '#f87171' : '#FFFFFF',
                    border: `1px solid ${active ? 'rgba(233,30,140,0.25)' : isDanger ? 'rgba(239,68,68,0.25)' : 'rgba(233,30,140,0.12)'}`,
                  }}
                >
                  <span className="inline-flex items-center gap-2 capitalize">
                    {nextStatus === 'cancelled' ? <XCircle className="w-4 h-4" /> : nextStatus === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <CircleDashed className="w-4 h-4" />}
                    {nextStatus}
                  </span>
                  {updating && active ? 'Updating...' : active ? 'Current' : 'Set status'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, icon }) => {
  const Icon = icon;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#6B6B80' }}>{label}</p>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'rgba(233,30,140,0.1)' }}>
          <Icon className="w-4 h-4" style={{ color: '#E91E8C' }} />
        </div>
        <p className="text-sm leading-5 wrap-break-word" style={{ color: '#FFFFFF' }}>{value}</p>
      </div>
    </div>
  );
};

export default BookingDetail;
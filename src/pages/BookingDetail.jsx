import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { ArrowLeft, CalendarDays, Car, CheckCircle2, CircleDashed, Clock3, Mail, MapPin, Phone, UserCircle, Wrench, XCircle } from 'lucide-react';


const API_URL = import.meta.env.VITE_API_URL;
const STATUS_OPTIONS = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

const BookingDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

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

  const getStatusStyle = (status, isDark = true) => {
    switch (status) {
      case 'completed':
        return isDark
          ? { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', border: 'rgba(34,197,94,0.2)', glow: '0 0 10px rgba(34,197,94,0.2)' }
          : { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', border: 'rgba(22,163,74,0.2)', glow: '0 0 0 transparent' };
      case 'confirmed':
      case 'in-progress':
        return isDark
          ? { bg: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: 'rgba(0,212,255,0.2)', glow: '0 0 10px rgba(0,212,255,0.2)' }
          : { bg: 'rgba(2,132,199,0.1)', color: '#0284c7', border: 'rgba(2,132,199,0.2)', glow: '0 0 0 transparent' };
      case 'cancelled':
        return isDark
          ? { bg: 'rgba(255,0,128,0.1)', color: '#FF0080', border: 'rgba(255,0,128,0.2)', glow: '0 0 10px rgba(255,0,128,0.2)' }
          : { bg: 'rgba(184, 50, 145, 0.1)', color: '#B83291', border: 'rgba(184, 50, 145, 0.2)', glow: '0 0 0 transparent' };
      default:
        return isDark
          ? { bg: 'rgba(180,92,255,0.1)', color: '#B45CFF', border: 'rgba(180,92,255,0.2)', glow: '0 0 10px rgba(180,92,255,0.2)' }
          : { bg: 'rgba(84, 32, 153, 0.1)', color: '#542099', border: 'rgba(84, 32, 153, 0.2)', glow: '0 0 0 transparent' };
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
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyber-pink/20 border-t-cyber-pink animate-spin" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-pink animate-pulse">Accessing Registry</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 animate-fade-in">
        <div className="glass-panel p-8 text-center border-cyber-pink/30 bg-cyber-pink/5">
          <p className="text-xs font-black text-cyber-pink uppercase tracking-widest text-center">Archive link severed - Booking not found.</p>
        </div>
        <button
          onClick={() => navigate('/bookings')}
          className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const status = String(booking.status || 'pending').toLowerCase();
  const s = getStatusStyle(status, isDark);
  const locationText = [booking.location, booking.address_title, booking.street, booking.city].filter(Boolean).join(' • ') || '—';
  const vehicleText = [booking.make_name, booking.model_name, booking.vehicle_year].filter(Boolean).join(' ') || '—';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/bookings')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-cyber-pink transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Booking Registry
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-cyber-purple neo-border-purple relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyber-purple/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CalendarDays className="w-10 h-10 relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter display-font uppercase">
                Booking #{booking.booking_id}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span 
                  className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border animate-pulse"
                  style={{ background: s.bg, color: s.color, borderColor: s.border, boxShadow: s.glow }}
                >
                  {status}
                </span>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                  PROTOCOL: {booking.service_name || 'SYSTEM_PROCEDURE'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel px-8 py-5 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1 h-full bg-cyber-pink opacity-50" />
            <div className="text-[8px] font-black text-text-secondary uppercase tracking-[0.3em] mb-1">TRANSACTION_VALUE</div>
            <div className="text-2xl font-black text-cyber-pink display-font uppercase tracking-tight">
              {Number(booking.booking_price || 0).toLocaleString('en-EG')} EGP
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column containing tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Selector */}
          <div className="flex border-b border-white/5 overflow-x-auto custom-scrollbar gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'profile'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Entity Profile
            </button>
            <button
              onClick={() => setActiveTab('logistics')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'logistics'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Logistics & Vehicle
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'notes'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Observations
            </button>
          </div>

          {/* Tab Content: Profile */}
          {activeTab === 'profile' && (
            <div className="glass-panel p-8 relative overflow-hidden animate-fade-in space-y-8">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-50" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-cyber-blue" /> CUSTOMER_AND_SERVICE_ENTITY
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InfoRow label="ENTITY_NAME" value={booking.customer_name || '—'} icon={UserCircle} color="blue" />
                <InfoRow label="PROCEDURE" value={booking.service_name || '—'} icon={Wrench} color="purple" />
                <InfoRow label="NEXUS_EMAIL" value={booking.customer_email || '—'} icon={Mail} color="blue" />
                <InfoRow label="EXEC_NODE" value={booking.provider_name || '—'} icon={UserCircle} color="purple" />
                <InfoRow label="COMMS_LINK" value={booking.customer_phone || '—'} icon={Phone} color="blue" />
                <InfoRow label="EST_DURATION" value={booking.service_duration ? `${booking.service_duration} min` : '—'} icon={Clock3} color="purple" />
              </div>
            </div>
          )}

          {/* Tab Content: Logistics */}
          {activeTab === 'logistics' && (
            <div className="glass-panel p-8 relative overflow-hidden animate-fade-in space-y-8">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-purple opacity-50" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyber-purple" /> LOGISTICS_MAP
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InfoRow label="DEPLOY_DATE" value={formatDate(booking.booking_date)} icon={CalendarDays} />
                <InfoRow label="WINDOW" value={`${formatTime(booking.start_time)}${booking.end_time ? ` - ${formatTime(booking.end_time)}` : ''}`} icon={Clock3} />
                <InfoRow label="LOC_COORDINATES" value={locationText} icon={MapPin} />
                <InfoRow label="LOC_TYPE" value={booking.location_type || '—'} icon={MapPin} />
                <InfoRow label="TARGET_VEHICLE" value={vehicleText} icon={Car} />
                <InfoRow label="HULL_COATING" value={booking.vehicle_color || '—'} icon={Car} />
              </div>
            </div>
          )}

          {/* Tab Content: Notes */}
          {activeTab === 'notes' && (
            <div className="glass-panel p-8 relative overflow-hidden animate-fade-in space-y-4">
              <div className="absolute top-0 left-0 w-1 h-full bg-white opacity-20" />
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-text-secondary">OBSERVATIONS</p>
              <div className="rounded-xl p-6 bg-white/[0.02] border border-white/5">
                <p className="text-[11px] font-bold tracking-widest text-white leading-relaxed uppercase">
                  {booking.notes || 'No entity notes recorded.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column containing status options */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Control */}
          <div className="glass-panel p-8 relative overflow-hidden bg-black/40">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyber-pink opacity-50" />
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-10 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyber-pink" /> DECISION_CENTER
            </h2>
            <div className="space-y-4">
              {STATUS_OPTIONS.map((nextStatus) => {
                const active = nextStatus === status;
                const isDanger = nextStatus === 'cancelled';
                const isSuccess = nextStatus === 'completed';
                
                return (
                  <button
                    key={nextStatus}
                    onClick={() => updateStatus(nextStatus)}
                    disabled={updating || active}
                    className={`w-full group flex items-center justify-between px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border outline-none ${
                      active ? 'bg-cyber-pink/20 border-cyber-pink/40 text-cyber-pink cursor-default' : 
                        `cursor-pointer disabled:opacity-50 ${
                          isDanger ? 'bg-red-500/5 border-red-500/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/20' :
                          isSuccess ? 'bg-green-500/5 border-green-500/10 text-green-400 hover:bg-green-500/10 hover:border-green-500/20' :
                          'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10 hover:text-white'
                        }`
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {nextStatus === 'cancelled' ? <XCircle className="w-4 h-4" /> : 
                       nextStatus === 'completed' ? <CheckCircle2 className="w-4 h-4 animate-pulse" /> : 
                       <CircleDashed className={`w-4 h-4 ${active ? 'animate-spin-slow' : ''}`} />}
                      {nextStatus}
                    </span>
                    {updating && active ? 'SYNCING...' : active ? 'CURRENT' : 'DEPLOY'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, icon: Icon, color = 'white' }) => {
  const colorMap = {
    pink: 'text-cyber-pink bg-cyber-pink/10',
    purple: 'text-cyber-purple bg-cyber-purple/10',
    blue: 'text-cyber-blue bg-cyber-blue/10',
    white: 'text-white/40 bg-white/5'
  };

  return (
    <div className="group/item flex items-center gap-4">
      <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all ${colorMap[color] || colorMap.white} border border-transparent group-hover/item:border-current/20`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em] mb-0.5 truncate">{label}</p>
        <p className="text-[10px] font-black text-white uppercase tracking-widest leading-tight truncate">{value}</p>
      </div>
    </div>
  );
};

export default BookingDetail;
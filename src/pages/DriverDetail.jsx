import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  User,
  Phone,
  Mail,
  Car,
  BadgeCheck,
  Clock3,
  Activity,
  Image as ImageIcon,
  CheckCircle2,
  PauseCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function DriverDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [actionError, setActionError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDriver(res.data?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const setApproval = async (action) => {
    try {
      setActionError('');
      setActionLoading(action);
      await axios.patch(`${API_URL}/api/admin/drivers/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await load();
    } catch (error) {
      setActionError(error?.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading('');
    }
  };

  const images = useMemo(() => {
    if (!driver) return [];
    return [
      { label: 'Profile Photo', key: 'profile_photo_url', url: driver.profile_photo_url },
      { label: 'ID Front', key: 'id_front_url', url: driver.id_front_url },
      { label: 'ID Back', key: 'id_back_url', url: driver.id_back_url },
    ].filter((item) => item.url);
  }, [driver]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyber-pink/20 border-t-cyber-pink animate-spin" />
          <div className="absolute inset-0 bg-cyber-pink/20 blur-xl animate-pulse" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyber-pink">Loading Driver Profile</span>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-40">
        <h2 className="text-3xl font-black text-white mb-3 display-font uppercase tracking-tighter">Driver Not Found</h2>
        <p className="text-text-secondary text-sm max-w-md mx-auto mb-10 leading-relaxed">
          The requested driver record is not available.
        </p>
        <button
          onClick={() => navigate('/drivers')}
          className="cyber-button px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
        >
          Return to Drivers
        </button>
      </div>
    );
  }

  const name = driver.full_name || driver.name || 'Driver';
  const status = driver.approval_status || (driver.is_approved ? 'approved' : 'pending_approval');
  const statusClass =
    status === 'approved'
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : status === 'suspended'
      ? 'bg-cyber-pink/10 text-cyber-pink border-cyber-pink/20'
      : 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20';

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-6">
          <button
            onClick={() => navigate('/drivers')}
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Drivers Link
          </button>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-black border border-white/5 flex items-center justify-center neo-border-pink relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyber-pink/5 group-hover:bg-cyber-pink/10 transition-colors" />
              <Truck className="w-10 h-10 text-cyber-pink relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tighter display-font leading-none uppercase">{name}</h1>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${statusClass}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {status}
                </span>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] font-mono">
                  DRIVER_ID: #{driver.driver_id}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel px-10 py-6 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-30 shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-cyber-blue/10 border border-cyber-blue/20">
              <Activity className="w-6 h-6 text-cyber-blue" />
            </div>
            <div>
              <div className="text-[9px] font-black tracking-[0.3em] uppercase text-text-secondary mb-1">Delivery Activity</div>
              <div className="text-xl font-black text-white uppercase display-font tracking-tight">{driver.delivery_count || 0} Completed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-10 relative overflow-hidden border-white/5">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-30 shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font mb-10">Core Identity</h2>
          <div className="space-y-8">
            <InfoRow label="Full Name" value={name} icon={User} accent="var(--cyber-blue)" />
            <InfoRow label="Email" value={driver.email || '-'} icon={Mail} accent="var(--cyber-purple)" />
            <InfoRow label="Phone" value={driver.phone || '-'} icon={Phone} accent="var(--cyber-pink)" />
            <InfoRow label="Registered" value={driver.created_at ? new Date(driver.created_at).toLocaleString() : '-'} icon={Clock3} accent="var(--cyber-blue)" />
          </div>
        </div>

        <div className="glass-panel p-10 relative overflow-hidden border-white/5">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyber-purple opacity-30 shadow-[0_0_15px_rgba(179,136,255,0.5)]" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font mb-10">Vehicle & Approval</h2>
          <div className="space-y-8">
            <InfoRow label="Vehicle Type" value={driver.vehicle_type || '-'} icon={Car} accent="var(--cyber-purple)" />
            <InfoRow label="Vehicle Plate" value={driver.vehicle_plate || '-'} icon={Car} accent="var(--cyber-pink)" />
            <InfoRow label="License Number" value={driver.license_number || '-'} icon={BadgeCheck} accent="var(--cyber-blue)" />
            <InfoRow label="Approval Status" value={status} icon={BadgeCheck} accent="var(--cyber-purple)" />
            <InfoRow label="Approved At" value={driver.approved_at ? new Date(driver.approved_at).toLocaleString() : '-'} icon={Clock3} accent="var(--cyber-pink)" />
            <InfoRow label="Last Delivery" value={driver.last_delivery_at ? new Date(driver.last_delivery_at).toLocaleString() : '-'} icon={Activity} accent="var(--cyber-blue)" />
          </div>
        </div>
      </div>

      <div className="glass-panel p-10 relative overflow-hidden border-white/5">
        <div className="absolute top-0 left-0 w-1 h-full bg-cyber-pink opacity-30 shadow-[0_0_15px_rgba(255,0,128,0.5)]" />
        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font mb-8">Driver Documents</h2>
        {images.length === 0 ? (
          <p className="text-text-secondary text-sm">No images uploaded for this driver.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {images.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPreview(item)}
                className="flex items-center justify-between rounded-2xl p-5 bg-black/40 border border-white/5 hover:border-cyber-pink/40 transition-all text-left"
              >
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">{item.label}</p>
                  <p className="text-[9px] font-bold text-text-secondary mt-1 uppercase tracking-widest">Open Large View</p>
                </div>
                <ImageIcon className="w-5 h-5 text-cyber-pink" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel p-10 relative overflow-hidden border-white/5">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-blue to-transparent opacity-30 shadow-[0_0_20px_rgba(0,242,255,0.3)]" />
        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font mb-8">Approval Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => setApproval('approve')}
            disabled={actionLoading !== ''}
            className="cyber-button px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500 transition-all flex items-center gap-3 active:scale-95 group"
          >
            <CheckCircle2 className="w-5 h-5 group-hover:scale-125 transition-transform" />
            {actionLoading === 'approve' ? 'Approving...' : 'Approve Driver'}
          </button>
          <button
            type="button"
            onClick={() => setApproval('suspend')}
            disabled={actionLoading !== ''}
            className="cyber-button px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] bg-cyber-pink/5 border-cyber-pink/20 text-cyber-pink hover:bg-cyber-pink/10 hover:border-cyber-pink transition-all flex items-center gap-3 active:scale-95 group"
          >
            <PauseCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {actionLoading === 'suspend' ? 'Suspending...' : 'Suspend Driver'}
          </button>
        </div>
        {actionError && (
          <p className="mt-5 text-xs font-bold text-cyber-pink uppercase tracking-widest">{actionError}</p>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <div className="relative w-full max-w-5xl max-h-[90vh] glass-panel p-4 border-white/20" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 px-2">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white">{preview.label}</p>
              <button onClick={() => setPreview(null)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full h-[75vh] bg-black/40 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
              <img src={preview.url} alt={preview.label} className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const InfoRow = ({ label, value, icon: Icon, accent }) => (
  <div className="group/row flex items-center gap-5">
    <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center transition-all group-hover/row:border-current group-hover/row:scale-110 duration-500" style={{ color: accent }}>
      <Icon className="w-6 h-6 opacity-30 group-hover/row:opacity-100 transition-opacity" />
    </div>
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary group-hover/row:text-white transition-colors">
        {label}
      </p>
      <p className="text-sm font-bold text-white tracking-wide break-words">
        {value}
      </p>
    </div>
  </div>
);

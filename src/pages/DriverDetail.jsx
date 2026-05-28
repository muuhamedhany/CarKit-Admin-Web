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
  const [activeTab, setActiveTab] = useState('details');

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
    <>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
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
              <h1 className="text-4xl font-black text-white tracking-tighter display-font leading-none uppercase">{name}</h1>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column containing tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Selector */}
          <div className="flex border-b border-white/5 overflow-x-auto custom-scrollbar gap-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'details'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Driver Profile
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'docs'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Uploaded Documents
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'activity'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Uplink Activity
            </button>
          </div>

          {/* Tab Content: Details */}
          {activeTab === 'details' && (
            <div className="glass-panel p-8 relative overflow-hidden border-white/5 animate-fade-in">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-30 shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font mb-8">Core Identity & Vehicle Specs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InfoRow label="Full Name" value={name} icon={User} accent="var(--cyber-blue)" />
                <InfoRow label="Vehicle Type" value={driver.vehicle_type || '-'} icon={Car} accent="var(--cyber-purple)" />
                <InfoRow label="Email" value={driver.email || '-'} icon={Mail} accent="var(--cyber-purple)" />
                <InfoRow label="Vehicle Plate" value={driver.vehicle_plate || '-'} icon={Car} accent="var(--cyber-pink)" />
                <InfoRow label="Phone" value={driver.phone || '-'} icon={Phone} accent="var(--cyber-pink)" />
                <InfoRow label="License Number" value={driver.license_number || '-'} icon={BadgeCheck} accent="var(--cyber-blue)" />
                <InfoRow label="Approval Status" value={status} icon={BadgeCheck} accent="var(--cyber-purple)" />
              </div>
            </div>
          )}

          {/* Tab Content: Docs */}
          {activeTab === 'docs' && (
            <div className="glass-panel p-8 relative overflow-hidden border-white/5 animate-fade-in space-y-6">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-pink opacity-30 shadow-[0_0_15px_rgba(255,0,128,0.5)]" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font">Driver Documents</h2>
              {images.length === 0 ? (
                <p className="text-text-secondary text-sm">No images uploaded for this driver.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {images.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setPreview(item)}
                      className="flex flex-col justify-between items-start rounded-2xl p-5 bg-black/40 border border-white/5 hover:border-cyber-pink/40 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-full flex items-center justify-between mb-4">
                        <p className="text-xs font-black text-white uppercase tracking-wider">{item.label}</p>
                        <ImageIcon className="w-4 h-4 text-cyber-pink" />
                      </div>
                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/5 bg-black mb-3 relative">
                        <img src={item.url} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Open Large View</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Activity */}
          {activeTab === 'activity' && (
            <div className="glass-panel p-8 relative overflow-hidden border-white/5 animate-fade-in">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-purple opacity-30 shadow-[0_0_15px_rgba(179,136,255,0.5)]" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font mb-8">Uplink Activity logs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InfoRow label="Registered At" value={driver.created_at ? new Date(driver.created_at).toLocaleString() : '-'} icon={Clock3} accent="var(--cyber-blue)" />
                <InfoRow label="Approved At" value={driver.approved_at ? new Date(driver.approved_at).toLocaleString() : '-'} icon={Clock3} accent="var(--cyber-pink)" />
                <InfoRow label="Last Active Delivery" value={driver.last_delivery_at ? new Date(driver.last_delivery_at).toLocaleString() : '-'} icon={Activity} accent="var(--cyber-blue)" />
              </div>
            </div>
          )}
        </div>

        {/* Right Column containing stats & actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Activity Stats */}
          <div className="glass-panel px-8 py-5 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-30 shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-cyber-blue/10 border border-cyber-blue/20">
                <Activity className="w-5 h-5 text-cyber-blue" />
              </div>
              <div>
                <div className="text-[9px] font-black tracking-[0.3em] uppercase text-text-secondary mb-1">Delivery Activity</div>
                <div className="text-xl font-black text-white uppercase display-font tracking-tight">{driver.delivery_count || 0} Completed</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      </div>

      {/* Floating Approval Actions */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
        <div className="animate-fade-in">
          <div className="glass-panel p-4 bg-black/80 border-cyber-blue/30 flex items-center justify-between gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] neo-border-blue">
            <div className="text-left pl-2 hidden sm:block">
              <p className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em]">Verification State</p>
              <p className="text-xs font-black text-white uppercase tracking-widest">{status}</p>
            </div>
            <div className="flex gap-3 justify-end flex-1 sm:flex-initial">
              <button
                type="button"
                onClick={() => setApproval('suspend')}
                disabled={actionLoading !== ''}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/20 hover:bg-cyber-pink/20 hover:border-cyber-pink/40 disabled:opacity-50 group cursor-pointer"
              >
                <PauseCircle className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                {actionLoading === 'suspend' ? 'Suspending...' : 'Suspend'}
              </button>
              <button
                type="button"
                onClick={() => setApproval('approve')}
                disabled={actionLoading !== ''}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 hover:border-green-500/50 disabled:opacity-50 group cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 group-hover:scale-125 transition-transform" />
                {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
          {actionError && (
            <p className="mt-2 text-[9px] font-bold text-cyber-pink uppercase tracking-widest text-center">{actionError}</p>
          )}
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <div className="relative w-full max-w-5xl max-h-[90vh] glass-panel p-4 border-white/20" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 px-2">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white">{preview.label}</p>
              <button onClick={() => setPreview(null)} className="p-1 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/5 bg-black">
              {preview.url.endsWith('.pdf') ? (
                <iframe src={preview.url} className="w-full h-full border-none" title={preview.label} />
              ) : (
                <img src={preview.url} alt={preview.label} className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const InfoRow = ({ label, value, icon: Icon, accent }) => (
  <div className="group/row flex items-center gap-4">
    <div className="w-9 h-9 shrink-0 rounded-2xl bg-black border border-white/5 flex items-center justify-center transition-all group-hover/row:border-current group-hover/row:scale-110 duration-500" style={{ color: accent }}>
      <Icon className="w-4.5 h-4.5 opacity-30 group-hover/row:opacity-100 transition-opacity" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary group-hover/row:text-white transition-colors truncate">
        {label}
      </p>
      <p className="text-[11px] font-bold text-white tracking-wide break-words truncate">
        {value}
      </p>
    </div>
  </div>
);

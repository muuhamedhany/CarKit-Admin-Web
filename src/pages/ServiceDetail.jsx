import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Wrench, Tag, Store, Clock, Hash, MapPin, Check, X, Shield, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('gallery');

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setService(response.data.data);
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError('Failed to load service details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading('approving');
      await axios.patch(
        `${API_URL}/api/admin/services/${id}/approve`,
        { approval_status: 'active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/pending-services');
    } catch (error) {
      console.error('Error approving service:', error);
      alert('Failed to approve service.');
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this service?')) return;
    try {
      setActionLoading('rejecting');
      await axios.patch(
        `${API_URL}/api/admin/services/${id}/approve`,
        { approval_status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/pending-services');
    } catch (error) {
      console.error('Error rejecting service:', error);
      alert('Failed to reject service.');
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyber-pink/20 border-t-cyber-pink animate-spin" />
          <div className="absolute inset-0 bg-cyber-pink/20 blur-xl animate-pulse" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyber-pink">Scanning Service Payload</span>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="text-center py-40">
        <div className="inline-flex p-6 rounded-3xl bg-cyber-pink/5 border border-cyber-pink/10 mb-8">
          <Shield className="w-12 h-12 text-cyber-pink/40" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3 display-font uppercase tracking-tighter">Access Violation</h2>
        <p className="text-text-secondary text-sm max-w-md mx-auto mb-10 leading-relaxed">
          {error || 'The requested service node could not be localized within the secure registry.'}
        </p>
        <button 
          onClick={() => navigate('/pending-services')} 
          className="cyber-button px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  const isPending = String(service.status || '').toLowerCase() === 'pending';
  const isActive = String(service.status || '').toLowerCase() === 'active';
  const serviceImages = [service.image_url, service.image_url_2, service.image_url_3].filter(Boolean);

  const locationLabel = {
    'mobile': 'Mobile Operative',
    'in-shop': 'Stationary Hub',
    'both': 'Hybrid Operations',
  }[service.location_type] || service.location_type || '—';

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <button
            onClick={() => navigate('/pending-services')}
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Registry Link
          </button>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-black border border-white/5 flex items-center justify-center neo-border-pink relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyber-pink/5 group-hover:bg-cyber-pink/10 transition-colors" />
              <Wrench className="w-10 h-10 text-cyber-pink relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-white tracking-tighter display-font leading-none uppercase">
                  {service.name}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                  isPending ? 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20' : 
                  isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  'bg-cyber-pink/10 text-cyber-pink border-cyber-pink/20'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-current ${isPending ? 'animate-pulse' : ''}`} />
                  Protocol: {service.status || 'unknown'}
                </span>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] font-mono">
                  NODE_ID: {service.service_id}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel px-10 py-6 text-right border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-full bg-cyber-pink/5 skew-x-[-20deg] translate-x-20 group-hover:translate-x-16 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="text-[10px] font-black tracking-[0.3em] uppercase text-text-secondary mb-1">Service Value</div>
            <div className="text-4xl font-black text-cyber-pink display-font">
              {Number(service.price).toLocaleString('en-EG')} <span className="text-sm">EGP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column with Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Selector */}
          <div className="flex border-b border-white/5 overflow-x-auto custom-scrollbar gap-2">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'gallery'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Optical Gallery
            </button>
            <button
              onClick={() => setActiveTab('narrative')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'narrative'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('windows')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'windows'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Operational Windows
            </button>
          </div>

          {/* Tab Content: Gallery */}
          {activeTab === 'gallery' && (
            <div className="glass-panel p-8 relative overflow-hidden border-white/5 animate-fade-in">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-30 shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyber-blue rounded-full shadow-[0_0_10px_rgba(0,242,255,0.8)]" /> 
                  Optical Proofing
                </h2>
                <div className="px-3 py-1 rounded-md bg-white/[0.03] border border-white/5 text-[9px] font-bold text-text-secondary uppercase tracking-widest">
                  {serviceImages.length} Nodes Detected
                </div>
              </div>
              {serviceImages.length > 0 ? (
                <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
                  {serviceImages.map((src, idx) => (
                    <div key={idx} className="relative group shrink-0">
                      <div className="absolute inset-0 bg-cyber-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl z-10" />
                      <img 
                        src={src} 
                        alt={`${service.name} view ${idx + 1}`} 
                        className="w-64 h-64 object-cover rounded-2xl border border-white/10 group-hover:border-cyber-blue/50 transition-all duration-500 shadow-2xl" 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-64 rounded-2xl flex flex-col items-center justify-center bg-black/40 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">No Optical Payloads Uploaded</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Description */}
          {activeTab === 'narrative' && (
            <div className="glass-panel p-8 relative overflow-hidden border-white/5 animate-fade-in">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-purple opacity-30 shadow-[0_0_15px_rgba(179,136,255,0.5)]" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font mb-6 flex items-center gap-3">
                <div className="w-2 h-2 bg-cyber-purple rounded-full shadow-[0_0_10px_rgba(179,136,255,0.8)]" /> 
                Service Narrative
              </h2>
              <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                <p className="text-sm font-medium leading-relaxed text-text-secondary whitespace-pre-wrap">
                  {service.description || 'No descriptive payload detected for this service unit.'}
                </p>
              </div>
            </div>
          )}

          {/* Tab Content: Windows */}
          {activeTab === 'windows' && (
            <div className="glass-panel p-8 relative overflow-hidden border-white/5 animate-fade-in">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-30 shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font mb-6 flex items-center gap-3">
                <div className="w-2 h-2 bg-cyber-blue rounded-full shadow-[0_0_10px_rgba(0,242,255,0.8)]" /> 
                Operational Windows
              </h2>
              {service.available_times && service.available_times.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {service.available_times.map((t, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 rounded-xl bg-black border border-white/5 text-[10px] font-black text-center text-cyber-blue uppercase tracking-widest hover:border-cyber-blue/40 transition-all cursor-default"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/5 bg-black/40 p-6 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">No Operational Windows Configured</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metadata Controller */}
          <div className="glass-panel p-8 relative overflow-hidden border-white/5">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyber-pink opacity-30 shadow-[0_0_15px_rgba(255,0,128,0.5)]" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font mb-8">Diagnostic Metrics</h2>
            
            <div className="space-y-6">
              <InfoRow label="Protocol Cost" value={`${Number(service.price).toLocaleString()} EGP`} icon={Tag} accent="var(--cyber-pink)" />
              <InfoRow label="Execution Time" value={`${service.duration ?? 0} Minutes`} icon={Clock} accent="var(--cyber-blue)" />
              <InfoRow label="Service Source" value={service.provider_name || 'Anonymous'} icon={Store} accent="var(--cyber-purple)" />
              <InfoRow label="Ops Vector" value={locationLabel} icon={MapPin} accent="var(--cyber-blue)" />
              <InfoRow label="System Class" value={service.category_name || 'General'} icon={Hash} accent="var(--cyber-pink)" />
              {service.created_at && (
                <InfoRow label="Initial Uplink" value={new Date(service.created_at).toLocaleDateString()} icon={Activity} accent="var(--cyber-purple)" />
              )}
            </div>
          </div>
          
        </div>
      </div>
      </div>

      {/* Floating Executive Override */}
      {isPending && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
          <div className="animate-fade-in">
            <div className="glass-panel p-4 bg-black/80 border-cyber-pink/30 flex items-center justify-between gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] neo-border-pink">
              <div className="hidden sm:block text-left pl-2">
                <p className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em]">Service Status</p>
                <p className="text-xs font-black text-white uppercase tracking-widest">Pending Review</p>
              </div>
              <div className="flex flex-1 sm:flex-initial gap-3">
                <button
                  onClick={handleReject}
                  disabled={actionLoading !== null}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] bg-cyber-pink/5 border-cyber-pink/20 text-cyber-pink hover:bg-cyber-pink/10 hover:border-cyber-pink transition-all active:scale-95 group cursor-pointer"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  {actionLoading === 'rejecting' ? 'Purging...' : 'Decommission'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading !== null}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:border-green-500/50 transition-all active:scale-95 group cursor-pointer"
                >
                  <Check className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  {actionLoading === 'approving' ? 'Authorizing...' : 'Authorize'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const InfoRow = ({ label, value, icon: Icon, accent }) => (
  <div className="group/row flex items-center gap-4">
    <div className="w-9 h-9 shrink-0 rounded-xl bg-black border border-white/5 flex items-center justify-center transition-all group-hover/row:border-current group-hover/row:scale-110 duration-500" style={{ color: accent }}>
      <Icon className="w-4.5 h-4.5 opacity-30 group-hover/row:opacity-100 transition-opacity" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary group-hover/row:text-white transition-colors truncate">
        {label}
      </p>
      <p className="text-sm font-bold text-white tracking-wide truncate">
        {value}
      </p>
    </div>
  </div>
);

export default ServiceDetail;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, FileText, Eye, CheckCircle, XCircle, Loader2, Store, Shield, Activity, Fingerprint } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const VendorDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/vendors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setVendor(res.data.data);
    } catch (err) {
      console.error('Error fetching vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendor(); }, [id]);

  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      await axios.put(`${API_URL}/api/vendors/${id}`, { verification_status: status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVendor();
    } catch (err) {
      console.error('Error updating vendor:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return { bg: 'bg-green-500/10', color: 'text-green-400', border: 'border-green-500/20' };
      case 'rejected': return { bg: 'bg-cyber-pink/10', color: 'text-cyber-pink', border: 'border-cyber-pink/20' };
      default: return { bg: 'bg-cyber-blue/10', color: 'text-cyber-blue', border: 'border-cyber-blue/20' };
    }
  };

  const getDocUrl = (doc) => doc?.startsWith('http') ? doc : `${API_URL}${doc}`;
  const getDocName = (url) => {
    if (!url) return '';
    try { return decodeURIComponent(url.split('/').pop()); } catch { return url.split('/').pop(); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyber-purple/20 border-t-cyber-purple animate-spin" />
          <div className="absolute inset-0 bg-cyber-purple/20 blur-xl animate-pulse" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyber-purple">Decrypting Vendor Profile</span>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-40">
        <div className="inline-flex p-6 rounded-3xl bg-cyber-pink/5 border border-cyber-pink/10 mb-8">
          <Shield className="w-12 h-12 text-cyber-pink/40" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3 display-font uppercase tracking-tighter">Node Not Found</h2>
        <p className="text-text-secondary text-sm max-w-md mx-auto mb-10 leading-relaxed">
          The vendor entity you are attempting to access does not exist in the current registry shard.
        </p>
        <button
          onClick={() => navigate('/vendors')}
          className="cyber-button px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const status = vendor.verification_status || 'pending';
  const s = getStatusStyle(status);
  const documents = [
    { label: 'Business License', url: vendor.document_1_url },
    { label: 'Tax ID / EIN', url: vendor.document_2_url },
    { label: 'National ID - FrontSide', url: vendor.document_3_url },
    { label: 'National ID - BackSide', url: vendor.document_4_url },
    { label: 'Owner Selfie', url: vendor.document_5_url },
    { label: 'Experience Certs', url: vendor.document_6_url },
  ].filter(d => d.url);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-6">
          <button
            onClick={() => navigate('/vendors')}
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Registry Link
          </button>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-black border border-white/5 flex items-center justify-center neo-border-purple relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyber-purple/5 group-hover:bg-cyber-purple/10 transition-colors" />
              <Store className="w-10 h-10 text-cyber-purple relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-5xl font-black text-white tracking-tighter display-font leading-none uppercase">
                  {vendor.name}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${s.bg} ${s.color} ${s.border}`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-current ${status === 'pending' ? 'animate-pulse' : ''}`} />
                  Verification: {status}
                </span>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] font-mono">
                  VENDOR_ID: #{vendor.vendor_id}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel px-10 py-6 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyber-purple opacity-30 shadow-[0_0_15px_rgba(179,136,255,0.5)]" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-cyber-purple/10 border border-cyber-purple/20">
              <Fingerprint className="w-6 h-6 text-cyber-purple" />
            </div>
            <div>
              <div className="text-[9px] font-black tracking-[0.3em] uppercase text-text-secondary mb-1">Identity Status</div>
              <div className="text-xl font-black text-white uppercase display-font tracking-tight">Verified Protocol</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendor Information */}
        <div className="glass-panel p-10 relative overflow-hidden border-white/5">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-30 shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font mb-10 flex items-center gap-3">
            <div className="w-2 h-2 bg-cyber-blue rounded-full shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
            Entity Profile
          </h2>
          <div className="space-y-8">
            <InfoRow label="Legal Name" value={vendor.name} accent="var(--cyber-blue)" />
            <InfoRow label="Communication Channel" value={vendor.contact_info || 'Protocol Offline'} accent="var(--cyber-purple)" />
            <InfoRow label="System ID" value={`#${vendor.vendor_id}`} accent="var(--cyber-pink)" />
          </div>
        </div>

        {/* Submitted Documents */}
        <div className="glass-panel p-10 relative overflow-hidden border-white/5">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyber-purple opacity-30 shadow-[0_0_15px_rgba(179,136,255,0.5)]" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font mb-10 flex items-center gap-3">
            <div className="w-2 h-2 bg-cyber-purple rounded-full shadow-[0_0_10px_rgba(179,136,255,0.8)]" />
            Verification Documents
          </h2>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5">
                <FileText className="w-10 h-10 text-white/10" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">No document payloads detected</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl p-5 bg-black/40 border border-white/5 hover:border-cyber-purple/40 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyber-purple/5 border border-cyber-purple/10 flex items-center justify-center group-hover:bg-cyber-purple/10 transition-colors">
                      <FileText className="w-6 h-6 text-cyber-purple" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-wider">{doc.label}</p>
                      <p className="text-[9px] font-bold text-text-secondary mt-1 font-mono uppercase truncate max-w-[150px]">{getDocName(doc.url)}</p>
                    </div>
                  </div>
                  <a
                    href={getDocUrl(doc.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-button px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-cyber-purple/10 border-cyber-purple/20 text-cyber-purple hover:bg-cyber-purple/20 hover:border-cyber-purple transition-all flex items-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Final Action Hub */}
      <div className="glass-panel p-10 relative overflow-hidden border-white/5">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-blue to-transparent opacity-30 shadow-[0_0_20px_rgba(0,242,255,0.3)]" />
        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white display-font mb-8 flex items-center gap-3">
          <div className="w-2 h-2 bg-cyber-blue rounded-full shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
          Verification Protocol
        </h2>
        <div className="flex flex-wrap gap-4">
          {status !== 'approved' && (
            <button
              onClick={() => updateStatus('approved')}
              disabled={updating}
              className="cyber-button px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500 transition-all flex items-center gap-3 active:scale-95 group"
            >
              <CheckCircle className="w-5 h-5 group-hover:scale-125 transition-transform" />
              {updating ? 'Processing...' : 'Authorize Vendor'}
            </button>
          )}
          {status !== 'rejected' && (
            <button
              onClick={() => updateStatus('rejected')}
              disabled={updating}
              className="cyber-button px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] bg-cyber-pink/5 border-cyber-pink/20 text-cyber-pink hover:bg-cyber-pink/10 hover:border-cyber-pink transition-all flex items-center gap-3 active:scale-95 group"
            >
              <XCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              {updating ? 'Processing...' : 'Decommission Entity'}
            </button>
          )}
        </div>
        <p className="text-[9px] font-bold text-text-secondary/40 uppercase tracking-[0.2em] mt-8">
          Authorized personal only. All verification protocols are logged in the secure audit chain.
        </p>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, accent }) => (
  <div className="group/row">
    <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 text-text-secondary group-hover/row:text-white transition-colors">{label}</p>
    <div className="flex items-center gap-4">
      <div className="w-1.5 h-10 rounded-full bg-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-current opacity-40 group-hover/row:h-full transition-all duration-500" style={{ color: accent }} />
      </div>
      <p className="text-sm font-bold text-white tracking-wide">{value}</p>
    </div>
  </div>
);

export default VendorDetail;

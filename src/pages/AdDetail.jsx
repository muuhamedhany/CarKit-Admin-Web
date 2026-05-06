import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Loader2, Megaphone, Tag, Clock, Hash, Check, X, Target, Package, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const AdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // No longer using targeting state
  
  useEffect(() => {
    fetchAdDetails();
  }, [id]);

  const fetchAdDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/promotions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAd(response.data.data);
    } catch (err) {
      console.error('Error fetching ad details:', err);
      setError('Failed to load ad details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setActionLoading(newStatus === 'active' ? 'approving' : 'rejecting');
      await axios.patch(
        `${API_URL}/api/promotions/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/pending-ads');
    } catch (error) {
      console.error(`Error updating ad status to ${newStatus}:`, error);
      alert(`Failed to ${newStatus === 'active' ? 'approve' : 'reject'} ad.`);
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyber-pink/20 border-t-cyber-pink animate-spin" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-pink animate-pulse">Accessing Archive</span>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 animate-fade-in">
        <div className="glass-panel p-8 text-center border-cyber-pink/30 bg-cyber-pink/5">
          <p className="text-xs font-black text-cyber-pink uppercase tracking-widest">{error || 'Archive link severed - Ad not found.'}</p>
        </div>
        <button
          onClick={() => navigate('/pending-ads')}
          className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const isPending = String(ad.status || '').toLowerCase() === 'pending';
  const isActive = String(ad.status || '').toLowerCase() === 'active';

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-6">
        <button
          onClick={() => navigate('/pending-ads')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-cyber-pink transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Approval Queue
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-cyber-pink neo-border-pink relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyber-pink/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Megaphone className="w-10 h-10 relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter display-font uppercase">
                {ad.title || 'UNNAMED_PROMOTION'}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span 
                  className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border animate-pulse"
                  style={{
                    background: isPending ? 'rgba(59,130,246,0.1)' : isActive ? 'rgba(34,197,94,0.1)' : 'rgba(255,0,128,0.1)',
                    color: isPending ? '#3B82F6' : isActive ? '#4ade80' : '#FF0080',
                    borderColor: isPending ? 'rgba(59,130,246,0.2)' : isActive ? 'rgba(34,197,94,0.2)' : 'rgba(255,0,128,0.2)',
                    boxShadow: `0 0 10px ${isPending ? 'rgba(59,130,246,0.1)' : isActive ? 'rgba(34,197,94,0.1)' : 'rgba(255,0,128,0.1)'}`
                  }}
                >
                  {String(ad.status || 'STATUS_UNKNOWN').toUpperCase()}
                </span>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                  SECTOR_ID: {ad.ad_id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Banner Display */}
          <div className="glass-panel p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyber-pink opacity-50" />
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyber-pink" /> PROMOTIONAL_ASSET
            </h2>
            {ad.banner_image_url ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all shadow-2xl">
                <img 
                  src={ad.banner_image_url} 
                  alt="Promotion Asset" 
                  className="w-full aspect-[16/9] object-cover" 
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              <div className="w-full aspect-[16/9] rounded-2xl flex flex-col items-center justify-center bg-black border border-dashed border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">ASSET_NOT_DETECTED</p>
              </div>
            )}
          </div>

          {/* Logic Summary */}
          <div className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-50" />
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-cyber-blue" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">TARGETING_PROTOCOLS</h2>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary leading-relaxed">
              THIS DEPLOYMENT WILL AUTO-FILTER SECTOR RESULTS TO HIGHLIGHT ALL NODES FROM <span className="text-white border-b border-cyber-blue/30">{ad.advertiser_name}</span>.
              VENDORS FILTER FOR PRODUCTS, AND SERVICE PROVIDERS FILTER FOR SERVICES.
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          {/* Metadata Grid */}
          <div className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyber-purple opacity-50" />
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-8 flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyber-purple" /> DATA_SPECS
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-5 group/item">
                <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center text-cyber-pink group-hover/item:neo-border-pink transition-all">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">TRANSACTION_VALUE</p>
                  <p className="text-sm font-black text-white uppercase tracking-tight display-font">{Number(ad.price).toLocaleString('en-EG')} EGP</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group/item">
                <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center text-cyber-blue group-hover/item:neo-border-blue transition-all">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">DEPLOY_WINDOW</p>
                  <p className="text-sm font-black text-white uppercase tracking-tight display-font">{ad.duration_days} CYCLES</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group/item">
                <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center text-cyber-purple group-hover/item:neo-border-purple transition-all">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">ORIGIN_ENTITY</p>
                  <p className="text-sm font-black text-white uppercase tracking-tight display-font truncate max-w-[200px]">{ad.advertiser_name || 'UNKNOWN'}</p>
                  <p className="text-[8px] font-bold text-cyber-purple uppercase tracking-widest mt-0.5">CLASS: {ad.advertiser_type}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group/item">
                <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center text-white/40 group-hover/item:border-white/40 transition-all">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">LOG_TIMESTAMP</p>
                  <p className="text-sm font-black text-white uppercase tracking-tight display-font">
                    {new Date(ad.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {ad.start_date && (
                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-xl bg-cyber-purple/10 border border-cyber-purple/30 flex items-center justify-center text-cyber-purple animate-pulse">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">ACTIVE_WINDOW</p>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest mt-1">
                        {new Date(ad.start_date).toLocaleDateString()} — {new Date(ad.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Decision Center */}
          {isPending && (
            <div className="glass-panel p-8 relative overflow-hidden bg-black/40">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-pink opacity-50 animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8 flex items-center gap-2">
                <Check className="w-4 h-4 text-cyber-pink" /> DECISION_CENTER
              </h2>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleUpdateStatus('active')}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 disabled:opacity-50 group"
                >
                  <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {actionLoading === 'approving' ? 'AUTHORIZING...' : 'AUTHORIZE_DEPLOYMENT'}
                </button>
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-cyber-pink/5 text-cyber-pink border border-cyber-pink/20 hover:bg-cyber-pink/20 hover:border-cyber-pink/40 disabled:opacity-50 group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  {actionLoading === 'rejecting' ? 'TERMINATING...' : 'ABORT_PROMOTION'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdDetail;

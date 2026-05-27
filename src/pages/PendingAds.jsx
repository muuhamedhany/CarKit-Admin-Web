import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Megaphone, Check, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const PendingAds = () => {
  const { token } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedAds = React.useMemo(() => {
    const filtered = ads.filter((ad) => {
      if (!search.trim()) return true;
      const haystack = [ad.title, ad.advertiser_name].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(search.toLowerCase());
    });

    return [...filtered].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

      if (sortBy === 'newest') {
        if (dateA !== dateB) return dateB - dateA;
        return b.ad_id - a.ad_id;
      } else {
        if (dateA !== dateB) return dateA - dateB;
        return a.ad_id - b.ad_id;
      }
    });
  }, [ads, search, sortBy]);

  const fetchPendingAds = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/promotions/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter only pending ads
      const pendingAds = (response.data.data || []).filter(ad => ad.status === 'pending');
      setAds(pendingAds);
    } catch (error) {
      console.error('Error fetching pending ads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAds();
  }, []);

  const handleUpdateStatus = async (adId, newStatus) => {
    try {
      setApproving((prev) => ({ ...prev, [adId]: newStatus }));
      await axios.patch(
        `${API_URL}/api/promotions/${adId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAds((prev) => prev.filter((ad) => ad.ad_id !== adId));
      setApproving((prev) => {
        const newState = { ...prev };
        delete newState[adId];
        return newState;
      });
    } catch (error) {
      console.error(`Error updating ad status to ${newStatus}:`, error);
      setApproving((prev) => ({ ...prev, [adId]: 'error' }));
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter display-font uppercase">
            Broadcast Approvals
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mt-2">
            Verification required for promotional data broadcasts.
            {!loading && <span className="text-cyber-pink ml-2">[{filteredAndSortedAds.length} streams pending]</span>}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group min-w-[200px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-pink to-cyber-purple opacity-10 group-focus-within:opacity-30 transition-opacity blur rounded-xl" />
            <input
              type="text"
              placeholder="SEARCH BROADCASTS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="relative w-full rounded-xl py-3 pl-4 pr-4 text-[10px] font-black tracking-widest uppercase outline-none bg-black border border-white/10 text-white focus:neo-border-pink transition-all placeholder:text-white/20"
            />
          </div>
          <div className="relative group min-w-[180px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-pink to-cyber-purple opacity-20 group-hover:opacity-40 transition-opacity blur rounded-xl" />
            <select
              className="relative w-full rounded-xl py-3 pl-4 pr-10 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer bg-black border border-white/10 text-white appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">SORT: NEWEST FIRST</option>
              <option value="oldest">SORT: OLDEST FIRST</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary group-hover:text-cyber-pink transition-colors">
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
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-pink animate-pulse">Syncing Streams</span>
        </div>
      ) : filteredAndSortedAds.length === 0 ? (
        <div className="glass-panel p-20 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Megaphone className="w-16 h-16 mx-auto mb-6 text-white/5 group-hover:text-cyber-blue/20 transition-colors" />
          <p className="text-sm font-black uppercase tracking-widest text-text-secondary">No pending broadcasts</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedAds.map((ad) => (
            <div
              key={ad.ad_id}
              className="glass-panel p-6 group relative overflow-hidden flex flex-col h-full border-white/5 hover:border-white/20 transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-pink/5 skew-x-[-20deg] translate-x-12 -translate-y-12 group-hover:translate-x-8 transition-transform duration-700" />
              
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  {ad.banner_image_url ? (
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-cyber-pink/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img
                        src={ad.banner_image_url}
                        alt={ad.title || 'Ad Banner'}
                        className="w-20 h-14 rounded-lg object-cover border border-white/10 relative z-10"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-14 rounded-lg bg-black border border-white/10 flex items-center justify-center text-xs font-black text-cyber-pink display-font relative z-10 uppercase">
                      NO_IMG
                    </div>
                  )}
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-black text-white truncate display-font uppercase tracking-tight" title={ad.title || 'Untitled Ad'}>
                      {ad.title || 'Untitled Ad'}
                    </p>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
                      SRC: {ad.advertiser_name || 'ANONYMOUS'}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/pending-ads/${ad.ad_id}`}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-text-secondary hover:text-white hover:border-white/20 transition-all active:scale-90"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3 mb-8 flex-1 relative z-10">
                <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Horizon</span>
                  <span className="text-xs font-black text-white display-font uppercase">
                    {ad.duration_days} Solar Cycles
                  </span>
                </div>
                <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Timestamp</span>
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                    {new Date(ad.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 relative z-10">
                <button
                  onClick={() => handleUpdateStatus(ad.ad_id, 'active')}
                  disabled={approving[ad.ad_id] !== undefined}
                  className="cyber-button flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500 transition-all group/btn"
                >
                  <Check className="w-3 h-3 group-hover/btn:scale-125 transition-transform" />
                  {approving[ad.ad_id] === 'active' ? '...' : 'Clear'}
                </button>
                <button
                  onClick={() => handleUpdateStatus(ad.ad_id, 'rejected')}
                  disabled={approving[ad.ad_id] !== undefined}
                  className="cyber-button flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-cyber-pink/5 border-cyber-pink/20 text-cyber-pink hover:bg-cyber-pink/10 hover:border-cyber-pink transition-all group/btn"
                >
                  <X className="w-3 h-3 group-hover/btn:rotate-90 transition-transform" />
                  {approving[ad.ad_id] === 'rejected' ? '...' : 'Eject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingAds;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Wrench, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const ServiceProviders = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedProviders = React.useMemo(() => {
    const filtered = providers.filter((p) => {
      if (!search.trim()) return true;
      const haystack = [p.name, p.contact_info].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return b.provider_id - a.provider_id;
      } else {
        return a.provider_id - b.provider_id;
      }
    });
  }, [providers, search, sortBy]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const url = filter !== 'all' ? `${API_URL}/api/service-providers?status=${filter}` : `${API_URL}/api/service-providers`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProviders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [filter]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', border: 'rgba(34,197,94,0.2)', glow: '0 0 10px rgba(34,197,94,0.2)' };
      case 'rejected':
        return { bg: 'rgba(255,0,128,0.1)', color: '#FF0080', border: 'rgba(255,0,128,0.2)', glow: '0 0 10px rgba(255,0,128,0.2)' };
      default:
        return { bg: 'rgba(180,92,255,0.1)', color: '#B45CFF', border: 'rgba(180,92,255,0.2)', glow: '0 0 10px rgba(180,92,255,0.2)' };
    }
  };

  const docCount = (p) => [p.document_1_url, p.document_2_url, p.document_3_url, p.document_4_url, p.document_5_url, p.document_6_url].filter(Boolean).length;

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter display-font uppercase">
            Service Entities
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mt-2">
            Vetting and synchronization of platform providers.
            {!loading && <span className="text-cyber-pink ml-2">[{filteredAndSortedProviders.length} registered nodes]</span>}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative group min-w-[200px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-blue to-cyber-purple opacity-10 group-focus-within:opacity-30 transition-opacity blur rounded-xl" />
            <input
              type="text"
              placeholder="SEARCH ENTITIES..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="relative w-full rounded-xl py-3 pl-4 pr-4 text-[10px] font-black tracking-widest uppercase outline-none bg-black border border-white/10 text-white focus:neo-border-purple transition-all placeholder:text-white/20"
            />
          </div>

          <div className="relative group min-w-[180px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-blue to-cyber-purple opacity-20 group-hover:opacity-40 transition-opacity blur rounded-xl" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="relative w-full rounded-xl py-3 pl-4 pr-10 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer bg-black border border-white/10 text-white appearance-none"
            >
              <option value="all">FILTER: GLOBAL</option>
              <option value="pending">STATUS: PENDING</option>
              <option value="approved">STATUS: APPROVED</option>
              <option value="rejected">STATUS: REJECTED</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary group-hover:text-cyber-blue transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative group min-w-[180px]">
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
            <div className="w-16 h-16 rounded-full border-2 border-cyber-pink/20 border-t-cyber-pink animate-spin" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-pink animate-pulse">Scanning Registry</span>
        </div>
      ) : filteredAndSortedProviders.length === 0 ? (
        <div className="glass-panel p-20 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyber-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Wrench className="w-16 h-16 mx-auto mb-6 text-white/5 group-hover:text-cyber-purple/20 transition-colors" />
          <p className="text-sm font-black uppercase tracking-widest text-text-secondary">
            No provider entities found in sector
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAndSortedProviders.map((provider) => {
            const status = provider.verification_status || 'pending';
            const s = getStatusStyle(status);
            const docs = docCount(provider);
            return (
              <button
                key={provider.provider_id}
                onClick={() => navigate(`/service-providers/${provider.provider_id}`)}
                className="glass-panel p-6 group cursor-pointer relative overflow-hidden flex flex-col h-full text-left border-white/5 hover:border-white/20 transition-all active:scale-[0.98]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-pink/5 skew-x-[-20deg] translate-x-12 -translate-y-12 group-hover:translate-x-8 transition-transform duration-700" />
                
                <div className="flex items-start justify-between gap-4 mb-8 relative z-10">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center text-cyber-purple transition-all group-hover:neo-border-purple text-lg font-black display-font">
                      {provider.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white display-font uppercase tracking-tight truncate">
                        {provider.name}
                      </p>
                      <p className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.1em] truncate mt-0.5">
                        {provider.contact_info || 'NO_CONTACT_DATA'}
                      </p>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest border shrink-0 transition-all"
                    style={{ background: s.bg, color: s.color, borderColor: s.border, boxShadow: s.glow }}
                  >
                    <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                    {status}
                  </span>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 relative z-10 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                    {docs} ARCHIVES ATTACHED
                  </span>
                  <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-cyber-pink opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    VET ENTITY <ArrowRight className="w-3 h-3" />
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

export default ServiceProviders;

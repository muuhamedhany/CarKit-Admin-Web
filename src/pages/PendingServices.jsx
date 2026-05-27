import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Wrench, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const PendingServices = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState({});
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedServices = React.useMemo(() => {
    const filtered = services.filter((s) => {
      if (!search.trim()) return true;
      const haystack = [s.name, s.provider_name].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(search.toLowerCase());
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return b.service_id - a.service_id;
      } else {
        return a.service_id - b.service_id;
      }
    });
  }, [services, search, sortBy]);

  const fetchPendingServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/services/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingServices();
  }, []);

  const handleApprove = async (serviceId) => {
    try {
      setActing((prev) => ({ ...prev, [serviceId]: 'approving' }));
      await axios.patch(
        `${API_URL}/api/admin/services/${serviceId}/approve`,
        { approval_status: 'active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServices((prev) => prev.filter((s) => s.service_id !== serviceId));
    } catch (error) {
      console.error('Error approving service:', error);
      setActing((prev) => ({ ...prev, [serviceId]: 'error' }));
    } finally {
      setActing((prev) => { const n = { ...prev }; delete n[serviceId]; return n; });
    }
  };

  const handleReject = async (serviceId) => {
    try {
      setActing((prev) => ({ ...prev, [serviceId]: 'rejecting' }));
      await axios.patch(
        `${API_URL}/api/admin/services/${serviceId}/approve`,
        { approval_status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServices((prev) => prev.filter((s) => s.service_id !== serviceId));
    } catch (error) {
      console.error('Error rejecting service:', error);
      setActing((prev) => ({ ...prev, [serviceId]: 'error' }));
    } finally {
      setActing((prev) => { const n = { ...prev }; delete n[serviceId]; return n; });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter display-font uppercase">
            Service Intake
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mt-2">
            Review and authorization of provider service submissions.
            {!loading && <span className="text-cyber-pink ml-2">[{filteredAndSortedServices.length} pending vetting]</span>}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group min-w-[200px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-pink to-cyber-purple opacity-10 group-focus-within:opacity-30 transition-opacity blur rounded-xl" />
            <input
              type="text"
              placeholder="SEARCH INTAKES..."
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
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-pink animate-pulse">Syncing Services</span>
        </div>
      ) : filteredAndSortedServices.length === 0 ? (
        <div className="glass-panel p-20 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyber-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Wrench className="w-16 h-16 mx-auto mb-6 text-white/5 group-hover:text-cyber-purple/20 transition-colors" />
          <p className="text-sm font-black uppercase tracking-widest text-text-secondary">
            Registry clear - no pending services
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAndSortedServices.map((service) => (
            <button
              key={service.service_id}
              onClick={() => navigate(`/pending-services/${service.service_id}`)}
              className="glass-panel p-6 group cursor-pointer relative overflow-hidden flex flex-col h-full text-left border-white/5 hover:border-white/20 transition-all active:scale-[0.98]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-pink/5 skew-x-[-20deg] translate-x-12 -translate-y-12 group-hover:translate-x-8 transition-transform duration-700" />
              
              <div className="flex items-start justify-between gap-4 mb-8 relative z-10">
                <div className="flex items-center gap-4 min-w-0">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-12 h-12 rounded-xl object-cover bg-black border border-white/10 group-hover:neo-border-pink transition-all"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center text-cyber-purple transition-all group-hover:neo-border-purple text-lg font-black display-font">
                      {service.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                  )}
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">INTAKE_ID #{service.service_id}</p>
                    <p className="text-sm font-black text-white display-font uppercase tracking-tight truncate mt-0.5">
                      {service.name}
                    </p>
                    <p className="text-[9px] font-bold text-cyber-purple uppercase tracking-[0.1em] truncate mt-0.5">
                      BY {service.provider_name || 'ANONYMOUS_ENTITY'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8 relative z-10 flex-1">
                <div className="flex justify-between items-center px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">CREDIT COST</span>
                  <span className="text-xs font-black text-cyber-pink display-font">{Number(service.price).toLocaleString('en-EG')} EGP</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">EST_DURATION</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-tight">{service.duration ?? 0} MINUTES</span>
                </div>
              </div>

              <div className="flex gap-3 items-center pt-6 border-t border-white/5 relative z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); handleApprove(service.service_id); }}
                  disabled={acting[service.service_id] !== undefined}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all bg-green-500/5 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 disabled:opacity-50"
                >
                  <Check className="w-3 h-3" />
                  {acting[service.service_id] === 'approving' ? '...' : 'AUTHORIZE'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReject(service.service_id); }}
                  disabled={acting[service.service_id] !== undefined}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all bg-cyber-pink/5 text-cyber-pink border border-cyber-pink/20 hover:bg-cyber-pink/20 hover:border-cyber-pink/40 disabled:opacity-50"
                >
                  <X className="w-3 h-3" />
                  {acting[service.service_id] === 'rejecting' ? '...' : 'REJECT'}
                </button>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingServices;

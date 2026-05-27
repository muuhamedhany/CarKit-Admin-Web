import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, PauseCircle, Search, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;
const statuses = ['all', 'pending_approval', 'approved', 'suspended'];

const getStatusStyle = (status) => {
  switch (status) {
    case 'approved':
      return { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', border: 'rgba(34,197,94,0.2)' };
    case 'suspended':
      return { bg: 'rgba(255,0,128,0.1)', color: '#FF0080', border: 'rgba(255,0,128,0.2)' };
    default:
      return { bg: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: 'rgba(0,212,255,0.2)' };
  }
};

export default function Drivers() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const query = status === 'all' ? '' : `?status=${status}`;
      const res = await axios.get(`${API_URL}/api/admin/drivers${query}`, { headers: { Authorization: `Bearer ${token}` } });
      setDrivers(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const filteredAndSorted = useMemo(() => {
    const filtered = drivers.filter((driver) => [
      driver.full_name, driver.name, driver.phone, driver.vehicle_type, driver.vehicle_plate, driver.approval_status,
    ].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase()));

    return [...filtered].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

      if (sortBy === 'newest') {
        if (dateA !== dateB) return dateB - dateA;
        return b.driver_id - a.driver_id;
      } else {
        if (dateA !== dateB) return dateA - dateB;
        return a.driver_id - b.driver_id;
      }
    });
  }, [drivers, search, sortBy]);

  const setApproval = async (driverId, action, event) => {
    event.stopPropagation();
    await axios.patch(`${API_URL}/api/admin/drivers/${driverId}/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter display-font uppercase">Drivers</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mt-2">
            Approve and monitor delivery agents.
            {!loading && <span className="text-cyber-pink ml-2">[{filteredAndSorted.length} active nodes]</span>}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="pl-11 pr-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search drivers" />
          </div>
          <select className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-cyber-pink/20 border-t-cyber-pink animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-pink animate-pulse">Querying Database</span>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="glass-panel p-20 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Truck className="w-16 h-16 mx-auto mb-6 text-white/5 group-hover:text-cyber-blue/20 transition-colors" />
          <p className="text-sm font-black uppercase tracking-widest text-text-secondary">No driver profiles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSorted.map((driver) => {
            const name = driver.full_name || driver.name || 'Driver';
            const statusStyle = getStatusStyle(driver.approval_status);
            return (
              <div
                key={driver.driver_id}
                onClick={() => navigate(`/drivers/${driver.driver_id}`)}
                className="glass-panel p-6 group cursor-pointer relative overflow-hidden flex flex-col h-full border-white/5 hover:border-white/20 transition-all active:scale-[0.98]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-pink/5 skew-x-[-20deg] translate-x-12 -translate-y-12 group-hover:translate-x-8 transition-transform duration-700" />

                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-black border border-white/10 flex items-center justify-center text-sm font-black text-cyber-pink display-font transition-all group-hover:neo-border-pink">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-black text-white truncate display-font uppercase tracking-tight" title={name}>{name}</p>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1 truncate max-w-[150px]">{driver.phone || 'NO_PHONE'}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest border shrink-0 transition-all" style={{ background: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}>
                    <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                    {driver.approval_status || 'pending_approval'}
                  </span>
                </div>

                <div className="space-y-2 relative z-10 mb-5">
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary">{driver.email || 'NO_EMAIL'}</p>
                  <p className="text-xs text-white/90 font-bold">{driver.vehicle_type || '-'} {driver.vehicle_plate || ''}</p>
                </div>

                <div className="flex items-center justify-between pt-5 mt-auto border-t border-white/5 relative z-10 gap-3">
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300" onClick={(e) => setApproval(driver.driver_id, 'approve', e)} title="Approve">
                      <CheckCircle2 size={16} />
                    </button>
                    <button className="p-2 rounded-lg bg-cyber-pink/10 text-cyber-pink" onClick={(e) => setApproval(driver.driver_id, 'suspend', e)} title="Suspend">
                      <PauseCircle size={16} />
                    </button>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-cyber-pink opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    ACCESS <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

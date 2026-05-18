import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Activity, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;
const statuses = ['all', 'searching', 'accepted', 'arrived', 'completed', 'expired', 'cancelled'];

export default function EmergencyMonitor() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    const query = status === 'all' ? '' : `?status=${status}`;
    const res = await axios.get(`${API_URL}/api/admin/emergency/requests${query}`, { headers: { Authorization: `Bearer ${token}` } });
    setRequests(res.data?.data || []);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [status]);

  const filtered = useMemo(() => requests.filter((request) => [
    request.request_id, request.customer_name, request.service_name, request.employee_full_name, request.employee_name, request.status,
  ].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())), [requests, search]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter display-font uppercase">Emergency</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mt-2">Live monitor for roadside assistance requests.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input className="pl-11 pr-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search requests" />
          </div>
          <select className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs outline-none" value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="grid grid-cols-[.7fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-white/10">
          <span>ID</span><span>Customer</span><span>Service</span><span>Status</span><span>Employee</span><span>Created</span>
        </div>
        {filtered.map((request) => (
          <div key={request.request_id} className="grid grid-cols-[.7fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-white/5 items-center text-sm">
            <span className="text-white font-bold flex items-center gap-2"><Activity size={15} className="text-cyber-pink" /> #{request.request_id}</span>
            <span className="text-text-secondary">{request.customer_name || '-'}</span>
            <span className="text-white">{request.service_name || request.service_type || '-'}</span>
            <span className="text-cyber-blue uppercase text-xs">{request.status}</span>
            <span className="text-text-secondary">{request.employee_full_name || request.employee_name || '-'}</span>
            <span className="text-text-secondary">{request.created_at ? new Date(request.created_at).toLocaleString() : '-'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

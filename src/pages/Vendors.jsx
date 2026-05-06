import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Store, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Vendors = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const url = filter !== 'all' ? `${API_URL}/api/vendors?status=${filter}` : `${API_URL}/api/vendors`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [filter]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', border: 'rgba(34,197,94,0.2)', glow: '0 0 10px rgba(34,197,94,0.2)' };
      case 'rejected': return { bg: 'rgba(255,0,128,0.1)', color: '#FF0080', border: 'rgba(255,0,128,0.2)', glow: '0 0 10px rgba(255,0,128,0.2)' };
      default: return { bg: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: 'rgba(0,212,255,0.2)', glow: '0 0 10px rgba(0,212,255,0.2)' };
    }
  };

  const docCount = (v) => [v.document_1_url, v.document_2_url, v.document_3_url].filter(Boolean).length;

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter display-font uppercase">
            Vendor Registry
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mt-2">
            Managing authorized commercial entities.
            {!loading && <span className="text-cyber-pink ml-2">[{vendors.length} active nodes]</span>}
          </p>
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-pink to-cyber-purple opacity-20 group-hover:opacity-40 transition-opacity blur rounded-xl" />
          <select
            className="relative rounded-xl py-3 pl-4 pr-10 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer bg-black border border-white/10 text-white appearance-none min-w-[200px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Global Filter: All</option>
            <option value="pending">Status: Pending</option>
            <option value="approved">Status: Approved</option>
            <option value="rejected">Status: Rejected</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary group-hover:text-cyber-pink transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-cyber-pink/20 border-t-cyber-pink animate-spin" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-pink animate-pulse">Querying Database</span>
        </div>
      ) : vendors.length === 0 ? (
        <div className="glass-panel p-20 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Store className="w-16 h-16 mx-auto mb-6 text-white/5 group-hover:text-cyber-blue/20 transition-colors" />
          <p className="text-sm font-black uppercase tracking-widest text-text-secondary">No entities found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vendors.map((vendor) => {
            const status = vendor.verification_status || 'pending';
            const s = getStatusStyle(status);
            const docs = docCount(vendor);
            return (
              <div
                key={vendor.vendor_id}
                onClick={() => navigate(`/vendors/${vendor.vendor_id}`)}
                className="glass-panel p-6 group cursor-pointer relative overflow-hidden flex flex-col h-full border-white/5 hover:border-white/20 transition-all active:scale-[0.98]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-purple/5 skew-x-[-20deg] translate-x-12 -translate-y-12 group-hover:translate-x-8 transition-transform duration-700" />
                
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-black border border-white/10 flex items-center justify-center text-sm font-black text-cyber-purple display-font transition-all group-hover:neo-border-purple">
                      {vendor.name?.charAt(0)?.toUpperCase() || 'V'}
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-black text-white truncate display-font uppercase tracking-tight" title={vendor.name}>
                        {vendor.name}
                      </p>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1 truncate max-w-[150px]">
                        {vendor.contact_info || 'NO_CONTACT_LINK'}
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

                <div className="flex items-center justify-between pt-6 mt-auto border-t border-white/5 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded bg-white/[0.03] border border-white/5 text-[9px] font-black text-text-secondary group-hover:text-white transition-colors">
                      {docs} ARCHIVES
                    </div>
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
};

export default Vendors;

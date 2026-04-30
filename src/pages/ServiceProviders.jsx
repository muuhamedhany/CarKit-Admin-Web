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
      case 'approved': return { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.25)', dot: '#4ade80' };
      case 'rejected': return { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)', dot: '#f87171' };
      default: return { bg: 'rgba(234,179,8,0.12)', color: '#facc15', border: 'rgba(234,179,8,0.25)', dot: '#facc15' };
    }
  };

  const docCount = (p) => [p.document_1_url, p.document_2_url, p.document_3_url].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>Service Providers</h1>
          <p className="mt-1 text-sm" style={{ color: '#9E9E9E' }}>
            Review provider applications and documents.
            {!loading && <span style={{ color: '#E91E8C' }}> ({providers.length} total)</span>}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            className="rounded-xl py-2.5 pl-4 pr-10 text-sm outline-none cursor-pointer"
            style={{ background: '#1E1E2C', border: '1px solid #2A2A3A', color: '#FFFFFF' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Providers</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E91E8C' }} />
        </div>
      ) : providers.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <Wrench className="w-12 h-12 mx-auto mb-3" style={{ color: '#6B6B80' }} />
          <p style={{ color: '#6B6B80' }}>No service providers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => {
            const status = provider.verification_status || 'pending';
            const s = getStatusStyle(status);
            const docs = docCount(provider);
            return (
              <div
                key={provider.provider_id}
                className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] group cursor-pointer"
                style={{ background: '#12121F', border: '1px solid #2A2A3A' }}
                onClick={() => navigate(`/service-providers/${provider.provider_id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-11 h-11 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(233,30,140,0.15)', color: '#FF69B4' }}
                    >
                      {provider.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>{provider.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B6B80' }}>{provider.contact_info || 'No contact info'}</p>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #1E1E2C' }}>
                  <span className="text-xs" style={{ color: '#6B6B80' }}>
                    {docs} document{docs !== 1 ? 's' : ''} uploaded
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium transition-colors duration-200"
                    style={{ color: '#E91E8C' }}
                  >
                    Review <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
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

export default ServiceProviders;

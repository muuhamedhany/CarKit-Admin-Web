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
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
            Pending Service Approvals
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#9E9E9E' }}>
            Review and approve new services submitted by providers.
            {!loading && <span style={{ color: '#E91E8C' }}> ({services.length} pending)</span>}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E91E8C' }} />
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <Wrench className="w-12 h-12 mx-auto mb-3" style={{ color: '#6B6B80' }} />
          <p style={{ color: '#6B6B80' }}>No pending services.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.service_id}
              className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] group cursor-pointer flex flex-col h-full"
              style={{ background: '#12121F', border: '1px solid #2A2A3A' }}
              onClick={() => navigate(`/pending-services/${service.service_id}`)}
            >
              <div className="flex items-start justify-between mb-4 flex-1">
                <div className="flex items-center gap-3">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-12 h-12 rounded-xl object-cover"
                      style={{ border: '1px solid #2A2A3A' }}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(233,30,140,0.15)', color: '#E91E8C' }}
                    >
                      {service.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                  )}
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-sm truncate" style={{ color: '#FFFFFF' }} title={service.name}>
                      {service.name}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#6B6B80' }}>
                      By {service.provider_name || 'Unknown Provider'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: '#9E9E9E' }}>Price</span>
                  <span className="font-semibold text-sm" style={{ color: '#E91E8C' }}>
                    {Number(service.price).toLocaleString('en-EG')} EGP
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#9E9E9E' }}>Duration</span>
                  <span className="text-sm" style={{ color: '#FFFFFF' }}>{service.duration ?? 0} min</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 items-center justify-between pt-3" style={{ borderTop: '1px solid #1E1E2C' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleApprove(service.service_id); }}
                  disabled={acting[service.service_id] !== undefined}
                  className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: acting[service.service_id] === 'approving' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)',
                    color: '#4ade80',
                    border: '1px solid rgba(34,197,94,0.3)',
                    opacity: acting[service.service_id] !== undefined ? 0.6 : 1,
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  {acting[service.service_id] === 'approving' ? '...' : 'Approve'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReject(service.service_id); }}
                  disabled={acting[service.service_id] !== undefined}
                  className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: acting[service.service_id] === 'rejecting' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                    color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.3)',
                    opacity: acting[service.service_id] !== undefined ? 0.6 : 1,
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                  {acting[service.service_id] === 'rejecting' ? '...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingServices;

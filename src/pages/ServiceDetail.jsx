import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Loader2, Wrench, Tag, Store, Clock, Hash, MapPin, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setService(response.data.data);
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError('Failed to load service details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading('approving');
      await axios.patch(
        `${API_URL}/api/admin/services/${id}/approve`,
        { approval_status: 'active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/pending-services');
    } catch (error) {
      console.error('Error approving service:', error);
      alert('Failed to approve service.');
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this service?')) return;
    try {
      setActionLoading('rejecting');
      await axios.patch(
        `${API_URL}/api/admin/services/${id}/approve`,
        { approval_status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/pending-services');
    } catch (error) {
      console.error('Error rejecting service:', error);
      alert('Failed to reject service.');
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E91E8C' }} />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p style={{ color: '#EF4444' }}>{error || 'Service not found.'}</p>
        <button
          onClick={() => navigate('/pending-services')}
          className="px-4 py-2 rounded-lg font-medium transition-all"
          style={{ background: '#2A2A3A', color: '#FFFFFF' }}
        >
          Back to list
        </button>
      </div>
    );
  }

  const isPending = String(service.status || '').toLowerCase() === 'pending';
  const isActive = String(service.status || '').toLowerCase() === 'active';

  const serviceImages = [service.image_url, service.image_url_2, service.image_url_3].filter(Boolean);

  const locationLabel = {
    'mobile': '🚗 Mobile (at customer)',
    'in-shop': '🏪 In-Shop',
    'both': '🔄 Mobile & In-Shop',
  }[service.location_type] || service.location_type || '—';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/pending-services')}
        className="flex items-center gap-2 text-sm transition-colors hover:text-white"
        style={{ color: '#9E9E9E' }}
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Pending Services
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
            <Wrench className="w-8 h-8" style={{ color: '#E91E8C' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{service.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium border"
                style={{
                  background: isPending ? 'rgba(59,130,246,0.15)' : isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: isPending ? '#3B82F6' : isActive ? '#4ade80' : '#f87171',
                  borderColor: isPending ? 'rgba(59,130,246,0.3)' : isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
                }}
              >
                {String(service.status || 'unknown').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {serviceImages.length > 0 && (
            <div className="rounded-xl overflow-hidden p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Images</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {serviceImages.map((src, idx) => (
                  <img key={idx} src={src} alt={`${service.name} view ${idx + 1}`} className="w-48 h-48 object-cover rounded-xl" style={{ border: '1px solid #2A2A3A' }} />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="rounded-xl overflow-hidden p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Description</h2>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#9E9E9E' }}>
              {service.description || 'No description provided.'}
            </p>
          </div>

          {/* Available Times */}
          {service.available_times && service.available_times.length > 0 && (
            <div className="rounded-xl overflow-hidden p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Available Times</h2>
              <div className="flex flex-wrap gap-2">
                {service.available_times.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(233,30,140,0.15)', color: '#E91E8C', border: '1px solid rgba(233,30,140,0.3)' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Info Card */}
          <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
            <h2 className="text-lg font-semibold mb-6" style={{ color: '#FFFFFF' }}>Service Details</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Tag className="w-5 h-5" style={{ color: '#E91E8C' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Price</p>
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>{Number(service.price).toLocaleString('en-EG')} EGP</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Clock className="w-5 h-5" style={{ color: '#6366F1' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Duration</p>
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>{service.duration ?? 0} minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Store className="w-5 h-5" style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Provider</p>
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>{service.provider_name || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <MapPin className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Location Type</p>
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>{locationLabel}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Hash className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Category</p>
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>{service.category_name || 'Uncategorized'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Hash className="w-5 h-5" style={{ color: '#EC4899' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Service ID</p>
                  <p className="font-mono text-sm mt-1" style={{ color: '#9E9E9E' }}>{service.service_id}</p>
                </div>
              </div>

              {service.created_at && (
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Clock className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Created</p>
                    <p className="text-sm mt-1" style={{ color: '#9E9E9E' }}>
                      {new Date(service.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Card — only shown when pending */}
          {isPending && (
            <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Review Decision</h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all"
                  style={{
                    background: actionLoading === 'approving' ? '#22C55E30' : '#22C55E',
                    color: '#FFFFFF',
                    opacity: actionLoading !== null ? 0.6 : 1,
                  }}
                >
                  <Check className="w-5 h-5" />
                  {actionLoading === 'approving' ? 'Approving...' : 'Approve Service'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all"
                  style={{
                    background: actionLoading === 'rejecting' ? '#EF444430' : 'transparent',
                    color: actionLoading === 'rejecting' ? '#EF4444' : '#f87171',
                    border: '1px solid #EF4444',
                    opacity: actionLoading !== null ? 0.6 : 1,
                  }}
                >
                  <X className="w-5 h-5" />
                  {actionLoading === 'rejecting' ? 'Rejecting...' : 'Reject Service'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;

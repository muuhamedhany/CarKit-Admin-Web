import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Megaphone, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const PendingAds = () => {
  const { token } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});

  const fetchPendingAds = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/ads/all`, {
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
        `${API_URL}/api/ads/${adId}/status`,
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
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
            Pending Ad Approvals
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#9E9E9E' }}>
            Review and approve promotional ads submitted by vendors and providers.
            {!loading && <span style={{ color: '#E91E8C' }}> ({ads.length} pending)</span>}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E91E8C' }} />
        </div>
      ) : ads.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <Megaphone className="w-12 h-12 mx-auto mb-3" style={{ color: '#6B6B80' }} />
          <p style={{ color: '#6B6B80' }}>No pending ads.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <div
              key={ad.ad_id}
              className="rounded-xl p-5 flex flex-col h-full"
              style={{ background: '#12121F', border: '1px solid #2A2A3A' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {ad.banner_image_url ? (
                    <img
                      src={ad.banner_image_url}
                      alt={ad.title || 'Ad Banner'}
                      className="w-16 h-12 rounded object-cover"
                      style={{ border: '1px solid #2A2A3A' }}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center w-16 h-12 rounded text-sm font-bold"
                      style={{ background: 'rgba(156,39,176,0.15)', color: '#B388FF' }}
                    >
                      AD
                    </div>
                  )}
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-sm truncate" style={{ color: '#FFFFFF' }} title={ad.title || 'Untitled Ad'}>
                      {ad.title || 'Untitled Ad'}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#6B6B80' }}>
                      By User ID: {ad.user_id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: '#9E9E9E' }}>Duration</span>
                  <span className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>
                    {ad.duration_days} Days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#9E9E9E' }}>Submitted On</span>
                  <span className="text-sm" style={{ color: '#9E9E9E' }}>
                    {new Date(ad.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 items-center justify-between pt-3" style={{ borderTop: '1px solid #1E1E2C' }}>
                <button
                  onClick={() => handleUpdateStatus(ad.ad_id, 'active')}
                  disabled={approving[ad.ad_id] !== undefined}
                  className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: approving[ad.ad_id] === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)',
                    color: '#4ade80',
                    border: '1px solid rgba(34,197,94,0.3)',
                    opacity: approving[ad.ad_id] !== undefined ? 0.6 : 1,
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  {approving[ad.ad_id] === 'active' ? '...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleUpdateStatus(ad.ad_id, 'rejected')}
                  disabled={approving[ad.ad_id] !== undefined}
                  className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                     background: approving[ad.ad_id] === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                     color: '#f87171',
                     border: '1px solid rgba(239,68,68,0.3)',
                    opacity: approving[ad.ad_id] !== undefined ? 0.6 : 1,
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                  {approving[ad.ad_id] === 'rejected' ? '...' : 'Reject'}
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

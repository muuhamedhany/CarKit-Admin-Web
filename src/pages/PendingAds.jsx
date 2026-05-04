import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Megaphone, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const PendingAds = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});

  const fetchPendingAds = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/ads/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAds(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending ads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAds();
  }, []);

  const handleApprove = async (adId) => {
    try {
      setApproving((prev) => ({ ...prev, [adId]: 'approving' }));
      await axios.patch(
        `${API_URL}/api/admin/ads/${adId}/status`,
        { status: 'active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAds((prev) => prev.filter((a) => a.ad_id !== adId));
      setApproving((prev) => {
        const newState = { ...prev };
        delete newState[adId];
        return newState;
      });
    } catch (error) {
      console.error('Error approving ad:', error);
      setApproving((prev) => ({ ...prev, [adId]: 'error' }));
    }
  };

  const handleReject = async (adId) => {
    try {
      setApproving((prev) => ({ ...prev, [adId]: 'rejecting' }));
      await axios.patch(
        `${API_URL}/api/admin/ads/${adId}/status`,
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAds((prev) => prev.filter((a) => a.ad_id !== adId));
      setApproving((prev) => {
        const newState = { ...prev };
        delete newState[adId];
        return newState;
      });
    } catch (error) {
      console.error('Error rejecting ad:', error);
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
            Review and approve promotional banners.
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
              className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] group cursor-pointer flex flex-col h-full"
              style={{ background: '#12121F', border: '1px solid #2A2A3A' }}
              onClick={() => navigate(`/pending-ads/${ad.ad_id}`)}
            >
              <div className="flex flex-col mb-4 flex-1">
                <img
                  src={ad.banner_image_url}
                  alt={ad.title || 'Ad Banner'}
                  className="w-full aspect-video rounded-lg object-cover mb-3"
                  style={{ border: '1px solid #2A2A3A' }}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#FFFFFF' }} title={ad.title || 'Untitled Ad'}>
                    {ad.title || 'Untitled Ad'}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#6B6B80' }}>
                    By {ad.vendor_name || ad.provider_name || 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: '#9E9E9E' }}>Duration</span>
                  <span className="font-semibold text-sm" style={{ color: '#E91E8C' }}>
                    {ad.duration_days} Days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#9E9E9E' }}>Keyword</span>
                  <span className="text-sm truncate" style={{ color: '#FFFFFF', maxWidth: '120px' }} title={ad.search_keyword}>
                    {ad.search_keyword}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 items-center justify-between pt-3" style={{ borderTop: '1px solid #1E1E2C' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(ad.ad_id);
                  }}
                  disabled={approving[ad.ad_id] !== undefined}
                  className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: approving[ad.ad_id] === 'approving' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)',
                    color: '#4ade80',
                    border: '1px solid rgba(34,197,94,0.3)',
                    opacity: approving[ad.ad_id] !== undefined ? 0.6 : 1,
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  {approving[ad.ad_id] === 'approving' ? '...' : 'Approve'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(ad.ad_id);
                  }}
                  disabled={approving[ad.ad_id] !== undefined}
                  className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                     background: approving[ad.ad_id] === 'rejecting' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                     color: '#f87171',
                     border: '1px solid rgba(239,68,68,0.3)',
                    opacity: approving[ad.ad_id] !== undefined ? 0.6 : 1,
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                  {approving[ad.ad_id] === 'rejecting' ? '...' : 'Reject'}
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Loader2, Megaphone, Tag, Clock, Hash, Check, X, Target, Package, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const AdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // For resolved names
  const [targetProducts, setTargetProducts] = useState([]);
  const [targetServices, setTargetServices] = useState([]);
  const [targetCategories, setTargetCategories] = useState([]);

  useEffect(() => {
    fetchAdDetails();
  }, [id]);

  const fetchAdDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/promotions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const adData = response.data.data;
      setAd(adData);

      // Fetch resolved names for targets if they exist
      if (adData.target_product_ids?.length > 0) {
        fetchProductNames(adData.target_product_ids);
      }
      if (adData.target_service_ids?.length > 0) {
        fetchServiceNames(adData.target_service_ids);
      }
      if (adData.target_category_ids?.length > 0) {
        fetchCategoryNames(adData.target_category_ids, adData.vendor_id ? 'product' : 'service');
      }

    } catch (err) {
      console.error('Error fetching ad details:', err);
      setError('Failed to load ad details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductNames = async (ids) => {
    try {
      const response = await axios.get(`${API_URL}/api/products?product_ids=${ids.join(',')}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTargetProducts(response.data.data || []);
    } catch (err) {
      console.error('Error fetching target products:', err);
    }
  };

  const fetchServiceNames = async (ids) => {
    try {
      const response = await axios.get(`${API_URL}/api/services?service_ids=${ids.join(',')}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTargetServices(response.data.data || []);
    } catch (err) {
      console.error('Error fetching target services:', err);
    }
  };

  const fetchCategoryNames = async (ids, type) => {
    try {
      const endpoint = type === 'product' ? 'categories' : 'services/categories';
      const response = await axios.get(`${API_URL}/api/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allCats = response.data.data || [];
      const filtered = allCats.filter(cat => 
        ids.includes(cat.category_id || cat.service_category_id)
      );
      setTargetCategories(filtered);
    } catch (err) {
      console.error('Error fetching target categories:', err);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setActionLoading(newStatus === 'active' ? 'approving' : 'rejecting');
      await axios.patch(
        `${API_URL}/api/promotions/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/pending-ads');
    } catch (error) {
      console.error(`Error updating ad status to ${newStatus}:`, error);
      alert(`Failed to ${newStatus === 'active' ? 'approve' : 'reject'} ad.`);
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

  if (error || !ad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p style={{ color: '#EF4444' }}>{error || 'Ad not found.'}</p>
        <button
          onClick={() => navigate('/pending-ads')}
          className="px-4 py-2 rounded-lg font-medium transition-all"
          style={{ background: '#2A2A3A', color: '#FFFFFF' }}
        >
          Back to list
        </button>
      </div>
    );
  }

  const isPending = String(ad.status || '').toLowerCase() === 'pending';
  const isActive = String(ad.status || '').toLowerCase() === 'active';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/pending-ads')}
        className="flex items-center gap-2 text-sm transition-colors hover:text-white"
        style={{ color: '#9E9E9E' }}
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Pending Ads
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
            <Megaphone className="w-8 h-8" style={{ color: '#E91E8C' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{ad.title || 'Untitled Ad'}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span 
                className="px-2.5 py-1 rounded-full text-xs font-medium border"
                style={{
                  background: isPending ? 'rgba(59,130,246,0.15)' : isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: isPending ? '#3B82F6' : isActive ? '#4ade80' : '#f87171',
                  borderColor: isPending ? 'rgba(59,130,246,0.3)' : isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'
                }}
              >
                {String(ad.status || 'unknown').toUpperCase()}
              </span>
              <span className="text-xs" style={{ color: '#6B6B80' }}>
                ID: {ad.ad_id}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Image */}
          <div className="rounded-xl overflow-hidden p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Ad Banner</h2>
            {ad.banner_image_url ? (
              <img 
                src={ad.banner_image_url} 
                alt="Ad Banner" 
                className="w-full aspect-[16/9] object-cover rounded-xl" 
                style={{ border: '1px solid #2A2A3A' }} 
              />
            ) : (
              <div className="w-full aspect-[16/9] rounded-xl flex items-center justify-center" style={{ background: '#0A0A14', border: '1px dashed #2A2A3A' }}>
                <p style={{ color: '#6B6B80' }}>No banner image uploaded</p>
              </div>
            )}
          </div>

          {/* Targeting Info */}
          <div className="rounded-xl overflow-hidden p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5" style={{ color: '#6366F1' }} />
              <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>Targeting Settings</h2>
            </div>
            
            <div className="space-y-6">
              {/* Target Products */}
              {ad.vendor_id && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4" style={{ color: '#9E9E9E' }} />
                    <h3 className="text-sm font-medium" style={{ color: '#9E9E9E' }}>Specific Products</h3>
                  </div>
                  {targetProducts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {targetProducts.map(p => (
                        <span key={p.product_id} className="px-3 py-1 rounded-lg text-xs" style={{ background: '#1E1E2C', color: '#FFFFFF', border: '1px solid #2A2A3A' }}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  ) : ad.target_product_ids?.length > 0 ? (
                    <p className="text-xs italic" style={{ color: '#6B6B80' }}>Loading product names...</p>
                  ) : (
                    <p className="text-xs italic" style={{ color: '#6B6B80' }}>All vendor products (no specific products selected)</p>
                  )}
                </div>
              )}

              {/* Target Services */}
              {ad.provider_id && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4" style={{ color: '#9E9E9E' }} />
                    <h3 className="text-sm font-medium" style={{ color: '#9E9E9E' }}>Specific Services</h3>
                  </div>
                  {targetServices.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {targetServices.map(s => (
                        <span key={s.service_id} className="px-3 py-1 rounded-lg text-xs" style={{ background: '#1E1E2C', color: '#FFFFFF', border: '1px solid #2A2A3A' }}>
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ) : ad.target_service_ids?.length > 0 ? (
                    <p className="text-xs italic" style={{ color: '#6B6B80' }}>Loading service names...</p>
                  ) : (
                    <p className="text-xs italic" style={{ color: '#6B6B80' }}>All provider services (no specific services selected)</p>
                  )}
                </div>
              )}

              {/* Target Categories */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4" style={{ color: '#9E9E9E' }} />
                  <h3 className="text-sm font-medium" style={{ color: '#9E9E9E' }}>Categories</h3>
                </div>
                {targetCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {targetCategories.map(c => (
                      <span key={c.category_id || c.service_category_id} className="px-3 py-1 rounded-lg text-xs" style={{ background: '#1E1E2C', color: '#FFFFFF', border: '1px solid #2A2A3A' }}>
                        {c.name}
                      </span>
                    ))}
                  </div>
                ) : ad.target_category_ids?.length > 0 ? (
                  <p className="text-xs italic" style={{ color: '#6B6B80' }}>Loading category names...</p>
                ) : (
                  <p className="text-xs italic" style={{ color: '#6B6B80' }}>No specific categories selected</p>
                )}
              </div>

              {ad.search_keyword && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4" style={{ color: '#9E9E9E' }} />
                    <h3 className="text-sm font-medium" style={{ color: '#9E9E9E' }}>Search Keyword</h3>
                  </div>
                  <p className="text-sm" style={{ color: '#FFFFFF' }}>{ad.search_keyword}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Ad Metadata Card */}
          <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
            <h2 className="text-lg font-semibold mb-6" style={{ color: '#FFFFFF' }}>Ad Details</h2>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Tag className="w-5 h-5" style={{ color: '#E91E8C' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Price Paid</p>
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>{Number(ad.price).toLocaleString('en-EG')} EGP</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Clock className="w-5 h-5" style={{ color: '#6366F1' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Duration</p>
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>{ad.duration_days} Days</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Hash className="w-5 h-5" style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Advertiser</p>
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>{ad.advertiser_name || 'Unknown'}</p>
                  <p className="text-xs mt-1 capitalize" style={{ color: '#9E9E9E' }}>Type: {ad.advertiser_type}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Clock className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Submitted On</p>
                  <p className="text-sm mt-1" style={{ color: '#9E9E9E' }}>
                    {new Date(ad.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {ad.start_date && (
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Clock className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Active Period</p>
                    <p className="text-sm mt-1" style={{ color: '#9E9E9E' }}>
                      {new Date(ad.start_date).toLocaleDateString()} - {new Date(ad.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Card */}
          {isPending && (
            <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
               <h2 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Review Decision</h2>
               <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleUpdateStatus('active')}
                    disabled={actionLoading !== null}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all"
                    style={{
                      background: actionLoading === 'approving' ? '#22C55E30' : '#22C55E',
                      color: '#FFFFFF',
                      opacity: actionLoading !== null ? 0.6 : 1,
                    }}
                  >
                    <Check className="w-5 h-5" />
                    {actionLoading === 'approving' ? 'Approving...' : 'Approve Ad'}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('rejected')}
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
                    {actionLoading === 'rejecting' ? 'Rejecting...' : 'Reject Ad'}
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdDetail;

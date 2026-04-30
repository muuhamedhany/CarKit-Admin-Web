import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Loader2, Package, Tag, Store, Clock, Hash, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/products/${id}/manage`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProduct(response.data.data);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading('approving');
      await axios.patch(
        `${API_URL}/api/admin/products/${id}/approve`,
        { approval_status: 'active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/pending-products');
    } catch (error) {
      console.error('Error approving product:', error);
      alert('Failed to approve product.');
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this product?')) {
      return;
    }
    
    try {
      setActionLoading('rejecting');
      await axios.patch(
        `${API_URL}/api/admin/products/${id}/approve`,
        { approval_status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/pending-products');
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert('Failed to reject product.');
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

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p style={{ color: '#EF4444' }}>{error || 'Product not found.'}</p>
        <button
          onClick={() => navigate('/pending-products')}
          className="px-4 py-2 rounded-lg font-medium transition-all"
          style={{ background: '#2A2A3A', color: '#FFFFFF' }}
        >
          Back to list
        </button>
      </div>
    );
  }

  const isPending = String(product.status || '').toLowerCase() === 'pending';
  const isActive = String(product.status || '').toLowerCase() === 'active';

  const productImages = [product.image_url, product.image_url_2, product.image_url_3].filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/pending-products')}
        className="flex items-center gap-2 text-sm transition-colors hover:text-white"
        style={{ color: '#9E9E9E' }}
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Pending Products
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
            <Package className="w-8 h-8" style={{ color: '#E91E8C' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span 
                className="px-2.5 py-1 rounded-full text-xs font-medium border"
                style={{
                  background: isPending ? 'rgba(59,130,246,0.15)' : isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: isPending ? '#3B82F6' : isActive ? '#4ade80' : '#f87171',
                  borderColor: isPending ? 'rgba(59,130,246,0.3)' : isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'
                }}
              >
                {String(product.status || 'unknown').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {productImages.length > 0 && (
            <div className="rounded-xl overflow-hidden p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
               <h2 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Images</h2>
               <div className="flex gap-4 overflow-x-auto pb-2">
                 {productImages.map((src, idx) => (
                   <img key={idx} src={src} alt={`${product.name} view ${idx + 1}`} className="w-48 h-48 object-cover rounded-xl" style={{ border: '1px solid #2A2A3A' }} />
                 ))}
               </div>
            </div>
          )}

          {/* Description */}
          <div className="rounded-xl overflow-hidden p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
             <h2 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Description</h2>
             <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#9E9E9E' }}>
                {product.description || 'No description provided.'}
             </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Info Card */}
          <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
            <h2 className="text-lg font-semibold mb-6" style={{ color: '#FFFFFF' }}>Product Details</h2>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Tag className="w-5 h-5" style={{ color: '#E91E8C' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Price</p>
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>{Number(product.price).toLocaleString('en-EG')} EGP</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Package className="w-5 h-5" style={{ color: '#6366F1' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Stock</p>
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>{product.stock ?? 0} units</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Store className="w-5 h-5" style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Vendor</p>
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>{product.vendor_name || 'Unknown'}</p>
                </div>
              </div>

               <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Hash className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Category</p>
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>{product.category_name || 'Uncategorized'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Hash className="w-5 h-5" style={{ color: '#EC4899' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Product ID</p>
                  <p className="font-mono text-sm mt-1" style={{ color: '#9E9E9E' }}>{product.product_id}</p>
                </div>
              </div>

              {product.created_at && (
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Clock className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#6B6B80' }}>Created</p>
                    <p className="text-sm mt-1" style={{ color: '#9E9E9E' }}>
                      {new Date(product.created_at).toLocaleDateString()}
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
                    {actionLoading === 'approving' ? 'Approving...' : 'Approve Product'}
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
                    {actionLoading === 'rejecting' ? 'Rejecting...' : 'Reject Product'}
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

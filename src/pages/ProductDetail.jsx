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
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyber-pink/20 border-t-cyber-pink animate-spin" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-pink animate-pulse">Scanning Manifest</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-32">
        <X className="w-16 h-16 text-white/5 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2 display-font uppercase">System Error</h2>
        <p className="text-text-secondary mb-8">{error || 'Target product payload not detected.'}</p>
        <button onClick={() => navigate('/pending-products')} className="cyber-button px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest">
          Return to Registry
        </button>
      </div>
    );
  }

  const isPending = String(product.status || '').toLowerCase() === 'pending';
  const isActive = String(product.status || '').toLowerCase() === 'active';
  const productImages = [product.image_url, product.image_url_2, product.image_url_3].filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
      {/* Navigation & Header */}
      <div className="space-y-6">
        <button
          onClick={() => navigate('/pending-products')}
          className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-white transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Registry
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-black border border-white/5 flex items-center justify-center neo-border-pink group">
              <Package className="w-8 h-8 text-cyber-pink group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter display-font leading-none mb-2 uppercase">{product.name}</h1>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  isPending ? 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20' : 
                  isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  'bg-cyber-pink/10 text-cyber-pink border-cyber-pink/20'
                }`}>
                  <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                  {product.status || 'unknown'}
                </span>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">TYPE_ID: {product.product_id}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel px-8 py-5 text-right relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-full bg-cyber-pink/10 skew-x-[-20deg] translate-x-16 group-hover:translate-x-12 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="text-[10px] font-black tracking-widest uppercase text-text-secondary mb-1">MSRP Value</div>
              <div className="text-3xl font-black text-cyber-pink display-font">{Number(product.price).toLocaleString('en-EG')} <span className="text-xs">EGP</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Visual Data */}
          {productImages.length > 0 && (
            <div className="glass-panel p-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-30" />
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white display-font mb-6 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-cyber-blue rounded-full" /> Visual Arrays
               </h2>
               <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                 {productImages.map((src, idx) => (
                   <div key={idx} className="relative group shrink-0">
                     <div className="absolute inset-0 bg-cyber-blue/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                     <img src={src} alt={`${product.name} view ${idx + 1}`} className="w-64 h-64 object-cover rounded-xl border border-white/5 group-hover:border-cyber-blue/50 transition-all" />
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* Technical Specs */}
          <div className="glass-panel p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-cyber-purple opacity-30" />
             <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white display-font mb-6 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-cyber-purple rounded-full" /> Technical Narrative
             </h2>
             <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
               <p className="text-sm font-medium leading-relaxed text-text-secondary whitespace-pre-wrap">
                  {product.description || 'No descriptive payload detected for this unit.'}
               </p>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Metadata Grid */}
          <div className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyber-pink opacity-30" />
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white display-font mb-8">Unit Metrics</h2>
            
            <div className="space-y-6">
              <MetadataRow label="Stock Capacity" value={`${product.stock ?? 0} Units`} icon={Package} accent="var(--accent-blue)" />
              <MetadataRow label="Authorized Vendor" value={product.vendor_name || 'Anonymous'} icon={Store} accent="var(--accent-purple)" />
              <MetadataRow label="Registry Category" value={product.category_name || 'General'} icon={Tag} accent="var(--accent-pink)" />
              {product.created_at && (
                <MetadataRow label="Initial Uplink" value={new Date(product.created_at).toLocaleDateString()} icon={Clock} accent="var(--accent-blue)" />
              )}
            </div>
          </div>

          {/* Action Hub */}
          {isPending && (
            <div className="glass-panel p-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-pink to-transparent opacity-30" />
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white display-font mb-8">Executive Decision</h2>
               <div className="space-y-4">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading !== null}
                    className="cyber-button w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500 transition-all group"
                  >
                    <Check className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    {actionLoading === 'approving' ? 'Processing...' : 'Authorize Unit'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading !== null}
                    className="cyber-button w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-cyber-pink/5 border-cyber-pink/20 text-cyber-pink hover:bg-cyber-pink/10 hover:border-cyber-pink transition-all group"
                  >
                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    {actionLoading === 'rejecting' ? 'Rejecting...' : 'Decommission'}
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetadataRow = ({ label, value, icon: Icon, accent }) => (
  <div className="group/row">
    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-text-secondary group-hover/row:text-white transition-colors">{label}</p>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center transition-all group-hover/row:border-current" style={{ color: accent }}>
        <Icon className="w-5 h-5 opacity-40 group-hover/row:opacity-100 transition-opacity" />
      </div>
      <p className="text-sm font-bold text-white/80 group-hover/row:text-white transition-colors">{value}</p>
    </div>
  </div>
);

export default ProductDetail;

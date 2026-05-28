import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Package, Tag, Store, Clock, Check, X, Car } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('gallery');

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
  const compatibleMakes = Array.isArray(product.compatible_makes) ? product.compatible_makes.filter(Boolean) : [];
  const compatibleModels = Array.isArray(product.compatible_models) ? product.compatible_models.filter(Boolean) : [];
  const isUniversalFitment = compatibleMakes.length === 0 && compatibleModels.length === 0;

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Navigation & Header */}
      <div className="space-y-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column with Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Selector */}
          <div className="flex border-b border-white/5 overflow-x-auto custom-scrollbar gap-2">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'gallery'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Visual Arrays
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'specs'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('fitment')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'fitment'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Fitment Specs
            </button>
            <button
              onClick={() => setActiveTab('receipt')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'receipt'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Clearance Payload
            </button>
          </div>

          {/* Tab Content: Visual Gallery */}
          {activeTab === 'gallery' && (
            <div className="glass-panel p-8 relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-30" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white display-font mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyber-blue rounded-full" /> Visual Arrays
              </h2>
              {productImages.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {productImages.map((src, idx) => (
                    <div key={idx} className="relative group shrink-0">
                      <div className="absolute inset-0 bg-cyber-blue/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      <img src={src} alt={`${product.name} view ${idx + 1}`} className="w-64 h-64 object-cover rounded-xl border border-white/5 group-hover:border-cyber-blue/50 transition-all duration-300" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-64 rounded-xl flex flex-col items-center justify-center bg-black/40 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">No Visual Payloads Uploaded</p>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Specs / Narrative */}
          {activeTab === 'specs' && (
            <div className="glass-panel p-8 relative overflow-hidden animate-fade-in">
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
          )}

          {/* Tab Content: Fitment */}
          {activeTab === 'fitment' && (
            <div className="glass-panel p-8 relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-30" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white display-font mb-6 flex items-center gap-2">
                <Car className="w-4 h-4 text-cyber-blue" /> Fitment & Compatibility
              </h2>
              {isUniversalFitment ? (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                  Universal Fitment
                </span>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {compatibleMakes.length > 0 && (
                    <FitmentBadgeGroup label="Makes" values={compatibleMakes} colorClass="text-cyber-pink border-cyber-pink/25 bg-cyber-pink/10" />
                  )}
                  {compatibleModels.length > 0 && (
                    <FitmentBadgeGroup label="Models" values={compatibleModels} colorClass="text-cyber-blue border-cyber-blue/25 bg-cyber-blue/10" />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Receipt */}
          {activeTab === 'receipt' && (
            <div className="glass-panel p-8 relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-pink opacity-30" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white display-font mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyber-pink rounded-full" /> Purchase Clearance Receipt
              </h2>
              {product.receipt_url ? (
                <div className="space-y-4 max-w-md">
                  <div className="relative group overflow-hidden rounded-xl border border-white/5 bg-black/40 p-2">
                    <img 
                      src={product.receipt_url} 
                      alt="Product Receipt" 
                      className="w-full h-64 object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <a 
                    href={product.receipt_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="cyber-button w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-cyber-pink transition-all"
                  >
                    View Full Receipt
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-white/5 bg-black/40 p-6 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">No Receipt Payload Uploaded</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
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
          
        </div>
      </div>
      </div>

      {/* Floating Executive Decision */}
      {isPending && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
          <div className="animate-fade-in">
            <div className="glass-panel p-4 bg-black/80 border-cyber-pink/30 flex items-center justify-between gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] neo-border-pink">
              <div className="hidden sm:block text-left pl-2">
                <p className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em]">Product Clearance</p>
                <p className="text-xs font-black text-white uppercase tracking-widest">Pending Review</p>
              </div>
              <div className="flex flex-1 sm:flex-initial gap-3">
                <button
                  onClick={handleReject}
                  disabled={actionLoading !== null}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/20 hover:bg-cyber-pink/20 hover:border-cyber-pink/40 disabled:opacity-50 group cursor-pointer"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  {actionLoading === 'rejecting' ? 'Rejecting...' : 'Decommission'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading !== null}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:border-green-500/50 disabled:opacity-50 group cursor-pointer"
                >
                  <Check className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  {actionLoading === 'approving' ? 'Processing...' : 'Authorize'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MetadataRow = ({ label, value, icon: Icon, accent }) => (
  <div className="group/row flex items-center gap-4">
    <div className="w-9 h-9 shrink-0 rounded-2xl bg-black border border-white/5 flex items-center justify-center transition-all group-hover/row:border-current" style={{ color: accent }}>
      <Icon className="w-4.5 h-4.5 opacity-40 group-hover/row:opacity-100 transition-opacity" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 text-text-secondary group-hover/row:text-white transition-colors truncate">{label}</p>
      <p className="text-sm font-bold text-white/80 group-hover/row:text-white transition-colors truncate">{value}</p>
    </div>
  </div>
);

const FitmentBadgeGroup = ({ label, values, colorClass }) => (
  <div>
    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 text-text-secondary">{label}</p>
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          key={value}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold border ${colorClass}`}
        >
          {value}
        </span>
      ))}
    </div>
  </div>
);

export default ProductDetail;

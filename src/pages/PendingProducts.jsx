import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Package, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const PendingProducts = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedProducts = React.useMemo(() => {
    const filtered = products.filter((p) => {
      if (!search.trim()) return true;
      const haystack = [p.name, p.vendor_name].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(search.toLowerCase());
    });

    return [...filtered].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

      if (sortBy === 'newest') {
        if (dateA !== dateB) return dateB - dateA;
        return b.product_id - a.product_id;
      } else {
        if (dateA !== dateB) return dateA - dateB;
        return a.product_id - b.product_id;
      }
    });
  }, [products, search, sortBy]);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/products/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const handleApprove = async (productId) => {
    try {
      setApproving((prev) => ({ ...prev, [productId]: 'approving' }));
      await axios.patch(
        `${API_URL}/api/admin/products/${productId}/approve`,
        { approval_status: 'active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts((prev) => prev.filter((p) => p.product_id !== productId));
      setApproving((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    } catch (error) {
      console.error('Error approving product:', error);
      setApproving((prev) => ({ ...prev, [productId]: 'error' }));
    }
  };

  const handleReject = async (productId) => {
    try {
      setApproving((prev) => ({ ...prev, [productId]: 'rejecting' }));
      await axios.patch(
        `${API_URL}/api/admin/products/${productId}/approve`,
        { approval_status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts((prev) => prev.filter((p) => p.product_id !== productId));
      setApproving((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    } catch (error) {
      console.error('Error rejecting product:', error);
      setApproving((prev) => ({ ...prev, [productId]: 'error' }));
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter display-font uppercase">
            Pending Clearances
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mt-2">
            Verification required for incoming vendor payloads.
            {!loading && <span className="text-cyber-pink ml-2">[{filteredAndSortedProducts.length} units queued]</span>}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group min-w-[200px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-pink to-cyber-purple opacity-10 group-focus-within:opacity-30 transition-opacity blur rounded-xl" />
            <input
              type="text"
              placeholder="SEARCH PAYLOADS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="relative w-full rounded-xl py-3 pl-4 pr-4 text-[10px] font-black tracking-widest uppercase outline-none bg-black border border-white/10 text-white focus:neo-border-pink transition-all placeholder:text-white/20"
            />
          </div>
          <div className="relative group min-w-[180px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-pink to-cyber-purple opacity-20 group-hover:opacity-40 transition-opacity blur rounded-xl" />
            <select
              className="relative w-full rounded-xl py-3 pl-4 pr-10 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer bg-black border border-white/10 text-white appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">SORT: NEWEST FIRST</option>
              <option value="oldest">SORT: OLDEST FIRST</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary group-hover:text-cyber-pink transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-cyber-pink/20 border-t-cyber-pink animate-spin" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-pink animate-pulse">Syncing Registry</span>
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="glass-panel p-20 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Package className="w-16 h-16 mx-auto mb-6 text-white/5 group-hover:text-cyber-blue/20 transition-colors" />
          <p className="text-sm font-black uppercase tracking-widest text-text-secondary">All manifests cleared</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedProducts.map((product) => (
            <div
              key={product.product_id}
              onClick={() => navigate(`/pending-products/${product.product_id}`)}
              className="glass-panel p-6 group cursor-pointer relative overflow-hidden flex flex-col h-full border-white/5 hover:border-white/20 transition-all active:scale-[0.98]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-pink/5 skew-x-[-20deg] translate-x-12 -translate-y-12 group-hover:translate-x-8 transition-transform duration-700" />
              
              <div className="flex items-start gap-4 mb-6 relative z-10">
                {product.image_url ? (
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-cyber-pink/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 relative z-10"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-black border border-white/10 flex items-center justify-center text-sm font-black text-cyber-pink display-font relative z-10">
                    {product.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-black text-white truncate display-font uppercase tracking-tight" title={product.name}>
                    {product.name}
                  </p>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
                    SRC: {product.vendor_name || 'ANONYMOUS'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1 relative z-10">
                <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Value</span>
                  <span className="text-xs font-black text-cyber-pink display-font">
                    {Number(product.price).toLocaleString('en-EG')} EGP
                  </span>
                </div>
                <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Units</span>
                  <span className="text-xs font-black text-white display-font">{product.stock ?? 0}</span>
                </div>
              </div>

              <div className="flex gap-3 relative z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(product.product_id);
                  }}
                  disabled={approving[product.product_id] !== undefined}
                  className="cyber-button flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500 transition-all group/btn"
                >
                  <Check className="w-3 h-3 group-hover/btn:scale-125 transition-transform" />
                  {approving[product.product_id] === 'approving' ? '...' : 'Clear'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(product.product_id);
                  }}
                  disabled={approving[product.product_id] !== undefined}
                  className="cyber-button flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-cyber-pink/5 border-cyber-pink/20 text-cyber-pink hover:bg-cyber-pink/10 hover:border-cyber-pink transition-all group/btn"
                >
                  <X className="w-3 h-3 group-hover/btn:rotate-90 transition-transform" />
                  {approving[product.product_id] === 'rejecting' ? '...' : 'Eject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingProducts;

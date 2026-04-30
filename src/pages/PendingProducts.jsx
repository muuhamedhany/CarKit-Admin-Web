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
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
            Pending Product Approvals
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#9E9E9E' }}>
            Review and approve new products submitted by vendors.
            {!loading && <span style={{ color: '#E91E8C' }}> ({products.length} pending)</span>}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E91E8C' }} />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#6B6B80' }} />
          <p style={{ color: '#6B6B80' }}>No pending products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] group cursor-pointer flex flex-col h-full"
              style={{ background: '#12121F', border: '1px solid #2A2A3A' }}
              onClick={() => navigate(`/pending-products/${product.product_id}`)}
            >
              <div className="flex items-start justify-between mb-4 flex-1">
                <div className="flex items-center gap-3">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover"
                      style={{ border: '1px solid #2A2A3A' }}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(156,39,176,0.15)', color: '#B388FF' }}
                    >
                      {product.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                  )}
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-sm truncate" style={{ color: '#FFFFFF' }} title={product.name}>
                      {product.name}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#6B6B80' }}>
                      By {product.vendor_name || 'Unknown Vendor'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: '#9E9E9E' }}>Price</span>
                  <span className="font-semibold text-sm" style={{ color: '#E91E8C' }}>
                    {Number(product.price).toLocaleString('en-EG')} EGP
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#9E9E9E' }}>Stock</span>
                  <span className="text-sm" style={{ color: '#FFFFFF' }}>{product.stock ?? 0}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 items-center justify-between pt-3" style={{ borderTop: '1px solid #1E1E2C' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(product.product_id);
                  }}
                  disabled={approving[product.product_id] !== undefined}
                  className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: approving[product.product_id] === 'approving' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)',
                    color: '#4ade80',
                    border: '1px solid rgba(34,197,94,0.3)',
                    opacity: approving[product.product_id] !== undefined ? 0.6 : 1,
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  {approving[product.product_id] === 'approving' ? '...' : 'Approve'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(product.product_id);
                  }}
                  disabled={approving[product.product_id] !== undefined}
                  className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                     background: approving[product.product_id] === 'rejecting' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                     color: '#f87171',
                     border: '1px solid rgba(239,68,68,0.3)',
                    opacity: approving[product.product_id] !== undefined ? 0.6 : 1,
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                  {approving[product.product_id] === 'rejecting' ? '...' : 'Reject'}
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

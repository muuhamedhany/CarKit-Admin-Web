import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, CircleDashed, Clock3, Loader2, Package, Search, ShoppingBag } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const STATUS_OPTIONS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const Orders = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/orders/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setOrders(res.data.data || []);
        }
      } catch (err) {
        console.error('Orders fetch error:', err);
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const filteredOrders = orders.filter((order) => {
    const haystack = [
      order.order_id,
      order.user_name,
      order.user_email,
      order.status,
      order.total_amount,
      order.shipping_title,
      order.shipping_street,
      order.shipping_city,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return (
      haystack.includes(search.toLowerCase()) &&
      (statusFilter === 'all' || String(order.status || '').toLowerCase() === statusFilter)
    );
  });

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered':
        return { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.25)' };
      case 'processing':
      case 'shipped':
        return { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' };
      case 'cancelled':
        return { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)' };
      default:
        return { bg: 'rgba(234,179,8,0.12)', color: '#facc15', border: 'rgba(234,179,8,0.25)' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>Orders</h1>
          <p className="mt-1 text-sm" style={{ color: '#9E9E9E' }}>
            Review platform orders and update fulfillment status.
            {!loading && <span style={{ color: '#E91E8C' }}> ({filteredOrders.length} shown)</span>}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B6B80' }} />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl text-sm w-full sm:w-72 outline-none transition-all duration-200"
              style={{ background: '#1E1E2C', border: '1px solid #2A2A3A', color: '#FFFFFF' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
            style={{ background: '#1E1E2C', border: '1px solid #2A2A3A', color: '#FFFFFF' }}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E91E8C' }} />
        </div>
      ) : error ? (
        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.3)', color: '#FF69B4' }}>
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#6B6B80' }} />
          <p style={{ color: '#6B6B80' }}>{search || statusFilter !== 'all' ? 'No matching orders found.' : 'No orders yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const status = String(order.status || 'pending').toLowerCase();
            const s = getStatusStyle(status);
            return (
              <button
                key={order.order_id}
                type="button"
                onClick={() => navigate(`/orders/${order.order_id}`)}
                className="text-left rounded-xl p-5 transition-all duration-200 hover:scale-[1.01] group cursor-pointer flex flex-col h-full"
                style={{ background: '#12121F', border: '1px solid #2A2A3A' }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: 'rgba(233,30,140,0.15)', color: '#E91E8C' }}>
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: '#FFFFFF' }}>Order #{order.order_id}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#6B6B80' }}>{order.user_name || 'Unknown customer'}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
                    <CircleDashed className="w-3.5 h-3.5" />
                    {status}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs" style={{ color: '#9E9E9E' }}>Customer</span>
                    <span className="text-sm text-right truncate" style={{ color: '#FFFFFF' }}>{order.user_email || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs" style={{ color: '#9E9E9E' }}>Total</span>
                    <span className="font-semibold text-sm" style={{ color: '#E91E8C' }}>{Number(order.total_amount || 0).toLocaleString('en-EG')} EGP</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs" style={{ color: '#9E9E9E' }}>Placed</span>
                    <span className="text-sm" style={{ color: '#FFFFFF' }}>{formatDate(order.order_date)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs" style={{ color: '#9E9E9E' }}>Delivery</span>
                    <span className="text-sm" style={{ color: '#FFFFFF' }}>{formatDate(order.preferred_delivery_date)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #1E1E2C' }}>
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#6B6B80' }}>
                    <Clock3 className="w-3.5 h-3.5" />
                    {order.estimated_delivery_start || order.estimated_delivery_end ? `${formatDate(order.estimated_delivery_start)} - ${formatDate(order.estimated_delivery_end)}` : 'No estimate'}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#E91E8C' }}>
                    View details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
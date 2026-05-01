import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle2, CircleDashed, Clock3, Loader2, Mail, MapPin, Package, ShoppingBag, Truck, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrderDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error('Order detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      const res = await axios.patch(
        `${API_URL}/api/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setOrder((prev) => (prev ? { ...prev, status } : prev));
      }
    } catch (err) {
      console.error('Order status update error:', err);
    } finally {
      setUpdating(false);
    }
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

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E91E8C' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p style={{ color: '#6B6B80' }}>Order not found.</p>
        <button onClick={() => navigate('/orders')} className="mt-4 text-sm cursor-pointer" style={{ color: '#E91E8C' }}>Back to Orders</button>
      </div>
    );
  }

  const status = String(order.status || 'pending').toLowerCase();
  const s = getStatusStyle(status);
  const items = Array.isArray(order.items) ? order.items : [];
  const shippingAddress = [order.shipping_title, order.shipping_street, order.shipping_city].filter(Boolean).join(' • ') || '—';
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const lineTotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price_each || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-2 text-sm transition-colors duration-200 cursor-pointer"
        style={{ color: '#9E9E9E' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#E91E8C')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#9E9E9E')}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl text-lg font-bold" style={{ background: 'rgba(233,30,140,0.15)', color: '#E91E8C' }}>
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Order #{order.order_id}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mt-1 border" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
              <CircleDashed className="w-3.5 h-3.5" />
              {status}
            </span>
          </div>
        </div>

        <div className="rounded-xl px-4 py-3 text-right" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <div className="text-xs" style={{ color: '#9E9E9E' }}>Total amount</div>
          <div className="text-xl font-bold" style={{ color: '#E91E8C' }}>{Number(order.total_amount || 0).toLocaleString('en-EG')} EGP</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: '#FFFFFF' }}>Customer Information</h2>
          <div className="space-y-4">
            <InfoRow label="Customer" value={order.customer_name || '—'} icon={ShoppingBag} />
            <InfoRow label="Email" value={order.customer_email || '—'} icon={Mail} />
            <InfoRow label="Order Date" value={formatDateTime(order.order_date)} icon={Clock3} />
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: '#FFFFFF' }}>Delivery Information</h2>
          <div className="space-y-4">
            <InfoRow label="Shipping Address" value={shippingAddress} icon={MapPin} />
            <InfoRow label="Preferred Delivery" value={formatDate(order.preferred_delivery_date)} icon={Truck} />
            <InfoRow label="Estimated Window" value={order.estimated_delivery_start || order.estimated_delivery_end ? `${formatDate(order.estimated_delivery_start)} - ${formatDate(order.estimated_delivery_end)}` : '—'} icon={Clock3} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Order Items</h2>
            <span className="text-sm" style={{ color: '#9E9E9E' }}>{itemCount} items</span>
          </div>

          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: '#1E1E2C', border: '1px solid #2A2A3A' }}>
                <Package className="w-10 h-10 mx-auto mb-2" style={{ color: '#6B6B80' }} />
                <p className="text-sm" style={{ color: '#6B6B80' }}>No order items found.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.order_item_id} className="rounded-xl p-4 flex items-center justify-between gap-4" style={{ background: '#1E1E2C', border: '1px solid #2A2A3A' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>{item.product_name || `Product #${item.product_id}`}</p>
                    <p className="text-xs mt-1" style={{ color: '#6B6B80' }}>Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: '#E91E8C' }}>{Number(item.price_each || 0).toLocaleString('en-EG')} EGP</p>
                    <p className="text-xs mt-1" style={{ color: '#6B6B80' }}>Line total: {(Number(item.quantity || 0) * Number(item.price_each || 0)).toLocaleString('en-EG')} EGP</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid #2A2A3A' }}>
            <span className="text-sm" style={{ color: '#9E9E9E' }}>Computed total from items</span>
            <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{lineTotal.toLocaleString('en-EG')} EGP</span>
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: '#FFFFFF' }}>Status Actions</h2>
          <div className="space-y-3">
            {STATUS_OPTIONS.map((nextStatus) => {
              const active = nextStatus === status;
              const isDanger = nextStatus === 'cancelled';
              return (
                <button
                  key={nextStatus}
                  type="button"
                  onClick={() => updateStatus(nextStatus)}
                  disabled={updating || active}
                  className="w-full inline-flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-60"
                  style={{
                    background: active ? 'rgba(233,30,140,0.12)' : isDanger ? 'rgba(239,68,68,0.12)' : 'rgba(233,30,140,0.08)',
                    color: active ? '#E91E8C' : isDanger ? '#f87171' : '#FFFFFF',
                    border: `1px solid ${active ? 'rgba(233,30,140,0.25)' : isDanger ? 'rgba(239,68,68,0.25)' : 'rgba(233,30,140,0.12)'}`,
                  }}
                >
                  <span className="inline-flex items-center gap-2 capitalize">
                    {nextStatus === 'cancelled' ? <XCircle className="w-4 h-4" /> : nextStatus === 'delivered' ? <CheckCircle2 className="w-4 h-4" /> : <CircleDashed className="w-4 h-4" />}
                    {nextStatus}
                  </span>
                  {updating && active ? 'Updating...' : active ? 'Current' : 'Set status'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, icon }) => {
  const Icon = icon;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#6B6B80' }}>{label}</p>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'rgba(233,30,140,0.1)' }}>
          <Icon className="w-4 h-4" style={{ color: '#E91E8C' }} />
        </div>
        <p className="text-sm leading-5 wrap-break-word" style={{ color: '#FFFFFF' }}>{value}</p>
      </div>
    </div>
  );
};

export default OrderDetail;
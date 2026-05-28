import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle2, CircleDashed, Clock3, Mail, MapPin, Package, ShoppingBag, Truck, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const STATUS_OPTIONS = ['pending', 'processing', 'ready_for_pickup', 'in_transit', 'delivered', 'cancelled', 'return_requested', 'returned'];

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('payload');

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
        return { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', glow: '0 0 15px rgba(34,197,94,0.3)', border: 'rgba(34,197,94,0.2)' };
      case 'processing':
      case 'ready_for_pickup':
      case 'in_transit':
        return { bg: 'rgba(0, 212, 255, 0.1)', color: '#00D4FF', glow: '0 0 15px rgba(0, 212, 255, 0.3)', border: 'rgba(0, 212, 255, 0.2)' };
      case 'cancelled':
        return { bg: 'rgba(255, 0, 128, 0.1)', color: '#FF0080', glow: '0 0 15px rgba(255, 0, 128, 0.3)', border: 'rgba(255, 0, 128, 0.2)' };
      case 'return_requested':
        return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', glow: '0 0 15px rgba(245,158,11,0.3)', border: 'rgba(245,158,11,0.2)' };
      case 'returned':
        return { bg: 'rgba(156,163,175,0.1)', color: '#9ca3af', glow: '0 0 15px rgba(156,163,175,0.3)', border: 'rgba(156,163,175,0.2)' };
      default:
        return { bg: 'rgba(123, 44, 191, 0.1)', color: '#7B2CBF', glow: '0 0 15px rgba(123, 44, 191, 0.3)', border: 'rgba(123, 44, 191, 0.2)' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyber-pink/20 border-t-cyber-pink animate-spin" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-pink animate-pulse">Retrieving Manifest</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-32">
        <XCircle className="w-16 h-16 text-white/5 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2 display-font">Record Not Found</h2>
        <p className="text-text-secondary mb-8">The requested order payload does not exist in the current terminal.</p>
        <button onClick={() => navigate('/orders')} className="cyber-button px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest">
          Return to Registry
        </button>
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
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in">
        <div className="space-y-4">
          <button
            onClick={() => navigate('/orders')}
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            Back to Registry
          </button>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-black border border-white/5 flex items-center justify-center neo-border-purple group">
              <ShoppingBag className="w-8 h-8 text-cyber-purple group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter display-font leading-none mb-2 uppercase">Order #{order.order_id}</h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border" 
                      style={{ background: s.bg, color: s.color, borderColor: s.border, boxShadow: s.glow }}>
                  <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                  {status}
                </span>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">ID: {order.user_id || 'UNKNOWN_OP'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel px-8 py-5 text-right relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-full bg-cyber-pink/10 skew-x-[-20deg] translate-x-16 group-hover:translate-x-12 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="text-[10px] font-black tracking-widest uppercase text-text-secondary mb-1">Settlement Value</div>
            <div className="text-3xl font-black text-cyber-pink display-font">{Number(order.total_amount || 0).toLocaleString('en-EG')} <span className="text-xs">EGP</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column with Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Selector */}
          <div className="flex border-b border-white/5 overflow-x-auto custom-scrollbar gap-2">
            <button
              onClick={() => setActiveTab('payload')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'payload'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Payload Composition
            </button>
            <button
              onClick={() => setActiveTab('logistics')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none border-b-2 ${
                activeTab === 'logistics'
                  ? 'text-cyber-blue border-cyber-blue'
                  : 'text-text-secondary hover:text-white border-transparent'
              }`}
            >
              Customer & Logistics
            </button>
          </div>

          {/* Tab Content: Payload */}
          {activeTab === 'payload' && (
            <div className="glass-panel p-8 animate-fade-in space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white display-font">Payload Composition</h2>
                <span className="text-[10px] font-black text-cyber-blue px-2 py-0.5 rounded bg-cyber-blue/10 border border-cyber-blue/20">
                  {itemCount} UNITS
                </span>
              </div>

              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="rounded-2xl p-12 text-center bg-black/40 border border-white/5">
                    <Package className="w-12 h-12 mx-auto mb-4 text-white/5" />
                    <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">No payload detected</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.order_item_id} className="group relative overflow-hidden rounded-2xl p-6 bg-black/40 border border-white/5 hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 group-hover:text-cyber-blue transition-colors">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-cyber-blue transition-colors">{item.product_name || `Product #${item.product_id}`}</p>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white display-font">{Number(item.price_each || 0).toLocaleString('en-EG')} EGP</p>
                          <p className="text-[10px] font-bold text-cyber-pink uppercase tracking-widest mt-1">Line: {(Number(item.quantity || 0) * Number(item.price_each || 0)).toLocaleString('en-EG')} EGP</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary italic">Audit Computed Total</span>
                <span className="text-lg font-black text-white display-font">{lineTotal.toLocaleString('en-EG')} EGP</span>
              </div>
            </div>
          )}

          {/* Tab Content: Logistics */}
          {activeTab === 'logistics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="glass-panel p-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyber-blue opacity-30" />
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white display-font mb-8 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyber-blue rounded-full" /> Operative Identity
                </h2>
                <div className="space-y-6">
                  <InfoRow label="Protocol Name" value={order.customer_name || '—'} icon={ShoppingBag} accent="var(--accent-blue)" />
                  <InfoRow label="Secure Email" value={order.customer_email || '—'} icon={Mail} accent="var(--accent-blue)" />
                  <InfoRow label="Transmission Date" value={formatDateTime(order.order_date)} icon={Clock3} accent="var(--accent-blue)" />
                </div>
              </div>

              <div className="glass-panel p-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyber-purple opacity-30" />
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white display-font mb-8 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyber-purple rounded-full" /> Logistic Manifest
                </h2>
                <div className="space-y-6">
                  <InfoRow label="Deployment Point" value={shippingAddress} icon={MapPin} accent="var(--accent-purple)" />
                  <InfoRow label="Preferred Window" value={formatDate(order.preferred_delivery_date)} icon={Truck} accent="var(--accent-purple)" />
                  <InfoRow label="ETA Horizon" value={order.estimated_delivery_start || order.estimated_delivery_end ? `${formatDate(order.estimated_delivery_start)} - ${formatDate(order.estimated_delivery_end)}` : 'ANALYZING...'} icon={Clock3} accent="var(--accent-purple)" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white display-font mb-8">Override Status</h2>
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
                    className={`cyber-button w-full flex items-center justify-between px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border cursor-pointer ${
                      active ? 'neo-border-pink bg-cyber-pink/10' : 'bg-white/5 border-white/5'
                    } disabled:opacity-40`}
                    style={{
                      color: active ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    <span className="flex items-center gap-3">
                      {nextStatus === 'cancelled' ? <XCircle className="w-4 h-4" /> : nextStatus === 'delivered' ? <CheckCircle2 className="w-4 h-4" /> : <CircleDashed className="w-4 h-4" />}
                      {nextStatus}
                    </span>
                    {active ? (
                      <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded">ACTIVE</span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">UPDATE</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 p-4 rounded-xl bg-black/40 border border-white/5">
              <p className="text-[9px] font-medium leading-relaxed text-text-secondary uppercase tracking-tight italic">
                Status overrides are logged to the persistent security ledger. Ensure manifest verification before deployment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, icon: Icon, accent }) => (
  <div className="group/row flex items-center gap-4">
    <div className="w-9 h-9 shrink-0 rounded-2xl bg-black border border-white/5 flex items-center justify-center transition-all group-hover/row:border-current" style={{ color: accent }}>
      <Icon className="w-4.5 h-4.5 opacity-40 group-hover/row:opacity-100 transition-opacity" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 text-text-secondary group-hover/row:text-white transition-colors truncate">{label}</p>
      <p className="text-[11px] font-bold text-white/80 group-hover/row:text-white transition-colors break-words">{value}</p>
    </div>
  </div>
);

export default OrderDetail;

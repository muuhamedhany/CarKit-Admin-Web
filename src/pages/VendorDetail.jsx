import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, FileText, Eye, CheckCircle, XCircle, Loader2, Store } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const VendorDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/vendors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setVendor(res.data.data);
    } catch (err) {
      console.error('Error fetching vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendor(); }, [id]);

  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      await axios.put(`${API_URL}/api/vendors/${id}`, { verification_status: status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVendor();
    } catch (err) {
      console.error('Error updating vendor:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.25)' };
      case 'rejected': return { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)' };
      default: return { bg: 'rgba(234,179,8,0.12)', color: '#facc15', border: 'rgba(234,179,8,0.25)' };
    }
  };

  const getDocUrl = (doc) => doc?.startsWith('http') ? doc : `${API_URL}${doc}`;
  const getDocName = (url) => {
    if (!url) return '';
    try { return decodeURIComponent(url.split('/').pop()); } catch { return url.split('/').pop(); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E91E8C' }} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-20">
        <p style={{ color: '#6B6B80' }}>Vendor not found.</p>
        <button onClick={() => navigate('/vendors')} className="mt-4 text-sm cursor-pointer" style={{ color: '#E91E8C' }}>← Back to Vendors</button>
      </div>
    );
  }

  const status = vendor.verification_status || 'pending';
  const s = getStatusStyle(status);
  const documents = [
    { label: 'Document 1', url: vendor.document_1_url },
    { label: 'Document 2', url: vendor.document_2_url },
    { label: 'Document 3', url: vendor.document_3_url },
  ].filter(d => d.url);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <button
        onClick={() => navigate('/vendors')}
        className="inline-flex items-center gap-2 text-sm transition-colors duration-200 cursor-pointer"
        style={{ color: '#9E9E9E' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#E91E8C')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#9E9E9E')}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Vendors
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl text-lg font-bold"
          style={{ background: 'rgba(156,39,176,0.15)', color: '#B388FF' }}
        >
          {vendor.name?.charAt(0)?.toUpperCase() || 'V'}
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Review Vendor: {vendor.name}</h1>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mt-1"
            style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Vendor Information */}
        <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: '#FFFFFF' }}>Vendor Information</h2>
          <div className="space-y-4">
            {[
              { label: 'Vendor Name', value: vendor.name },
              { label: 'Contact Info', value: vendor.contact_info || '—' },
              { label: 'Vendor ID', value: `#${vendor.vendor_id}` },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#6B6B80' }}>{item.label}</p>
                <p className="text-sm" style={{ color: '#FFFFFF' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submitted Documents */}
        <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: '#FFFFFF' }}>Submitted Documents</h2>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 mx-auto mb-2" style={{ color: '#2A2A3A' }} />
              <p className="text-sm" style={{ color: '#6B6B80' }}>No documents submitted.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl p-4"
                  style={{ background: '#1E1E2C', border: '1px solid #2A2A3A' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ background: 'rgba(179,136,255,0.1)' }}>
                      <FileText className="w-5 h-5" style={{ color: '#B388FF' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#FFFFFF' }}>{doc.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B6B80' }}>{getDocName(doc.url)}</p>
                    </div>
                  </div>
                  <a
                    href={getDocUrl(doc.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{ background: 'rgba(156,39,176,0.15)', color: '#B388FF' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(156,39,176,0.25)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(156,39,176,0.15)'; }}
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Final Action */}
      <div className="rounded-xl p-6" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
        <h2 className="text-base font-semibold mb-5" style={{ color: '#FFFFFF' }}>Final Action</h2>
        <div className="flex flex-wrap gap-3">
          {status !== 'approved' && (
            <button
              onClick={() => updateStatus('approved')}
              disabled={updating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.15)'; }}
            >
              <CheckCircle className="w-4 h-4" />
              {updating ? 'Updating...' : 'Approve Vendor'}
            </button>
          )}
          {status !== 'rejected' && (
            <button
              onClick={() => updateStatus('rejected')}
              disabled={updating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            >
              <XCircle className="w-4 h-4" />
              {updating ? 'Updating...' : 'Reject Vendor'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;

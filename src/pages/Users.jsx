import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Search, Loader2, Mail, Phone, Calendar, UserCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const Users = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (err) {
        console.error('Users fetch error:', err);
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>Users</h1>
          <p className="mt-1 text-sm" style={{ color: '#9E9E9E' }}>
            Manage all registered users in CarKit.
            {!loading && <span style={{ color: '#E91E8C' }}> ({users.length} total)</span>}
          </p>
        </div>
        {/* Search */}
        <div className="mt-4 sm:mt-0 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B6B80' }} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl text-sm w-64 outline-none transition-all duration-200"
            style={{
              background: '#1E1E2C',
              border: '1px solid #2A2A3A',
              color: '#FFFFFF',
            }}
          />
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
      ) : (
        <div className="overflow-hidden rounded-xl" style={{ background: '#12121F', border: '1px solid #2A2A3A' }}>
          <table className="min-w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A3A' }}>
                <th className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B6B80' }}>User</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B6B80' }}>Email</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B6B80' }}>Phone</th>
                <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B6B80' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-sm" style={{ color: '#6B6B80' }}>
                    {search ? 'No matching users found.' : 'No users yet.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr
                    key={user.user_id}
                    className="transition-colors duration-150"
                    style={{
                      borderBottom: idx < filteredUsers.length - 1 ? '1px solid #1E1E2C' : 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(233,30,140,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold"
                          style={{ background: 'rgba(233,30,140,0.15)', color: '#E91E8C' }}
                        >
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium" style={{ color: '#FFFFFF' }}>{user.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm" style={{ color: '#9E9E9E' }}>{user.email}</td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm" style={{ color: '#9E9E9E' }}>{user.phone || '—'}</td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm" style={{ color: '#6B6B80' }}>{formatDate(user.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;

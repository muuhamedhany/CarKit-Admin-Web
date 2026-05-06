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
    <div className="space-y-10 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white display-font">
            Registry <span className="text-cyber-blue">Database</span>
          </h1>
          <p className="mt-2 text-text-secondary font-medium tracking-wide">
            Internal ledger of <span className="text-white font-bold">{users.length}</span> verified CarKit operatives.
          </p>
        </div>
        
        {/* Search with high-craft styling */}
        <div className="relative group max-w-sm w-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
          <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
            <Search size={18} className="ml-4 text-text-secondary group-focus-within:text-cyber-blue transition-colors" />
            <input
              type="text"
              placeholder="Search registry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3.5 text-sm text-white bg-transparent outline-none placeholder:text-white/10"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-cyber-pink/20 border-t-cyber-pink animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-b-cyber-blue animate-spin" style={{ animationDuration: '1.5s' }} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyber-pink animate-pulse">Accessing Data</span>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center neo-border-pink">
          <AlertCircle className="w-10 h-10 text-cyber-pink mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Access Error</h3>
          <p className="text-sm text-text-secondary">{error}</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden border border-white/5 neo-border-purple shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="py-5 pl-8 pr-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary border-b border-white/5">Operative</th>
                  <th className="px-4 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary border-b border-white/5">Comms Link</th>
                  <th className="px-4 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary border-b border-white/5">Access Level</th>
                  <th className="px-4 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary border-b border-white/5 text-right pr-8">Enrollment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-24 text-center">
                      <div className="flex flex-col items-center">
                        <UserCircle className="w-12 h-12 text-white/5 mb-4" />
                        <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">No records match your query</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.user_id}
                      className="group hover:bg-white/[0.03] transition-all duration-300"
                    >
                      <td className="whitespace-nowrap py-6 pl-8 pr-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-cyber-blue blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative w-10 h-10 rounded-xl bg-black border border-cyber-blue/30 flex items-center justify-center text-cyber-blue font-black text-sm display-font group-hover:scale-110 transition-transform">
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-white group-hover:text-cyber-blue transition-colors">{user.name}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-6 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-text-secondary group-hover:text-white transition-colors">
                            <Mail size={12} className="text-cyber-purple/50" />
                            <span className="text-xs font-medium">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Phone size={12} className="text-cyber-blue/50" />
                            <span className="text-[10px] font-medium tracking-tight">{user.phone || 'NO SECURE LINE'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-6 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 text-white border border-white/10 group-hover:border-cyber-blue/30 transition-colors">
                          STANDARD_USER
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-6 px-4 text-right pr-8">
                        <div className="flex items-center justify-end gap-2 text-[11px] font-bold text-text-secondary display-font">
                          <Calendar size={12} className="text-cyber-pink/50" />
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer bar */}
          <div className="bg-white/[0.02] px-8 py-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">
              Database Sync: <span className="text-cyber-blue">Optimal</span>
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1 h-1 bg-cyber-pink/40 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

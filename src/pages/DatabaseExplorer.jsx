import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Save, X, Search, Activity, Layers } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const DatabaseExplorer = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchSchema();
      fetchData(1);
    }
  }, [selectedTable]);

  const fetchTables = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/superadmin/tables`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('carkit_admin_token')}` }
      });
      setTables(res.data.data);
      if (res.data.data.length > 0 && !selectedTable) {
        setSelectedTable(res.data.data[0]);
      }
    } catch (err) {
      setError('Failed to fetch tables');
    }
  };

  const fetchSchema = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/superadmin/tables/${selectedTable}/schema`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('carkit_admin_token')}` }
      });
      setColumns(res.data.data);
    } catch (err) {
      setError('Failed to fetch table schema');
    }
  };

  const fetchData = async (page) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/superadmin/tables/${selectedTable}?page=${page}&limit=${pagination.limit}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('carkit_admin_token')}` }
      });
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('Failed to fetch table data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRow(null);
    const initialData = {};
    columns.forEach(col => {
      if (col.column_default === null) initialData[col.column_name] = '';
    });
    setFormData(initialData);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingRow(row);
    setFormData(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    const idColumn = columns.find(c => c.column_name.includes('_id'))?.column_name || columns[0].column_name;
    if (!window.confirm(`Are you sure you want to delete this row?`)) return;

    try {
      await axios.delete(`${API_URL}/api/superadmin/tables/${selectedTable}/${row[idColumn]}?idColumn=${idColumn}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('carkit_admin_token')}` }
      });
      fetchData(pagination.page);
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const idColumn = columns.find(c => c.column_name.includes('_id'))?.column_name || columns[0].column_name;
    
    try {
      if (editingRow) {
        await axios.put(`${API_URL}/api/superadmin/tables/${selectedTable}/${editingRow[idColumn]}`, {
          ...formData,
          idColumn
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('carkit_admin_token')}` }
        });
      } else {
        await axios.post(`${API_URL}/api/superadmin/tables/${selectedTable}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('carkit_admin_token')}` }
        });
      }
      setIsModalOpen(false);
      fetchData(pagination.page);
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20">
              <Database className="w-5 h-5 text-cyber-blue" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter display-font uppercase">
              Core Data Nexus
            </h1>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mt-2">
            Direct database orchestration for Super Admin protocol.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group w-full md:w-64">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-blue to-cyber-purple opacity-20 group-hover:opacity-40 transition-opacity blur rounded-xl" />
            <select 
              value={selectedTable} 
              onChange={(e) => setSelectedTable(e.target.value)}
              className="relative w-full rounded-xl py-3 pl-4 pr-10 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer bg-black border border-white/10 text-white appearance-none"
            >
              {tables.map(t => <option key={t} value={t}>TABLE: {t.toUpperCase()}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>

          <button 
            onClick={handleCreate}
            className="cyber-button w-full md:w-auto px-6 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/20 hover:border-cyber-blue"
          >
            <Plus className="w-4 h-4" /> Inject Record
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-panel p-4 border-cyber-pink/30 bg-cyber-pink/5 text-center">
          <p className="text-[10px] font-black text-cyber-pink uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* Main Grid View */}
      <div className="glass-panel relative overflow-hidden border-white/5">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent opacity-30" />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-cyber-blue/10 border-t-cyber-blue animate-spin" />
              <div className="absolute inset-0 bg-cyber-blue/20 blur-xl animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyber-blue">Synchronizing...</span>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white/[0.02]">
                  {columns.map(col => (
                    <th key={col.column_name} className="px-6 py-5 border-b border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{col.column_name}</span>
                        <span className="text-[8px] font-bold text-text-secondary uppercase tracking-[0.2em]">{col.data_type}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-5 border-b border-white/5 text-right text-[10px] font-black text-cyber-pink uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01] transition-colors group">
                    {columns.map(col => (
                      <td key={col.column_name} className="px-6 py-4">
                        <div className="text-[11px] font-bold text-text-secondary group-hover:text-white transition-colors">
                          {row[col.column_name] === null ? (
                            <span className="text-[9px] font-black text-white/10 uppercase tracking-widest italic">NULL</span>
                          ) : String(row[col.column_name])}
                        </div>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(row)}
                          className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-text-secondary hover:text-cyber-blue hover:border-cyber-blue/40 transition-all active:scale-90"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleDelete(row)}
                          className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-text-secondary hover:text-cyber-pink hover:border-cyber-pink/40 transition-all active:scale-90"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Container */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
          Node Cluster: <span className="text-white">{data.length}</span> of <span className="text-white">{pagination.total}</span> Units
        </span>
        
        <div className="flex items-center gap-3">
          <button 
            disabled={pagination.page <= 1} 
            onClick={() => fetchData(pagination.page - 1)}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-text-secondary hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="px-6 py-3 rounded-xl bg-black border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
            Segment {pagination.page}
          </div>
          
          <button 
            disabled={pagination.page * pagination.limit >= pagination.total} 
            onClick={() => fetchData(pagination.page + 1)}
            className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-text-secondary hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Protocol Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-4xl glass-panel p-8 overflow-hidden shadow-2xl border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-blue/5 skew-x-[-20deg] translate-x-32 -translate-y-32" />
            
            <div className="flex items-center justify-between mb-8 relative z-10 border-b border-white/5 pb-6">
              <div>
                <h2 className="text-2xl font-black text-white display-font uppercase tracking-tight">
                  {editingRow ? 'Update Protocol' : 'Initial Injection'}
                </h2>
                <p className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] mt-1">
                  Nexus Override ID: {editingRow ? 'ENTITY_EXISTING' : 'ENTITY_NEW'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/5 text-text-secondary hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar px-1 py-1">
                {columns.map(col => {
                  const isReadOnly = col.column_name.includes('_id') || col.column_name === 'created_at' || col.column_name === 'updated_at';
                  if (editingRow && isReadOnly) return null;
                  if (!editingRow && col.column_default !== null) return null;

                  return (
                    <div className="space-y-2" key={col.column_name}>
                      <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest block pl-1">
                        {col.column_name} <span className="text-cyber-blue">[{col.data_type}]</span>
                      </label>
                      {col.data_type === 'boolean' ? (
                        <div className="flex items-center h-12 px-4 rounded-xl bg-black/40 border border-white/10">
                          <input 
                            type="checkbox" 
                            name={col.column_name} 
                            checked={formData[col.column_name] || false}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded border-white/20 bg-black/40 text-cyber-blue focus:ring-cyber-blue focus:ring-offset-black"
                          />
                          <span className="ml-3 text-[10px] font-bold text-white uppercase tracking-widest">Toggle State</span>
                        </div>
                      ) : (
                        <input 
                          type={col.data_type.includes('int') || col.data_type === 'numeric' ? 'number' : 'text'}
                          name={col.column_name}
                          value={formData[col.column_name] || ''}
                          onChange={handleInputChange}
                          placeholder={`Enter ${col.column_name}...`}
                          className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-bold focus:neo-border-blue transition-all outline-none placeholder:text-white/10"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                  Abort Protocol
                </button>
                <button 
                  type="submit" 
                  className="cyber-button px-8 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/20 hover:border-cyber-blue transition-all"
                >
                  <Save size={16} /> Execute Command
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseExplorer;

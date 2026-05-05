import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Save, X, Search } from 'lucide-react';
import './DatabaseExplorer.css';

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
    <div className="db-explorer">
      <div className="header-section">
        <div className="title-area">
          <Database className="title-icon" />
          <h1>Database Explorer</h1>
        </div>
        
        <div className="controls-area">
          <div className="table-selector">
            <select 
              value={selectedTable} 
              onChange={(e) => setSelectedTable(e.target.value)}
            >
              {tables.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button className="add-button" onClick={handleCreate}>
            <Plus size={18} /> Add Row
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-container">
        {loading ? (
          <div className="loader">Loading data...</div>
        ) : (
          <table>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.column_name}>
                    {col.column_name}
                    <span className="col-type">{col.data_type}</span>
                  </th>
                ))}
                <th className="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {columns.map(col => (
                    <td key={col.column_name}>
                      <div className="cell-content">
                        {row[col.column_name] === null ? <span className="null-val">NULL</span> : String(row[col.column_name])}
                      </div>
                    </td>
                  ))}
                  <td className="actions-cell">
                    <button className="icon-btn edit" onClick={() => handleEdit(row)} title="Edit"><Edit2 size={14} /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(row)} title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination">
        <span>Showing {data.length} of {pagination.total} rows</span>
        <div className="page-btns">
          <button 
            disabled={pagination.page <= 1} 
            onClick={() => fetchData(pagination.page - 1)}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="page-num">Page {pagination.page}</span>
          <button 
            disabled={pagination.page * pagination.limit >= pagination.total} 
            onClick={() => fetchData(pagination.page + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingRow ? 'Edit Row' : 'Add New Row'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                {columns.map(col => {
                  const isReadOnly = col.column_name.includes('_id') || col.column_name === 'created_at' || col.column_name === 'updated_at';
                  if (editingRow && isReadOnly) return null;
                  if (!editingRow && col.column_default !== null) return null;

                  return (
                    <div className="form-group" key={col.column_name}>
                      <label>{col.column_name} <span className="type-label">({col.data_type})</span></label>
                      {col.data_type === 'boolean' ? (
                        <input 
                          type="checkbox" 
                          name={col.column_name} 
                          checked={formData[col.column_name] || false}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <input 
                          type={col.data_type.includes('int') || col.data_type === 'numeric' ? 'number' : 'text'}
                          name={col.column_name}
                          value={formData[col.column_name] || ''}
                          onChange={handleInputChange}
                          placeholder={`Enter ${col.column_name}...`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-button"><Save size={18} /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseExplorer;

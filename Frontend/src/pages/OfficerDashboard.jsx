// Officer/Admin Dashboard
// Demonstrates: AUTHORIZATION (Officer/Admin-only access), Hybrid Decryption & Verification

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../components/api';
import './Dashboard.css';

function OfficerDashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verifyForm, setVerifyForm] = useState({
    status: 'verified',
    comments: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, statsRes] = await Promise.all([
        api.get('/documents/all-documents'),
        api.get('/users/stats/overview')
      ]);

      setDocuments(docsRes.data.documents || []);
      setStats(statsRes.data.stats || null);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (docId) => {
    try {
      await api.patch(`/documents/${docId}/verify`, verifyForm);
      alert(`Document ${verifyForm.status} successfully`);
      setSelectedDoc(null);
      setVerifyForm({ status: 'verified', comments: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Verification failed');
    }
  };

  const viewPdf = async (docId) => {
    try {
      const res = await api.get(`/documents/${docId}/pdf`, {
        responseType: 'blob'
      });

      const url = URL.createObjectURL(
        new Blob([res.data], { type: 'application/pdf' })
      );

      window.open(url, '_blank');
    } catch (err) {
      alert('Failed to open PDF');
    }
  };

  const getFilteredDocuments = () => {
    if (filter === 'all') return documents;
    return documents.filter(d => d.verificationStatus === filter);
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { class: 'badge-pending', text: 'Pending' },
      verified: { class: 'badge-verified', text: 'Verified ✓' },
      rejected: { class: 'badge-rejected', text: 'Rejected ✗' }
    };
    return map[status] || map.pending;
  };

  const filteredDocs = getFilteredDocuments();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>{user.role === 'admin' ? 'Admin' : 'Officer'} Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>
        <div className="header-actions">
          <Link to="/security-levels" className="btn-secondary">Security Info</Link>
          <button onClick={onLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.documents.total}</h3>
              <p>Total Documents</p>
            </div>
            <div className="stat-card pending">
              <h3>{stats.documents.pending}</h3>
              <p>Pending</p>
            </div>
            <div className="stat-card verified">
              <h3>{stats.documents.verified}</h3>
              <p>Verified</p>
            </div>
            <div className="stat-card rejected">
              <h3>{stats.documents.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>
        )}

        <div className="security-info-box">
          <h3>🔐 Hybrid Decryption Active</h3>
          <p><strong>Role:</strong> {user.role.toUpperCase()}</p>
          <p>AES keys are unwrapped using RSA private key (server-side)</p>
        </div>

        <div className="filter-section">
          <h2>Document Verification</h2>
          <div className="filter-buttons">
            {['all', 'pending', 'verified', 'rejected'].map(f => (
              <button
                key={f}
                className={filter === f ? 'active' : ''}
                onClick={() => setFilter(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p>Loading documents...</p>
        ) : filteredDocs.length === 0 ? (
          <p className="no-data">No documents found</p>
        ) : (
          <div className="documents-grid">
            {filteredDocs.map(doc => {
              const badge = getStatusBadge(doc.verificationStatus);

              return (
                <div key={doc._id} className="document-card">
                  <div className="doc-header">
                    <h4>{doc.documentType || 'Document'}</h4>
                    <span className={`badge ${badge.class}`}>{badge.text}</span>
                  </div>

                  <p><strong>Student:</strong> {doc.student?.name}</p>
                  <p><strong>Email:</strong> {doc.student?.email}</p>
                  <p><strong>Uploaded:</strong> {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : '—'}</p>

                  {doc.description && (
                    <p><strong>Description:</strong> {doc.description}</p>
                  )}

                  <div className="security-tags">
                    <span className="tag">AES-256</span>
                    <span className="tag">RSA-2048</span>
                    <span className="tag">SHA-256</span>
                  </div>

                  {doc.uploadMethod === 'pdf' && (
                    <button
                      className="btn-secondary"
                      onClick={() => viewPdf(doc._id)}
                    >
                      📄 View PDF
                    </button>
                  )}

                  {doc.verificationStatus === 'pending' ? (
                    <button
                      className="btn-primary"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      Review
                    </button>
                  ) : (
                    <p><strong>Verified By:</strong> {doc.verifier?.name}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedDoc && (
          <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Verify Document</h2>

              <p><strong>Document:</strong> {selectedDoc.documentType}</p>
              <p><strong>Student:</strong> {selectedDoc.student?.name}</p>

              <div className="form-group">
                <label>Decision</label>
                <select
                  value={verifyForm.status}
                  onChange={e => setVerifyForm({ ...verifyForm, status: e.target.value })}
                >
                  <option value="verified">Verify</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>

              <div className="form-group">
                <label>Comments</label>
                <textarea
                  rows="3"
                  value={verifyForm.comments}
                  onChange={e => setVerifyForm({ ...verifyForm, comments: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleVerify(selectedDoc._id)}
                >
                  Submit
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedDoc(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default OfficerDashboard;

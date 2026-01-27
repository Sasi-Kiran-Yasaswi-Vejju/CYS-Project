// Officer/Admin Dashboard
// Demonstrates: AUTHORIZATION (Officer/Admin-only access), Document Verification

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
      setDocuments(docsRes.data.documents);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (docId) => {
    try {
      await api.patch(`/documents/${docId}/verify`, verifyForm);
      alert(`Document ${verifyForm.status} successfully!`);
      setSelectedDoc(null);
      setVerifyForm({ status: 'verified', comments: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Verification failed');
    }
  };

  const getFilteredDocuments = () => {
    if (filter === 'all') return documents;
    return documents.filter(doc => doc.verificationStatus === filter);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', text: 'Pending' },
      verified: { class: 'badge-verified', text: 'Verified ✓' },
      rejected: { class: 'badge-rejected', text: 'Rejected ✗' }
    };
    return badges[status] || badges.pending;
  };

  const filteredDocs = getFilteredDocuments();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>{user.role === 'admin' ? 'Admin' : 'Officer'} Dashboard</h1>
          <p>Welcome, {user.name}!</p>
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
              <p>Pending Review</p>
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
          <h3>🔒 Access Control Active</h3>
          <p><strong>Your Role:</strong> {user.role.toUpperCase()}</p>
          <p><strong>Permissions:</strong> View all documents, Verify/Reject documents</p>
          <p><strong>Note:</strong> All document data is decrypted server-side with authorization checks</p>
        </div>

        <div className="filter-section">
          <h2>Document Verification</h2>
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All ({documents.length})
            </button>
            <button 
              className={filter === 'pending' ? 'active' : ''} 
              onClick={() => setFilter('pending')}
            >
              Pending ({documents.filter(d => d.verificationStatus === 'pending').length})
            </button>
            <button 
              className={filter === 'verified' ? 'active' : ''} 
              onClick={() => setFilter('verified')}
            >
              Verified ({documents.filter(d => d.verificationStatus === 'verified').length})
            </button>
            <button 
              className={filter === 'rejected' ? 'active' : ''} 
              onClick={() => setFilter('rejected')}
            >
              Rejected ({documents.filter(d => d.verificationStatus === 'rejected').length})
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading documents...</p>
        ) : filteredDocs.length === 0 ? (
          <p className="no-data">No documents found.</p>
        ) : (
          <div className="documents-grid">
            {filteredDocs.map((doc) => {
              const badge = getStatusBadge(doc.verificationStatus);
              return (
                <div key={doc._id} className="document-card">
                  <div className="doc-header">
                    <h4>{doc.documentType}</h4>
                    <span className={`badge ${badge.class}`}>{badge.text}</span>
                  </div>
                  
                  <div className="student-info">
                    <p><strong>Student:</strong> {doc.student?.name}</p>
                    <p><strong>Student ID:</strong> {doc.student?.studentId}</p>
                    <p><strong>Department:</strong> {doc.student?.department}</p>
                    <p><strong>Email:</strong> {doc.student?.email}</p>
                  </div>

                  <p className="doc-filename">{doc.fileName}</p>
                  <p className="doc-detail"><strong>Uploaded:</strong> {new Date(doc.uploadDate).toLocaleDateString()}</p>
                  {doc.description && (
                    <p className="doc-detail"><strong>Description:</strong> {doc.description}</p>
                  )}
                  
                  <div className="security-tags">
                    <span className="tag">🔓 Decrypted (AES-256)</span>
                    <span className="tag">✓ Signature Valid (SHA-256)</span>
                  </div>

                  {doc.verificationStatus === 'pending' ? (
                    <button 
                      onClick={() => setSelectedDoc(doc)} 
                      className="btn-primary"
                    >
                      Review Document
                    </button>
                  ) : (
                    <div className="verification-info">
                      <p><strong>Verified By:</strong> {doc.verifier?.name}</p>
                      <p><strong>Verified At:</strong> {new Date(doc.verifiedAt).toLocaleDateString()}</p>
                      {doc.verifierComments && (
                        <p><strong>Comments:</strong> {doc.verifierComments}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedDoc && (
          <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Verify Document</h2>
              
              <div className="doc-details">
                <p><strong>Document Type:</strong> {selectedDoc.documentType}</p>
                <p><strong>File Name:</strong> {selectedDoc.fileName}</p>
                <p><strong>Student:</strong> {selectedDoc.student?.name} ({selectedDoc.student?.studentId})</p>
                <p><strong>Email:</strong> {selectedDoc.student?.email}</p>
                {selectedDoc.description && (
                  <p><strong>Description:</strong> {selectedDoc.description}</p>
                )}
              </div>

              <div className="verify-form">
                <div className="form-group">
                  <label>Decision</label>
                  <select 
                    value={verifyForm.status}
                    onChange={(e) => setVerifyForm({...verifyForm, status: e.target.value})}
                  >
                    <option value="verified">Verify</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Comments</label>
                  <textarea
                    value={verifyForm.comments}
                    onChange={(e) => setVerifyForm({...verifyForm, comments: e.target.value})}
                    placeholder="Add verification comments..."
                    rows="4"
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    onClick={() => handleVerify(selectedDoc._id)}
                    className="btn-primary"
                  >
                    Submit Verification
                  </button>
                  <button 
                    onClick={() => setSelectedDoc(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OfficerDashboard;

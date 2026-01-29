// Student Dashboard
// Demonstrates: AUTHORIZATION (Student-only access), Hybrid Encryption Upload (AES + RSA)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../components/api';
import './Dashboard.css';

function StudentDashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const [documentType, setDocumentType] = useState('Resume');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents/my-documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Fetch documents failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!file && !description) {
      setUploadError('Please upload a PDF or enter description');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      if (description) formData.append('description', description);
      if (file) formData.append('file', file);

      await api.post('/documents/upload', formData);
      setUploadSuccess('Document uploaded securely using Hybrid Encryption');
      setFile(null);
      setDescription('');
      setShowUpload(false);
      fetchDocuments();
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Upload failed');
    }
  };

  const viewPdf = async (docId) => {
    try {
      const res = await api.get(`/documents/${docId}/pdf`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      window.open(url, '_blank');
    } catch (err) {
      alert('Failed to open PDF');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { class: 'badge-pending', text: 'Pending' },
      verified: { class: 'badge-verified', text: 'Verified ✓' },
      rejected: { class: 'badge-rejected', text: 'Rejected ✗' }
    };
    return map[status] || map.pending;
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome, {user.name}</p>
        </div>
        <div className="header-actions">
          <Link to="/security-levels" className="btn-secondary">Security Info</Link>
          <button onClick={onLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">

        <div className="info-card">
          <h3>Your Profile</h3>
          <p><strong>Student ID:</strong> {user.studentId}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>

        <div className="security-info-box">
          <h3>🔐 Hybrid Security Active</h3>
          <ul>
            <li>✓ AES-256 encryption per document</li>
            <li>✓ RSA-2048 key wrapping (Admin / Officer only)</li>
            <li>✓ SHA-256 digital signature (Integrity)</li>
            <li>✓ JWT + Role-based access control</li>
          </ul>
        </div>

        <div className="actions-section">
          <button
            className="btn-primary"
            onClick={() => setShowUpload(!showUpload)}
          >
            {showUpload ? 'Cancel Upload' : '+ Upload Document'}
          </button>
        </div>

        {showUpload && (
          <div className="upload-form-container">
            <h3>Upload Document</h3>

            {uploadError && <div className="error-message">{uploadError}</div>}
            {uploadSuccess && <div className="success-message">{uploadSuccess}</div>}

            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-group">
                <label>Document Type</label>
                <select value={documentType} onChange={e => setDocumentType(e.target.value)}>
                  <option>Resume</option>
                  <option>Degree Certificate</option>
                  <option>ID Proof</option>
                  <option>Marksheet</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Attach PDF (optional)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setFile(e.target.files[0])}
                />
              </div>

              <button type="submit" className="btn-primary">
                Upload Securely
              </button>
            </form>
          </div>
        )}

        <div className="documents-section">
          <h2>My Documents ({documents.length})</h2>

          {loading ? (
            <p>Loading…</p>
          ) : documents.length === 0 ? (
            <p className="no-data">No documents uploaded yet.</p>
          ) : (
            <div className="documents-grid">
              {documents.map(doc => {
                const badge = getStatusBadge(doc.verificationStatus);
                return (
                  <div key={doc._id} className="document-card">
                    <div className="doc-header">
                      <h4>{doc.documentType || 'Document'}</h4>
                      <span className={`badge ${badge.class}`}>{badge.text}</span>
                    </div>

                    <p><strong>File:</strong> {doc.fileName || 'No file attached'}</p>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;

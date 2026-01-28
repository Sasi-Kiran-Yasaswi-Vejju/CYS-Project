// Student Dashboard
// Demonstrates: AUTHORIZATION (Student-only access), Document Upload with ENCRYPTION

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../components/api';
import './Dashboard.css';

function StudentDashboard({ user, onLogout }) {
  const viewPdf = async (docId) => {
    try {
      const response = await api.get(`/documents/${docId}/pdf`, {
        responseType: 'blob'
      });

      const fileURL = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
      );

      window.open(fileURL, '_blank');
    } catch (error) {
      alert('Failed to open PDF');
      console.error(error);
    }
  };

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
      const response = await api.get('/documents/my-documents');
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
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

    await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setUploadSuccess('Document uploaded securely!');
    setFile(null);
    setDescription('');
    setShowUpload(false);
    fetchDocuments();

  } catch (error) {
    setUploadError(error.response?.data?.error || 'Upload failed');
  }
};





  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', text: 'Pending' },
      verified: { class: 'badge-verified', text: 'Verified ✓' },
      rejected: { class: 'badge-rejected', text: 'Rejected ✗' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome, {user.name}!</p>
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
          <p><strong>Role:</strong> {user.role.toUpperCase()}</p>
        </div>

        <div className="security-info-box">
          <h3>🔒 Security Features Active</h3>
          <ul>
            <li>✓ Documents encrypted using AES-256-CBC</li>
            <li>✓ Digital signatures (SHA-256) for integrity verification</li>
            <li>✓ Base64 encoding for document IDs</li>
            <li>✓ Role-based access control enforced</li>
          </ul>
        </div>

        <div className="actions-section">
          <button 
            onClick={() => setShowUpload(!showUpload)} 
            className="btn-primary"
          >
            {showUpload ? 'Cancel Upload' : '+ Upload Document'}
          </button>
        </div>

        {showUpload && (
          <div className="upload-form-container">
            <h3>Upload New Document</h3>
            <form onSubmit={handleUpload} className="upload-form">

            {uploadError && <div className="error-message">{uploadError}</div>}
            {uploadSuccess && <div className="success-message">{uploadSuccess}</div>}

            <div className="form-group">
              <label>Document Type</label>
              <select value={documentType} onChange={e => setDocumentType(e.target.value)}>
                <option value="Resume">Resume</option>
                <option value="Degree Certificate">Degree Certificate</option>
                <option value="ID Proof">ID Proof</option>
                <option value="Marksheet">Marksheet</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Attach PDF (Optional)</label>
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


            <div className="encryption-note">
              <strong>Note:</strong> Your document metadata will be encrypted using AES-256 and signed with SHA-256 hash for integrity verification.
            </div>
          </div>
        )}

        <div className="documents-section">
          <h2>My Documents ({documents.length})</h2>
          
          {loading ? (
            <p>Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="no-data">No documents uploaded yet.</p>
          ) : (
            <div className="documents-grid">
              {documents.map((doc) => {
                const badge = getStatusBadge(doc.verificationStatus);
                return (
                  <div key={doc._id} className="document-card">
                      <div className="doc-header">
                      <h4>{doc.documentType}</h4>
                      <span className={`badge ${badge.class}`}>{badge.text}</span>
                    </div>
                    <p className="doc-filename">
                      {doc.fileName ? doc.fileName : 'No file attached'}
                    </p>

                    {doc.uploadMethod === 'pdf' && (
                    <p className="doc-detail">
                      <strong>Upload Type:</strong> Secure PDF Upload
                    </p>
                    )}
                    <p className="doc-detail">
                      <strong>Uploaded:</strong>{' '}
                      {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : '—'}
                    </p>

                    {doc.description && (
                      <p className="doc-detail"><strong>Description:</strong> {doc.description}</p>
                    )}
                    <p className="doc-detail"><strong>Encoded ID:</strong> {doc.encodedId.substring(0, 20)}...</p>
                    {doc.verificationStatus !== 'pending' && (
                      <>
                        <p className="doc-detail">
                          <strong>Verified At:</strong> {new Date(doc.verifiedAt).toLocaleDateString()}
                        </p>
                        {doc.verifierComments && (
                          <p className="doc-detail">
                            <strong>Comments:</strong> {doc.verifierComments}
                          </p>
                        )}
                      </>
                    )}
                    <div className="security-tags">
                      <span className="tag">🔐 AES-256 Encrypted</span>
                      <span className="tag">✓ SHA-256 Signed</span>
                    </div>

                    {/* ===== PDF VIEW BUTTON (ONLY FOR PDF UPLOADS) ===== */}
                    {doc.uploadMethod === 'pdf' && (
                      <div style={{ marginTop: '10px' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => viewPdf(doc._id)}
                        >
                          📄 View / Download PDF
                        </button>

                      </div>
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

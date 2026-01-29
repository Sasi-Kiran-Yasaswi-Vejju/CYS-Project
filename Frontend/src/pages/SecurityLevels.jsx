// Security Levels & Risks Page
// Theory page aligned with Hybrid Encryption (AES + RSA)

import React from 'react';
import { Link } from 'react-router-dom';
import './Theory.css';

function SecurityLevels() {
  return (
    <div className="theory-page">
      <header className="theory-header">
        <h1>Security Levels & Risks</h1>
        <p>23CSE313 - Foundations of Cyber Security</p>
        <Link to="/login" className="btn-secondary">Back to Login</Link>
      </header>

      <div className="theory-content">

        {/* ================= SECURITY LEVELS ================= */}
        <section className="theory-section">
          <h2>1. Security Levels Implemented in the System</h2>

          <div className="level-card">
            <h3>Level 1: Authentication (Who are you?)</h3>
            <ul>
              <li><strong>Password Hashing:</strong> bcrypt with salt (10 rounds)</li>
              <li><strong>Multi-Factor Authentication:</strong> Email OTP (6 digits, 5-minute expiry)</li>
              <li><strong>Session Management:</strong> JWT tokens (24-hour expiry)</li>
            </ul>
            <p><strong>Risk Mitigation:</strong> Prevents account compromise even if passwords are leaked</p>
          </div>

          <div className="level-card">
            <h3>Level 2: Authorization (What can you do?)</h3>
            <ul>
              <li><strong>Role-Based Access Control (RBAC)</strong></li>
              <li><strong>Access Control Matrix enforced on backend</strong></li>
            </ul>

            <table className="acm-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Upload</th>
                  <th>View Own</th>
                  <th>Verify</th>
                  <th>View All</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Student</strong></td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>❌</td>
                  <td>❌</td>
                </tr>
                <tr>
                  <td><strong>Officer</strong></td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td><strong>Admin</strong></td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
              </tbody>
            </table>

            <p><strong>Risk Mitigation:</strong> Prevents privilege escalation attacks</p>
          </div>

          <div className="level-card">
            <h3>Level 3: Data Protection (Hybrid Encryption)</h3>
            <ul>
              <li><strong>Symmetric Encryption:</strong> AES-256-CBC (per document)</li>
              <li><strong>Key Generation:</strong> Random AES key generated for every upload</li>
              <li><strong>Key Wrapping:</strong> AES key encrypted using RSA-2048 public key</li>
              <li><strong>Access:</strong> Only Admin / Officer can decrypt AES key using RSA private key</li>
              <li><strong>What is Encrypted:</strong> Document metadata and PDF files</li>
            </ul>
            <p>
              <strong>Risk Mitigation:</strong> Even if database is compromised, attackers cannot decrypt data without RSA private key
            </p>
          </div>

          <div className="level-card">
            <h3>Level 4: Data Integrity (Digital Signature)</h3>
            <ul>
              <li><strong>Algorithm:</strong> SHA-256</li>
              <li><strong>Purpose:</strong> Detect unauthorized modification</li>
              <li><strong>Verification:</strong> Hash recomputed during retrieval</li>
            </ul>
            <p><strong>Risk Mitigation:</strong> Ensures data integrity and tamper detection</p>
          </div>

          <div className="level-card">
            <h3>Level 5: Encoding (Base64)</h3>
            <ul>
              <li><strong>Purpose:</strong> URL-safe document identifiers</li>
              <li><strong>Note:</strong> Encoding ≠ Encryption</li>
            </ul>
            <p><strong>Risk Mitigation:</strong> Prevents malformed URLs and injection issues</p>
          </div>
        </section>

        {/* ================= RISKS ================= */}
        <section className="theory-section">
          <h2>2. Security Risks & Countermeasures</h2>

          <div className="risk-card high">
            <h3>🔴 High Risk: Unauthorized Access</h3>
            <ul>
              <li>bcrypt password hashing</li>
              <li>OTP-based MFA</li>
              <li>JWT expiry and role claims</li>
            </ul>
          </div>

          <div className="risk-card medium">
            <h3>🟠 Medium Risk: Data Breach</h3>
            <ul>
              <li>Hybrid encryption (AES + RSA)</li>
              <li>Encryption keys never stored in plaintext</li>
              <li>Encrypted documents useless without private key</li>
            </ul>
          </div>

          <div className="risk-card medium">
            <h3>🟠 Medium Risk: Privilege Escalation</h3>
            <ul>
              <li>Server-side authorization middleware</li>
              <li>JWT role validation</li>
              <li>Strict access matrix enforcement</li>
            </ul>
          </div>

          <div className="risk-card low">
            <h3>🟢 Low Risk: Session Hijacking</h3>
            <ul>
              <li>JWT expiration</li>
              <li>HTTPS in production</li>
              <li>httpOnly cookies</li>
            </ul>
          </div>
        </section>

        {/* ================= BEST PRACTICES ================= */}
        <section className="theory-section">
          <h2>3. Best Practices Followed</h2>

          <div className="best-practices">
            <div className="practice">
              <h4>✓ Hybrid Encryption Model</h4>
              <p>Combines performance of AES with security of RSA</p>
            </div>
            <div className="practice">
              <h4>✓ Principle of Least Privilege</h4>
              <p>Students cannot decrypt or verify documents</p>
            </div>
            <div className="practice">
              <h4>✓ Defense in Depth</h4>
              <p>Authentication + Authorization + Encryption</p>
            </div>
            <div className="practice">
              <h4>✓ Secure by Design</h4>
              <p>Security enforced at backend, not UI-dependent</p>
            </div>
          </div>
        </section>

        <div className="theory-footer">
          <Link to="/attacks" className="btn-primary">View Possible Attacks →</Link>
          <Link to="/login" className="btn-secondary">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default SecurityLevels;

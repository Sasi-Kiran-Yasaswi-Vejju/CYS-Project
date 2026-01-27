// Security Levels & Risks Page
// Theory page for lab evaluation

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
        <section className="theory-section">
          <h2>1. Security Levels in This System</h2>
          
          <div className="level-card">
            <h3>Level 1: Authentication (Who are you?)</h3>
            <ul>
              <li><strong>Password Hashing:</strong> Bcrypt with salt (10 rounds) - NIST compliant</li>
              <li><strong>Multi-Factor Authentication:</strong> Email-based OTP (6-digit, 5-min expiry)</li>
              <li><strong>Session Management:</strong> JWT tokens (24-hour expiry)</li>
            </ul>
            <p><strong>Risk Mitigation:</strong> Prevents unauthorized access even if passwords are stolen</p>
          </div>

          <div className="level-card">
            <h3>Level 2: Authorization (What can you do?)</h3>
            <ul>
              <li><strong>Role-Based Access Control (RBAC)</strong></li>
              <li><strong>Access Control Matrix:</strong></li>
            </ul>
            <table className="acm-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Upload Docs</th>
                  <th>View Own Docs</th>
                  <th>Verify Docs</th>
                  <th>View All Docs</th>
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
            <p><strong>Risk Mitigation:</strong> Prevents privilege escalation and unauthorized data access</p>
          </div>

          <div className="level-card">
            <h3>Level 3: Data Protection (Encryption)</h3>
            <ul>
              <li><strong>Algorithm:</strong> AES-256-CBC (Advanced Encryption Standard)</li>
              <li><strong>Key Management:</strong> 256-bit encryption key stored in environment variables</li>
              <li><strong>Initialization Vector (IV):</strong> Random 16-byte IV for each encryption</li>
              <li><strong>What's Encrypted:</strong> Document metadata (type, filename, description)</li>
            </ul>
            <p><strong>Risk Mitigation:</strong> Protects confidential data at rest in database</p>
          </div>

          <div className="level-card">
            <h3>Level 4: Data Integrity (Digital Signatures)</h3>
            <ul>
              <li><strong>Algorithm:</strong> SHA-256 (Secure Hash Algorithm)</li>
              <li><strong>Purpose:</strong> Detect tampering with document data</li>
              <li><strong>Verification:</strong> Hash recalculated and compared on retrieval</li>
            </ul>
            <p><strong>Risk Mitigation:</strong> Ensures data hasn't been modified by unauthorized parties</p>
          </div>

          <div className="level-card">
            <h3>Level 5: Encoding (Base64)</h3>
            <ul>
              <li><strong>Purpose:</strong> URL-safe document identifiers</li>
              <li><strong>Note:</strong> Encoding is NOT encryption - it's for data representation</li>
            </ul>
            <p><strong>Risk Mitigation:</strong> Prevents URL injection and special character issues</p>
          </div>
        </section>

        <section className="theory-section">
          <h2>2. Security Risks & Countermeasures</h2>

          <div className="risk-card high">
            <h3>🔴 High Risk: Unauthorized Access</h3>
            <p><strong>Threat:</strong> Attackers gaining access to student/officer accounts</p>
            <p><strong>Countermeasures:</strong></p>
            <ul>
              <li>Password hashing with bcrypt (prevents rainbow table attacks)</li>
              <li>Multi-factor authentication (prevents credential stuffing)</li>
              <li>JWT token expiry (limits session hijacking impact)</li>
            </ul>
          </div>

          <div className="risk-card medium">
            <h3>🟠 Medium Risk: Data Breach</h3>
            <p><strong>Threat:</strong> Database compromise exposes sensitive documents</p>
            <p><strong>Countermeasures:</strong></p>
            <ul>
              <li>AES-256 encryption (data unreadable without decryption key)</li>
              <li>Encryption keys stored separately (not in database)</li>
              <li>Digital signatures detect tampering</li>
            </ul>
          </div>

          <div className="risk-card medium">
            <h3>🟠 Medium Risk: Privilege Escalation</h3>
            <p><strong>Threat:</strong> Student accessing officer functions</p>
            <p><strong>Countermeasures:</strong></p>
            <ul>
              <li>Server-side authorization checks on every API call</li>
              <li>Role verification using JWT token claims</li>
              <li>Access Control Matrix strictly enforced</li>
            </ul>
          </div>

          <div className="risk-card low">
            <h3>🟢 Low Risk: Session Hijacking</h3>
            <p><strong>Threat:</strong> Stolen JWT tokens used maliciously</p>
            <p><strong>Countermeasures:</strong></p>
            <ul>
              <li>24-hour token expiry (limited attack window)</li>
              <li>HTTPS enforcement in production (prevents token interception)</li>
              <li>Token stored in httpOnly cookies (XSS protection)</li>
            </ul>
          </div>
        </section>

        <section className="theory-section">
          <h2>3. Best Practices Implemented</h2>
          <div className="best-practices">
            <div className="practice">
              <h4>✓ Defense in Depth</h4>
              <p>Multiple security layers (authentication, authorization, encryption)</p>
            </div>
            <div className="practice">
              <h4>✓ Principle of Least Privilege</h4>
              <p>Users only have minimum necessary permissions</p>
            </div>
            <div className="practice">
              <h4>✓ Secure by Default</h4>
              <p>All routes require authentication unless explicitly public</p>
            </div>
            <div className="practice">
              <h4>✓ Fail Securely</h4>
              <p>Errors don't reveal sensitive information</p>
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

// Possible Attacks & Countermeasures Page
// Theory page aligned with Hybrid Encryption (AES + RSA)

import React from 'react';
import { Link } from 'react-router-dom';
import './Theory.css';

function AttacksPage() {
  return (
    <div className="theory-page">
      <header className="theory-header">
        <h1>Possible Attacks & Countermeasures</h1>
        <p>23CSE313 - Foundations of Cyber Security</p>
        <Link to="/login" className="btn-secondary">Back to Login</Link>
      </header>

      <div className="theory-content">
        <section className="theory-section">
          <h2>Common Attack Vectors</h2>

          {/* ================= BRUTE FORCE ================= */}
          <div className="attack-card">
            <h3>1. Brute Force Attack</h3>
            <p><strong>Attack:</strong> Attacker attempts multiple password combinations.</p>
            <p><strong>Example:</strong> Automated script testing common passwords.</p>

            <strong>Countermeasures:</strong>
            <ul>
              <li>✓ bcrypt password hashing (computationally expensive)</li>
              <li>✓ Multi-Factor Authentication (OTP)</li>
              <li>✓ Minimum password length enforcement</li>
              <li>✓ Rate limiting (production-ready)</li>
            </ul>

            <p className="risk-level">
              Risk Level: <span className="risk-low">LOW (Mitigated)</span>
            </p>
          </div>

          {/* ================= MITM ================= */}
          <div className="attack-card">
            <h3>2. Man-in-the-Middle (MITM) Attack</h3>
            <p><strong>Attack:</strong> Interception of client–server communication.</p>
            <p><strong>Example:</strong> Packet sniffing on public Wi-Fi.</p>

            <strong>Countermeasures:</strong>
            <ul>
              <li>✓ HTTPS/TLS encryption (production)</li>
              <li>✓ Signed JWT tokens</li>
              <li>✓ Secure cookies (httpOnly, secure flags)</li>
              <li>✓ CORS policy enforcement</li>
            </ul>

            <p className="risk-level">
              Risk Level: <span className="risk-low">LOW</span>
            </p>
          </div>

          {/* ================= INJECTION ================= */}
          <div className="attack-card">
            <h3>3. SQL / NoSQL Injection</h3>
            <p><strong>Attack:</strong> Malicious input manipulates database queries.</p>
            <p><strong>Example:</strong> Injection attempts in login fields.</p>

            <strong>Countermeasures:</strong>
            <ul>
              <li>✓ Mongoose ODM (no raw queries)</li>
              <li>✓ Schema-level type enforcement</li>
              <li>✓ Input validation</li>
              <li>✓ Parameterized queries</li>
            </ul>

            <p className="risk-level">
              Risk Level: <span className="risk-low">LOW</span>
            </p>
          </div>

          {/* ================= REPLAY ================= */}
          <div className="attack-card">
            <h3>4. Replay Attack</h3>
            <p><strong>Attack:</strong> Reusing captured authentication tokens.</p>
            <p><strong>Example:</strong> Reusing old JWT or OTP.</p>

            <strong>Countermeasures:</strong>
            <ul>
              <li>✓ JWT expiration (24 hours)</li>
              <li>✓ OTP expiration (5 minutes)</li>
              <li>✓ OTP single-use enforcement</li>
            </ul>

            <p className="risk-level">
              Risk Level: <span className="risk-low">LOW</span>
            </p>
          </div>

          {/* ================= XSS ================= */}
          <div className="attack-card">
            <h3>5. Cross-Site Scripting (XSS)</h3>
            <p><strong>Attack:</strong> Injecting malicious scripts.</p>
            <p><strong>Example:</strong> Script injection in document description.</p>

            <strong>Countermeasures:</strong>
            <ul>
              <li>✓ React automatic output escaping</li>
              <li>✓ httpOnly cookies (token protection)</li>
              <li>✓ Server-side input sanitization</li>
              <li>✓ Content Security Policy (production)</li>
            </ul>

            <p className="risk-level">
              Risk Level: <span className="risk-low">LOW</span>
            </p>
          </div>

          {/* ================= PRIVILEGE ESC ================= */}
          <div className="attack-card">
            <h3>6. Privilege Escalation</h3>
            <p><strong>Attack:</strong> User attempts unauthorized operations.</p>
            <p><strong>Example:</strong> Student calling officer verification APIs.</p>

            <strong>Countermeasures:</strong>
            <ul>
              <li>✓ Role-based access control (RBAC)</li>
              <li>✓ JWT role claims validation</li>
              <li>✓ Server-side authorization middleware</li>
              <li>✓ Access Control Matrix enforcement</li>
            </ul>

            <p className="risk-level">
              Risk Level: <span className="risk-low">LOW</span>
            </p>
          </div>

          {/* ================= DATA BREACH ================= */}
          <div className="attack-card">
            <h3>7. Data Breach</h3>
            <p><strong>Attack:</strong> Database compromise exposes stored documents.</p>
            <p><strong>Example:</strong> Attacker dumps MongoDB collections.</p>

            <strong>Countermeasures:</strong>
            <ul>
              <li>✓ AES-256 encryption per document</li>
              <li>✓ Random AES key generated per upload</li>
              <li>✓ AES key encrypted using RSA-2048 (key wrapping)</li>
              <li>✓ Private key accessible only to Admin/Officer</li>
            </ul>

            <p className="risk-level">
              Risk Level: <span className="risk-low">LOW (Hybrid encryption)</span>
            </p>
          </div>

          {/* ================= PHISHING ================= */}
          <div className="attack-card">
            <h3>8. Phishing Attack</h3>
            <p><strong>Attack:</strong> Fake emails/websites trick users.</p>
            <p><strong>Example:</strong> Fake placement portal login page.</p>

            <strong>Countermeasures:</strong>
            <ul>
              <li>✓ OTP-based MFA</li>
              <li>✓ Verified sender email</li>
              <li>✓ User education via security pages</li>
              <li>✓ SPF/DKIM (production)</li>
            </ul>

            <p className="risk-level">
              Risk Level: <span className="risk-medium">MEDIUM (User awareness)</span>
            </p>
          </div>
        </section>

        {/* ================= SUMMARY ================= */}
        <section className="theory-section">
          <h2>Security Summary</h2>

          <div className="summary-grid">
            <div className="summary-card">
              <h4>Authentication</h4>
              <p>Password hashing + MFA</p>
            </div>
            <div className="summary-card">
              <h4>Authorization</h4>
              <p>RBAC + Access Control Matrix</p>
            </div>
            <div className="summary-card">
              <h4>Encryption</h4>
              <p>Hybrid AES-256 + RSA-2048</p>
            </div>
            <div className="summary-card">
              <h4>Integrity</h4>
              <p>SHA-256 digital signatures</p>
            </div>
          </div>
        </section>

        <div className="theory-footer">
          <Link to="/security-levels" className="btn-primary">← View Security Levels</Link>
          <Link to="/login" className="btn-secondary">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default AttacksPage;

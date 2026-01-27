// Possible Attacks & Countermeasures Page
// Theory page for lab evaluation

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

          <div className="attack-card">
            <h3>1. Brute Force Attack</h3>
            <p className="attack-description">
              <strong>Attack:</strong> Attacker attempts multiple password combinations to guess credentials.
            </p>
            <div className="attack-example">
              <strong>Example:</strong> Automated script tries 10,000 common passwords against a login form.
            </div>
            <div className="countermeasures">
              <strong>Our Countermeasures:</strong>
              <ul>
                <li>✓ <strong>Password Hashing (bcrypt):</strong> Makes password verification slow (~100ms per attempt)</li>
                <li>✓ <strong>Multi-Factor Authentication:</strong> Even if password is guessed, OTP is required</li>
                <li>✓ <strong>Minimum Password Length:</strong> 6 characters enforced</li>
                <li>✓ <strong>Rate Limiting (Production):</strong> Limit login attempts per IP address</li>
              </ul>
            </div>
            <p className="risk-level">Risk Level: <span className="risk-low">LOW (Mitigated)</span></p>
          </div>

          <div className="attack-card">
            <h3>2. Man-in-the-Middle (MITM) Attack</h3>
            <p className="attack-description">
              <strong>Attack:</strong> Attacker intercepts communication between client and server to steal data.
            </p>
            <div className="attack-example">
              <strong>Example:</strong> Public WiFi packet sniffing to capture JWT tokens or passwords.
            </div>
            <div className="countermeasures">
              <strong>Our Countermeasures:</strong>
              <ul>
                <li>✓ <strong>HTTPS/TLS:</strong> All data encrypted in transit (production requirement)</li>
                <li>✓ <strong>JWT Tokens:</strong> Tokens signed and verified - cannot be forged</li>
                <li>✓ <strong>CORS Policy:</strong> Prevents unauthorized origins from making requests</li>
                <li>✓ <strong>Secure Cookies (Production):</strong> httpOnly and secure flags</li>
              </ul>
            </div>
            <p className="risk-level">Risk Level: <span className="risk-low">LOW (Production requires HTTPS)</span></p>
          </div>

          <div className="attack-card">
            <h3>3. SQL/NoSQL Injection</h3>
            <p className="attack-description">
              <strong>Attack:</strong> Malicious input manipulates database queries to access unauthorized data.
            </p>
            <div className="attack-example">
              <strong>Example:</strong> Email input: <code>admin@test.com' OR '1'='1</code> attempts to bypass authentication.
            </div>
            <div className="countermeasures">
              <strong>Our Countermeasures:</strong>
              <ul>
                <li>✓ <strong>Mongoose ODM:</strong> Parameterized queries prevent injection</li>
                <li>✓ <strong>Input Validation:</strong> Email, password formats validated</li>
                <li>✓ <strong>Type Checking:</strong> MongoDB schema enforces data types</li>
                <li>✓ <strong>No Raw Queries:</strong> All database access through Mongoose models</li>
              </ul>
            </div>
            <p className="risk-level">Risk Level: <span className="risk-low">LOW (Framework protection)</span></p>
          </div>

          <div className="attack-card">
            <h3>4. Replay Attack</h3>
            <p className="attack-description">
              <strong>Attack:</strong> Attacker captures and reuses valid authentication tokens or OTPs.
            </p>
            <div className="attack-example">
              <strong>Example:</strong> Intercepted JWT token used days later to impersonate user.
            </div>
            <div className="countermeasures">
              <strong>Our Countermeasures:</strong>
              <ul>
                <li>✓ <strong>JWT Expiry:</strong> Tokens expire after 24 hours</li>
                <li>✓ <strong>OTP Expiry:</strong> OTP valid for only 5 minutes</li>
                <li>✓ <strong>OTP Single-Use:</strong> OTP cleared from database after verification</li>
                <li>✓ <strong>Timestamp Validation:</strong> Token 'exp' claim verified</li>
              </ul>
            </div>
            <p className="risk-level">Risk Level: <span className="risk-low">LOW (Time-limited tokens)</span></p>
          </div>

          <div className="attack-card">
            <h3>5. Cross-Site Scripting (XSS)</h3>
            <p className="attack-description">
              <strong>Attack:</strong> Malicious scripts injected into web application to steal data or sessions.
            </p>
            <div className="attack-example">
              <strong>Example:</strong> Document description contains: <code>&lt;script&gt;stealCookies()&lt;/script&gt;</code>
            </div>
            <div className="countermeasures">
              <strong>Our Countermeasures:</strong>
              <ul>
                <li>✓ <strong>React Auto-Escaping:</strong> JSX automatically escapes user input</li>
                <li>✓ <strong>Content Security Policy (Production):</strong> Restricts script sources</li>
                <li>✓ <strong>httpOnly Cookies:</strong> JavaScript cannot access auth tokens</li>
                <li>✓ <strong>Input Sanitization:</strong> Server-side validation of all inputs</li>
              </ul>
            </div>
            <p className="risk-level">Risk Level: <span className="risk-low">LOW (Framework protection)</span></p>
          </div>

          <div className="attack-card">
            <h3>6. Privilege Escalation</h3>
            <p className="attack-description">
              <strong>Attack:</strong> User attempts to access functions beyond their authorized role.
            </p>
            <div className="attack-example">
              <strong>Example:</strong> Student modifies API request to verify documents (officer-only function).
            </div>
            <div className="countermeasures">
              <strong>Our Countermeasures:</strong>
              <ul>
                <li>✓ <strong>Server-Side Authorization:</strong> Every API endpoint checks user role</li>
                <li>✓ <strong>JWT Role Claims:</strong> User role embedded in signed token</li>
                <li>✓ <strong>Access Control Matrix:</strong> Permissions checked against ACM</li>
                <li>✓ <strong>No Client-Side Trust:</strong> Frontend restrictions are cosmetic only</li>
              </ul>
            </div>
            <p className="risk-level">Risk Level: <span className="risk-low">LOW (Strict enforcement)</span></p>
          </div>

          <div className="attack-card">
            <h3>7. Rainbow Table Attack</h3>
            <p className="attack-description">
              <strong>Attack:</strong> Pre-computed hash tables used to reverse password hashes.
            </p>
            <div className="attack-example">
              <strong>Example:</strong> Database breach exposes password hashes; attacker uses rainbow table to crack them.
            </div>
            <div className="countermeasures">
              <strong>Our Countermeasures:</strong>
              <ul>
                <li>✓ <strong>Salted Hashing:</strong> Bcrypt adds unique random salt to each password</li>
                <li>✓ <strong>10 Salt Rounds:</strong> Computationally expensive (2^10 iterations)</li>
                <li>✓ <strong>Unique Salt per User:</strong> Rainbow tables become ineffective</li>
                <li>✓ <strong>No Password Storage:</strong> Only hash stored in database</li>
              </ul>
            </div>
            <p className="risk-level">Risk Level: <span className="risk-low">LOW (Salt protection)</span></p>
          </div>

          <div className="attack-card">
            <h3>8. Phishing Attack</h3>
            <p className="attack-description">
              <strong>Attack:</strong> Fake emails/websites trick users into revealing credentials.
            </p>
            <div className="attack-example">
              <strong>Example:</strong> Fake email claims "Verify your placement documents" with link to fake login page.
            </div>
            <div className="countermeasures">
              <strong>Our Countermeasures:</strong>
              <ul>
                <li>✓ <strong>MFA Protection:</strong> Even stolen password needs OTP</li>
                <li>✓ <strong>OTP Email Verification:</strong> User sees legitimate email sender</li>
                <li>✓ <strong>User Education:</strong> Security info pages explain risks</li>
                <li>✓ <strong>Domain Verification (Production):</strong> SPF/DKIM email authentication</li>
              </ul>
            </div>
            <p className="risk-level">Risk Level: <span className="risk-medium">MEDIUM (User awareness needed)</span></p>
          </div>
        </section>

        <section className="theory-section">
          <h2>Security Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <h4>Authentication Layer</h4>
              <p>Bcrypt hashing + MFA protects against credential attacks</p>
            </div>
            <div className="summary-card">
              <h4>Authorization Layer</h4>
              <p>RBAC + ACM prevents privilege escalation</p>
            </div>
            <div className="summary-card">
              <h4>Encryption Layer</h4>
              <p>AES-256 protects data at rest from breaches</p>
            </div>
            <div className="summary-card">
              <h4>Integrity Layer</h4>
              <p>SHA-256 signatures detect tampering</p>
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

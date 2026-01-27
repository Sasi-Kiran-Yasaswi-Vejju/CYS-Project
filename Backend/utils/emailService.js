// Email Service using Nodemailer
// Demonstrates: Multi-Factor Authentication (Email OTP), Security Notifications

console.log("📧 EMAIL USER:", process.env.EMAIL_USER);
console.log("📧 EMAIL PASS EXISTS:", !!process.env.EMAIL_PASS);

const nodemailer = require('nodemailer');

// ============================================
// NODEMAILER TRANSPORTER CONFIGURATION
// ============================================

// Create reusable transporter object using SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // Using Gmail SMTP
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Use App Password, not regular password
    }
  });
};

// ============================================
// SEND OTP EMAIL (Multi-Factor Authentication)
// ============================================

const sendOTPEmail = async (email, name, otp) => {
  try {
    const transporter = createTransporter();

    // 🔐 VERIFY TRANSPORTER (IMPORTANT – catches Gmail auth issues)
    await transporter.verify();

    const mailOptions = {
      // ✅ Proper "from" format required by Gmail
      from: `"Placement Verification Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 OTP for Secure Login - Placement Verification Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Placement Document Verification Portal</h2>
          <h3>Multi-Factor Authentication</h3>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your One-Time Password (OTP) for secure login is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2c3e50; border-radius: 5px;">
            ${otp}
          </div>
          <p style="color: #e74c3c; margin-top: 20px;">
            ⚠️ <strong>Security Notice:</strong>
          </p>
          <ul style="color: #555;">
            <li>This OTP is valid for ${process.env.OTP_EXPIRY || 5} minutes only</li>
            <li>Never share this OTP with anyone</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            This is an automated email from the Placement Verification Portal.<br>
            23CSE313 - Foundations of Cyber Security Lab Project
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Email sending failed (OTP):', error);
    throw new Error('Failed to send OTP email');
  }
};

// ============================================
// SEND VERIFICATION STATUS EMAIL
// ============================================

const sendVerificationStatusEmail = async (email, name, documentType, status, comments) => {
  try {
    const transporter = createTransporter();

    // 🔐 VERIFY TRANSPORTER
    await transporter.verify();

    const statusColor = status === 'verified' ? '#27ae60' : '#e74c3c';
    const statusText = status === 'verified' ? 'VERIFIED ✓' : 'REJECTED ✗';

    const mailOptions = {
      from: `"Placement Verification Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Document Verification Status: ${documentType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Placement Document Verification Portal</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your document has been reviewed:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Document Type:</strong> ${documentType}</p>
            <p><strong>Status:</strong> 
              <span style="color: ${statusColor}; font-weight: bold;">
                ${statusText}
              </span>
            </p>
            ${comments ? `<p><strong>Verifier Comments:</strong> ${comments}</p>` : ''}
          </div>
          
          <p>You can view the full details by logging into your dashboard.</p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            This is an automated email from the Placement Verification Portal.<br>
            23CSE313 - Foundations of Cyber Security Lab Project
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification status email sent:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Email sending failed (Verification):', error);
    return false; // verification should not fail even if email fails
  }
};

// ============================================
// SEND WELCOME EMAIL
// ============================================

const sendWelcomeEmail = async (email, name, role) => {
  try {
    const transporter = createTransporter();

    // 🔐 VERIFY TRANSPORTER
    transporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP VERIFY FAILED:', error);
    } else {
      console.log('✅ SMTP SERVER READY');
    }
    });


    const mailOptions = {
      from: `"Placement Verification Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to Placement Verification Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Welcome to Placement Document Verification Portal</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your account has been successfully created!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Role:</strong> ${role.toUpperCase()}</p>
          </div>
          
          <h3>🔒 Security Features Enabled:</h3>
          <ul>
            <li>✅ Password Hashing (bcrypt with salt)</li>
            <li>✅ Multi-Factor Authentication (Email OTP)</li>
            <li>✅ JWT-based Session Management</li>
            <li>✅ Role-based Access Control</li>
            <li>✅ Data Encryption (AES-256)</li>
          </ul>
          
          <p>Please login to access your dashboard.</p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            23CSE313 - Foundations of Cyber Security Lab Project
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent');
    return true;

  } catch (error) {
    console.error('❌ Welcome email failed:', error);
    return false;
  }
};

// ============================================
// EXPORT FUNCTIONS
// ============================================

module.exports = {
  sendOTPEmail,
  sendVerificationStatusEmail,
  sendWelcomeEmail
};

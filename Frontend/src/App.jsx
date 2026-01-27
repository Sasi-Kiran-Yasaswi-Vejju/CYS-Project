// Main App Component with Routing
// Demonstrates: Client-side routing for different user roles

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';
import StudentDashboard from './pages/StudentDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import SecurityLevels from './pages/SecurityLevels';
import AttacksPage from './pages/AttacksPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (loading) return <div className="loading">Loading...</div>;
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/" />} 
          />
          <Route 
            path="/verify-otp" 
            element={!user ? <OTPVerification setUser={setUser} /> : <Navigate to="/" />} 
          />

          {/* Theory Pages (Public) */}
          <Route path="/security-levels" element={<SecurityLevels />} />
          <Route path="/attacks" element={<AttacksPage />} />

          {/* Protected Routes - Role-based Dashboards */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                {user?.role === 'student' ? (
                  <StudentDashboard user={user} onLogout={handleLogout} />
                ) : (
                  <OfficerDashboard user={user} onLogout={handleLogout} />
                )}
              </ProtectedRoute>
            } 
          />

          {/* Student Dashboard */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />

          {/* Officer/Admin Dashboard */}
          <Route 
            path="/officer" 
            element={
              <ProtectedRoute allowedRoles={['officer', 'admin']}>
                <OfficerDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

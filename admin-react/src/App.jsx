import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DashboardEnhanced from './components/DashboardEnhanced';
import DashboardFixed from './components/DashboardFixed';
import Users from './components/Users';
import UsersEnhanced from './components/UsersEnhanced';
import Notes from './components/Notes';
import NotesEnhanced from './components/NotesEnhanced';
import Payments from './components/Payments';
import PaymentsEnhanced from './components/PaymentsEnhanced';
import Upload from './components/Upload';
import TestComponent from './components/TestComponent';
import Sidebar from './components/Sidebar';
import FireParticles from './components/FireParticles';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already authenticated
    const apiKey = localStorage.getItem('admin_api_key');
    if (apiKey === 'masterstudent_admin_2024_secure_key') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (apiKey) => {
    if (apiKey === 'masterstudent_admin_2024_secure_key') {
      localStorage.setItem('admin_api_key', apiKey);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_api_key');
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <FireParticles />
        <div className="loading-content">
          <div className="fire-logo">🔥</div>
          <h2>MasterStudent Admin</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <FireParticles />
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app">
      <FireParticles />
      <div className="admin-layout">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          onLogout={handleLogout}
        />
        <div className="main-content">
          {/* Top Header Bar */}
          <div className="top-header">
            <div className="header-left">
              <div className="page-title-container">
                <div className="page-icon">
                  {currentPage === 'dashboard' && <div className="icon-dashboard"></div>}
                  {currentPage === 'users' && <div className="icon-users"></div>}
                  {currentPage === 'notes' && <div className="icon-notes"></div>}
                  {currentPage === 'payments' && <div className="icon-payments"></div>}
                  {currentPage === 'upload' && <div className="icon-upload"></div>}
                </div>
                <div className="title-text">
                  <h1 className="page-title">
                    {currentPage === 'dashboard' && 'Dashboard'}
                    {currentPage === 'users' && 'Users Management'}
                    {currentPage === 'notes' && 'Notes Management'}
                    {currentPage === 'payments' && 'Payments'}
                    {currentPage === 'upload' && 'Upload'}
                  </h1>
                  <p className="page-subtitle">
                    {currentPage === 'dashboard' && 'Platform Overview & Analytics'}
                    {currentPage === 'users' && 'Manage Registered Users & Permissions'}
                    {currentPage === 'notes' && 'Review & Approve Student Submissions'}
                    {currentPage === 'payments' && 'Track Payment Transactions & Revenue'}
                    {currentPage === 'upload' && 'Upload New Content & Resources'}
                  </p>
                </div>
              </div>
            </div>
            <div className="header-right">
              <div className="admin-controls">
                <div className="notification-bell">
                  <div className="bell-icon"></div>
                  <span className="notification-badge">3</span>
                </div>
                <div className="admin-info">
                  <div className="admin-avatar">
                    <div className="avatar-gradient"></div>
                    <span className="avatar-text">A</span>
                  </div>
                  <div className="admin-details">
                    <span className="admin-name">Administrator</span>
                    <span className="admin-role">Super Admin</span>
                  </div>
                  <div className="admin-dropdown">
                    <div className="dropdown-arrow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="content-wrapper">
            <div className="content-container">
              {currentPage === 'dashboard' && <DashboardFixed />}
              {currentPage === 'users' && <Users />}
              {currentPage === 'notes' && <Notes />}
              {currentPage === 'payments' && <Payments />}
              {currentPage === 'upload' && <Upload />}
              {currentPage === 'test' && <TestComponent />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

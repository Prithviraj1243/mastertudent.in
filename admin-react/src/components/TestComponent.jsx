import React, { useState, useEffect } from 'react';

const TestComponent = () => {
  const [status, setStatus] = useState('Testing...');
  const [apiStatus, setApiStatus] = useState('Checking...');

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:3001/admin/notes', {
        headers: {
          'x-api-key': 'masterstudent_admin_2024_secure_key'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiStatus(`✅ API Working - ${data.count || 0} notes found`);
        setStatus('✅ All systems operational');
      } else {
        setApiStatus('❌ API Error: ' + response.status);
        setStatus('❌ API connection failed');
      }
    } catch (error) {
      setApiStatus('❌ Network Error: ' + error.message);
      setStatus('❌ Connection failed');
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      background: '#1a1a1a', 
      color: '#fff', 
      borderRadius: '8px',
      margin: '1rem'
    }}>
      <h2>🔧 System Status Test</h2>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Overall Status:</strong> {status}
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>API Status:</strong> {apiStatus}
      </div>
      <button 
        onClick={testAPI}
        style={{
          padding: '0.5rem 1rem',
          background: '#ff6b35',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔄 Test Again
      </button>
    </div>
  );
};

export default TestComponent;

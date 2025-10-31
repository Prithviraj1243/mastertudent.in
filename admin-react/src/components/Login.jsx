import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate loading for effect
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = onLogin(apiKey);
    if (!success) {
      setError('Invalid API Key. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in-up">
        <div className="login-header">
          <div className="login-logo">🔥</div>
          <h1 className="login-title">MasterStudent Admin</h1>
          <p className="login-subtitle">Firebase & Cloudinary Powered</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Admin API Key</label>
            <input
              type="password"
              className="form-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your admin API key"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner-small"></div>
                Authenticating...
              </>
            ) : (
              <>
                <span className="login-icon">🚀</span>
                Access Admin Panel
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="login-hint">
            <p>💡 <strong>Hint:</strong> masterstudent_admin_2024_secure_key</p>
          </div>
          <div className="login-features">
            <div className="feature">
              <span className="feature-icon">🔥</span>
              <span>Firebase Integration</span>
            </div>
            <div className="feature">
              <span className="feature-icon">☁️</span>
              <span>25GB Cloudinary Storage</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔐</span>
              <span>Secure API Authentication</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
          position: relative;
          z-index: 10;
        }

        .login-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border: 1px solid #333;
          border-radius: 20px;
          padding: 3rem;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff6b35 0%, #ff4757 100%);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: fireGlow 2s infinite alternate;
        }

        .login-title {
          font-size: 2rem;
          font-weight: 700;
          color: #ff6b35;
          text-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
          margin-bottom: 0.5rem;
        }

        .login-subtitle {
          color: #888;
          font-size: 1rem;
        }

        .login-form {
          margin-bottom: 2rem;
        }

        .login-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-icon {
          font-size: 1.2rem;
        }

        .loading-spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .error-message {
          background: rgba(255, 71, 87, 0.1);
          border: 1px solid #ff4757;
          color: #ff6348;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .error-icon {
          font-size: 1.2rem;
        }

        .login-footer {
          border-top: 1px solid #333;
          padding-top: 2rem;
        }

        .login-hint {
          background: rgba(255, 165, 2, 0.1);
          border: 1px solid #ffa502;
          color: #ffa502;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .login-features {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #888;
          font-size: 0.9rem;
        }

        .feature-icon {
          font-size: 1rem;
        }

        @media (max-width: 600px) {
          .login-card {
            padding: 2rem;
            margin: 1rem;
          }
          
          .login-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;

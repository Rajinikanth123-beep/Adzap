import React, { useState } from 'react';

export default function LoginPage({ onLogin, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (onLogin(email, password)) {
      setEmail('');
      setPassword('');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Admin/Judge Login</h1>
        <p className="login-subtitle">Access staff dashboards</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn btn-submit">
            Login
          </button>

          <div className="login-footer">
            <p>
              Participant?{' '}
              <button
                type="button"
                onClick={() => onNavigate('participant-login')}
                className="link-btn"
              >
                Go to participant login
              </button>
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="link-btn"
              >
                Back to Home
              </button>
            </p>
          </div>
        </form>
      </div>

      <style>{`
        .login-page {
          animation: fadeIn 0.6s ease-out;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
        }

        .login-container {
          width: 100%;
          max-width: 500px;
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.8) 0%, rgba(20, 30, 60, 0.6) 100%);
          border: 2px solid rgba(34, 211, 238, 0.3);
          border-radius: 12px;
          padding: 2.5rem;
        }

        .login-title {
          font-size: 2rem;
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center;
          margin-bottom: 0.5rem;
          font-weight: 800;
        }

        .login-subtitle {
          text-align: center;
          color: #8a92a1;
          margin-bottom: 1.5rem;
        }

        .login-roles {
          background: rgba(34, 211, 238, 0.05);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .roles-title {
          color: #22d3ee;
          margin-bottom: 1rem;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .role-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .role-card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(34, 211, 238, 0.2);
          border-radius: 6px;
          padding: 1rem;
          font-size: 0.85rem;
        }

        .role-card strong {
          color: #22d3ee;
          display: block;
          margin-bottom: 0.5rem;
        }

        .role-card p {
          color: #a0aab9;
          margin: 0.3rem 0;
          font-family: monospace;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          color: #22d3ee;
          margin-bottom: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .error-message {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
          border: 2px solid rgba(239, 68, 68, 0.4);
          border-left-color: #ef4444;
          color: #fca5a5;
          padding: 1rem;
          border-radius: 6px;
          font-weight: 600;
          animation: slideIn 0.4s ease-out;
        }

        .btn-submit {
          width: 100%;
        }

        .login-footer {
          text-align: center;
          color: #8a92a1;
        }

        .link-btn {
          background: none;
          border: none;
          color: #22d3ee;
          cursor: pointer;
          font-weight: 600;
          text-decoration: underline;
          transition: color 0.3s ease;
        }

        .link-btn:hover {
          color: #06b6d4;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 600px) {
          .login-container {
            padding: 1.5rem;
          }

          .login-title {
            font-size: 1.5rem;
          }

          .role-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

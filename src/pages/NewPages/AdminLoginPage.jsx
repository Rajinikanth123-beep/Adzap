import React, { useState } from 'react';

export default function AdminLoginPage({ onLogin, onNavigate, registrationsClosed = false, showDefaultLogin = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const isValid = await Promise.resolve(onLogin(email, password));
    if (isValid) {
      setEmail('');
      setPassword('');
      return;
    }
    setError('Invalid admin email or password');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">Login to the admin dashboard</p>

        {showDefaultLogin && (
          <div className="login-roles">
            <p className="roles-title">Default Admin:</p>
            <div className="role-card">
              <p>admin@adzap.com</p>
              <p>admin123</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
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
              placeholder="Enter password"
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn btn-submit">Login as Admin</button>

          <div className="login-footer">
            {!registrationsClosed ? (
              <p>
                New admin?{' '}
                <button type="button" onClick={() => onNavigate('admin-register')} className="link-btn">
                  Register here
                </button>
              </p>
            ) : (
              <p>Admin registrations are closed (max 6 reached).</p>
            )}
            <p style={{ marginTop: '0.5rem' }}>
              Judge?{' '}
              <button type="button" onClick={() => onNavigate('judge-login')} className="link-btn">
                Go to judge login
              </button>
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <button type="button" onClick={() => onNavigate('home')} className="link-btn">
                Back to Home
              </button>
            </p>
          </div>
        </form>
      </div>

      <style>{`
        .login-page { animation: fadeIn 0.6s ease-out; display: flex; align-items: center; justify-content: center; min-height: 80vh; }
        .login-container { width: 100%; max-width: 500px; background: linear-gradient(135deg, rgba(10, 15, 35, 0.8) 0%, rgba(20, 30, 60, 0.6) 100%); border: 2px solid rgba(34, 211, 238, 0.3); border-radius: 12px; padding: 2.5rem; }
        .login-title { font-size: 2rem; background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-align: center; margin-bottom: 0.5rem; font-weight: 800; }
        .login-subtitle { text-align: center; color: #8a92a1; margin-bottom: 1.5rem; }
        .login-roles { background: rgba(34, 211, 238, 0.05); border: 2px solid rgba(34, 211, 238, 0.2); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
        .roles-title { color: #22d3ee; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; }
        .role-card { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(34, 211, 238, 0.2); border-radius: 6px; padding: 0.8rem; font-size: 0.85rem; }
        .role-card p { color: #a0aab9; margin: 0.2rem 0; font-family: monospace; }
        .login-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { color: #22d3ee; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .error-message { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%); border: 2px solid rgba(239, 68, 68, 0.4); color: #fca5a5; padding: 1rem; border-radius: 6px; font-weight: 600; }
        .btn-submit { width: 100%; }
        .login-footer { text-align: center; color: #8a92a1; }
        .link-btn { background: none; border: none; color: #22d3ee; cursor: pointer; font-weight: 600; text-decoration: underline; }
        .link-btn:hover { color: #06b6d4; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

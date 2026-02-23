import React, { useState } from 'react';

export default function JudgeRegisterPage({ onRegister, onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = onRegister(formData);
    const success = typeof result === 'boolean' ? result : result?.success;
    const message = typeof result === 'boolean' ? 'Judge with this email already exists' : result?.message;

    if (!success) {
      setError(message || 'Judge registration failed');
      return;
    }
    alert('Judge registration successful. Please login.');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Judge Registration</h1>
        <p className="login-subtitle">Create a separate judge account</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Judge Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter judge name"
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="judge@example.com"
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password"
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn btn-submit">Register Judge</button>

          <div className="login-footer">
            <button type="button" onClick={() => onNavigate('judge-login')} className="link-btn">
              Already registered? Judge login
            </button>
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

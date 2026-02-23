import React, { useState } from 'react';

export default function ParticipantDashboard({ user, teams, onNavigate, onUploadPoster }) {
  const userTeam = user ? teams.find(t => t.id === (user.teamId || user.id)) : null;
  const [posterPreview, setPosterPreview] = useState(userTeam?.poster || null);

  if (!userTeam) {
    return (
      <div className="participant-dashboard">
        <div className="no-team-message">
          <h2>No Team Found</h2>
          <p>Please register a team first to access the dashboard.</p>
          <button className="cta-button" onClick={() => onNavigate('participant-register')}>
            Register Team
          </button>
        </div>
      </div>
    );
  }

  const round1Selected = userTeam.round1?.selected || false;
  const round2Selection = userTeam.round2?.selected || false;

  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const posterData = event.target.result;
        setPosterPreview(posterData);
        // Save to parent state for persistence
        if (onUploadPoster) {
          onUploadPoster(userTeam.id, posterData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="participant-dashboard">
      <h1>Team Dashboard</h1>

      {/* Team Info Card */}
      <div className="team-info-card">
        <div className="team-header">
          <h2>{userTeam.teamName}</h2>
          <span className="product-badge">{userTeam.productName}</span>
        </div>
        <div className="team-details">
          <div className="detail-item">
            <label>Team Number:</label>
            <span className="detail-value">#{userTeam.teamNumber || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>Email:</label>
            <span className="detail-value">{userTeam.email}</span>
          </div>
          <div className="detail-item">
            <label>Members:</label>
            <span className="detail-value">{userTeam.members?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="progress-section">
        <h3>Competition Progress</h3>
        <div className="progress-container">
          {/* Round 1 */}
          <div className={`progress-step ${round1Selected ? 'completed' : 'pending'}`}>
            <div className="step-icon">
              {round1Selected ? '✓' : '1'}
            </div>
            <div className="step-content">
              <h4>Round 1: Presentation</h4>
              <p className="step-status">
                {round1Selected ? 'Selected' : 'Not Selected'}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="progress-arrow">→</div>

          {/* Round 2 */}
          <div className={`progress-step ${round2Selection ? 'completed' : round1Selected ? 'active' : 'disabled'}`}>
            <div className="step-icon">
              {round2Selection ? '✓' : '2'}
            </div>
            <div className="step-content">
              <h4>Round 2: Finals</h4>
              <p className="step-status">
                {round2Selection ? 'Selected' : 'Not Selected'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="members-section">
        <h3>Team Members ({userTeam.members?.length || 0})</h3>
        <div className="members-grid">
          {userTeam.members?.map((member, idx) => (
            <div key={idx} className="member-card">
              <div className="member-icon">👤</div>
              <h4>{member.name}</h4>
              <div className="member-info">
                <p>
                  <a href={`tel:${member.phone}`} className="info-link">
                    📱 {member.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${member.email}`} className="info-link">
                    ✉️ {member.email}
                  </a>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Poster Upload Section */}
      {round1Selected && (
        <div className="poster-section">
          <h3>Project Poster / Documentation</h3>
          <div className="upload-container">
            {posterPreview ? (
              <div className="poster-preview">
                <img src={posterPreview} alt="Poster Preview" />
                <button
                  className="upload-btn remove"
                  onClick={() => setPosterPreview(null)}
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="upload-label">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handlePosterUpload}
                  style={{ display: 'none' }}
                />
                <div className="upload-box">
                  <p className="upload-icon">📄</p>
                  <p className="upload-text">Click to upload poster or documentation</p>
                  <p className="upload-hint">PNG, JPG, or PDF (Max 5MB)</p>
                </div>
              </label>
            )}
          </div>
          <p className="upload-note">
            💡 Upload your project poster or documentation for judges' reference during Round 2.
          </p>
        </div>
      )}

      {/* Quick Links */}
      <div className="quick-links">
        <button
          className="link-btn"
          onClick={() => onNavigate('home')}
        >
          ← Back to Home
        </button>
      </div>

      <style>{`
        .participant-dashboard {
          animation: fadeIn 0.6s ease-out;
        }

        .no-team-message {
          text-align: center;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.7) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 12px;
          margin: 2rem 0;
        }

        .no-team-message h2 {
          color: #22d3ee;
          margin-bottom: 1rem;
        }

        .no-team-message p {
          color: #a0aab9;
          margin-bottom: 2rem;
        }

        .participant-dashboard h1 {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 2rem;
          text-align: center;
        }

        .team-info-card {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .team-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .team-header h2 {
          color: #22d3ee;
          font-size: 1.8rem;
          margin: 0;
        }

        .product-badge {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }

        .team-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-item label {
          color: #8a92a1;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .detail-value {
          color: #22d3ee;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .progress-section {
          margin-bottom: 2rem;
        }

        .progress-section h3 {
          color: #22d3ee;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          min-width: 250px;
          padding: 1rem;
          border-radius: 8px;
          border: 2px solid rgba(34, 211, 238, 0.1);
          background: rgba(34, 211, 238, 0.05);
          transition: all 0.3s ease;
        }

        .progress-step.completed {
          border-color: rgba(34, 197, 94, 0.4);
          background: rgba(34, 197, 94, 0.1);
        }

        .progress-step.active {
          border-color: rgba(34, 211, 238, 0.4);
          background: rgba(34, 211, 238, 0.1);
        }

        .progress-step.disabled {
          opacity: 0.5;
          border-color: rgba(139, 146, 161, 0.2);
          background: rgba(139, 146, 161, 0.05);
        }

        .step-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: #fff;
          font-weight: 700;
          font-size: 1.2rem;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }

        .progress-step.completed .step-icon {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .progress-step.disabled .step-icon {
          background: rgba(139, 146, 161, 0.3);
          box-shadow: none;
        }

        .step-content h4 {
          color: #22d3ee;
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }

        .step-content p {
          margin: 0.25rem 0;
          font-size: 0.9rem;
        }

        .step-status {
          color: #a0aab9;
        }

        .progress-arrow {
          font-size: 1.5rem;
          color: #22d3ee;
          opacity: 0.5;
          flex-shrink: 0;
        }

        .members-section,
        .poster-section {
          margin-bottom: 2rem;
        }

        .members-section h3,
        .poster-section h3 {
          color: #22d3ee;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
        }

        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .member-card {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.7) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .member-card:hover {
          border-color: #22d3ee;
          box-shadow: 0 8px 20px rgba(34, 211, 238, 0.2);
          transform: translateY(-4px);
        }

        .member-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .member-card h4 {
          color: #22d3ee;
          margin: 0.5rem 0;
        }

        .member-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .member-info p {
          margin: 0;
          font-size: 0.9rem;
        }

        .info-link {
          color: #06b6d4;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .info-link:hover {
          color: #22d3ee;
          text-decoration: underline;
        }

        .upload-container {
          margin-bottom: 1rem;
        }

        .upload-label {
          cursor: pointer;
        }

        .upload-box {
          border: 2px dashed rgba(34, 211, 238, 0.3);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          background: rgba(34, 211, 238, 0.05);
          transition: all 0.3s ease;
        }

        .upload-label:hover .upload-box {
          border-color: #22d3ee;
          background: rgba(34, 211, 238, 0.1);
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .upload-text {
          color: #22d3ee;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .upload-hint {
          color: #8a92a1;
          font-size: 0.9rem;
          margin: 0;
        }

        .poster-preview {
          position: relative;
          display: inline-block;
          width: 100%;
          max-width: 300px;
          text-align: center;
        }

        .poster-preview img {
          width: 100%;
          border-radius: 8px;
          border: 2px solid rgba(34, 211, 238, 0.3);
        }

        .upload-btn {
          margin-top: 1rem;
          padding: 0.6rem 1.2rem;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          border: none;
          color: #fff;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-btn:hover {
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
          transform: translateY(-2px);
        }

        .upload-btn.remove {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .upload-note {
          color: #8a92a1;
          font-size: 0.9rem;
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(250, 204, 21, 0.1);
          border-left: 3px solid #fcd34d;
          border-radius: 4px;
        }

        .quick-links {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .link-btn {
          padding: 0.7rem 1.5rem;
          background: transparent;
          border: 2px solid rgba(34, 211, 238, 0.3);
          color: #22d3ee;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .link-btn:hover {
          border-color: #22d3ee;
          box-shadow: 0 4px 12px rgba(34, 211, 238, 0.3);
          transform: translateY(-2px);
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

        @media (max-width: 768px) {
          .participant-dashboard h1 {
            font-size: 1.8rem;
          }

          .team-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .team-header h2 {
            font-size: 1.5rem;
          }

          .progress-container {
            flex-direction: column;
            gap: 0;
          }

          .progress-step {
            width: 100%;
            min-width: auto;
            border-radius: 0;
            border-top: none;
            border-bottom: 2px solid rgba(34, 211, 238, 0.1);
          }

          .progress-step:first-child {
            border-radius: 8px 8px 0 0;
          }

          .progress-step:last-child {
            border-radius: 0 0 8px 8px;
            border-bottom: 2px solid rgba(34, 211, 238, 0.1);
          }

          .progress-arrow {
            display: none;
          }

          .members-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}

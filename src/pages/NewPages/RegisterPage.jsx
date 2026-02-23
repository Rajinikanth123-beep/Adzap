import React, { useState } from 'react';

export default function RegisterPage({ onRegister, onNavigate }) {
  const [formData, setFormData] = useState({
    teamName: '',
    teamNumber: '',
    email: '',
    password: '',
    productName: '',
    members: [{ name: '', phone: '', email: '' }],
    poster: null,
  });
  const [posterPreview, setPosterPreview] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const posterData = event.target.result;
        setPosterPreview(posterData);
        setFormData(prev => ({ ...prev, poster: posterData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePoster = () => {
    setPosterPreview(null);
    setFormData(prev => ({ ...prev, poster: null }));
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...formData.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData(prev => ({ ...prev, members: newMembers }));
  };

  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { name: '', phone: '', email: '' }],
    }));
  };

  const removeMember = (index) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      if (formData.teamName && formData.email && formData.password) {
        const result = await Promise.resolve(onRegister(formData));
        if (result?.success === false) {
          setSubmitError(result.message || 'Registration failed');
          return;
        }
        alert('Registration successful! Please login.');
      }
    } catch (_error) {
      setSubmitError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1 className="register-title">Participant Registration</h1>
        <p className="register-subtitle">Join ADZAP Arena Event</p>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Team Info */}
          <div className="form-section">
            <h2>Team Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleInputChange}
                  placeholder="Enter team name"
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Team Number *</label>
                <input
                  type="number"
                  name="teamNumber"
                  value={formData.teamNumber}
                  onChange={handleInputChange}
                  placeholder="Enter team number"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="Enter your product/project name"
                className="input-field"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="team@example.com"
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create password"
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="form-section">
            <h2>Team Members</h2>
            {formData.members.map((member, index) => (
              <div key={index} className="member-card">
                <div className="member-header">
                  <h3>Member {index + 1}</h3>
                  {formData.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="remove-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      placeholder="Member name"
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                      placeholder="Phone number"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                    placeholder="member@example.com"
                    className="input-field"
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={addMember} className="add-member-btn">
              + Add Member
            </button>
          </div>

          {/* Project Poster Upload */}
          <div className="form-section">
            <h2>Project Poster (Optional)</h2>
            <p className="section-hint">Upload your project poster or documentation that judges will review</p>
            
            <div className="poster-upload-container">
              {posterPreview ? (
                <div className="poster-preview-box">
                  <img src={posterPreview} alt="Poster Preview" className="poster-preview-img" />
                  <button
                    type="button"
                    onClick={removePoster}
                    className="remove-poster-btn"
                  >
                    Remove Poster
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
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            {submitError && <div className="error-message">{submitError}</div>}
            <button type="submit" className="btn btn-submit">
              Register Team
            </button>
            <button
              type="button"
              onClick={() => onNavigate('participant-login')}
              className="btn btn-secondary"
            >
              Already Registered? Participant Login
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="btn btn-secondary"
            >
              Back to Home
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .register-page {
          animation: fadeIn 0.6s ease-out;
        }

        .register-container {
          max-width: 800px;
          margin: 0 auto;
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.8) 0%, rgba(20, 30, 60, 0.6) 100%);
          border: 2px solid rgba(34, 211, 238, 0.3);
          border-radius: 12px;
          padding: 2.5rem;
        }

        .register-title {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .register-subtitle {
          text-align: center;
          color: #8a92a1;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .form-section {
          border-bottom: 2px solid rgba(34, 211, 238, 0.1);
          padding-bottom: 2rem;
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        .form-section h2 {
          color: #22d3ee;
          margin-bottom: 1.5rem;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          color: #22d3ee;
          margin-bottom: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .member-card {
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .member-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .member-header h3 {
          color: #22d3ee;
          font-size: 1.1rem;
        }

        .remove-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .remove-btn:hover {
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
        }

        .add-member-btn {
          display: inline-block;
          padding: 0.8rem 1.5rem;
          background: rgba(34, 211, 238, 0.15);
          border: 2px solid rgba(34, 211, 238, 0.5);
          color: #22d3ee;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .add-member-btn:hover {
          background: rgba(34, 211, 238, 0.25);
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.3);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          flex-direction: column;
        }

        .error-message {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
          border: 2px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
          padding: 0.8rem;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
        }

        .btn-submit {
          width: 100%;
        }

        .btn-secondary {
          width: 100%;
        }

        .section-hint {
          color: #8a92a1;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .poster-upload-container {
          margin-bottom: 1rem;
        }

        .upload-label {
          cursor: pointer;
          display: block;
        }

        .upload-box {
          border: 2px dashed rgba(34, 211, 238, 0.3);
          border-radius: 8px;
          padding: 2.5rem;
          text-align: center;
          background: rgba(34, 211, 238, 0.05);
          transition: all 0.3s ease;
        }

        .upload-label:hover .upload-box {
          border-color: #22d3ee;
          background: rgba(34, 211, 238, 0.1);
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.2);
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
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

        .poster-preview-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(34, 211, 238, 0.1);
          border: 2px solid rgba(34, 211, 238, 0.3);
          border-radius: 8px;
        }

        .poster-preview-img {
          max-width: 100%;
          max-height: 300px;
          border-radius: 6px;
          border: 2px solid rgba(34, 211, 238, 0.2);
          box-shadow: 0 4px 12px rgba(34, 211, 238, 0.2);
        }

        .remove-poster-btn {
          padding: 0.6rem 1.2rem;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: none;
          color: white;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .remove-poster-btn:hover {
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
          .register-container {
            padding: 1.5rem;
          }

          .register-title {
            font-size: 1.8rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';

export default function HomePage({ onNavigate }) {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  const isIOS = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  const isStandalone = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const openParticipantRegistration = () => {
    if (typeof onNavigate === 'function') {
      onNavigate('participant-register');
    }
  };

  const handleDownloadApp = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      setInstallPromptEvent(null);
      setShowInstallButton(false);

      if (outcome === 'accepted') {
        return;
      }
      return;
    }

    if (isIOS && !isStandalone) {
      alert('On iPhone: tap Share icon and choose "Add to Home Screen" to install ADZAP app.');
      return;
    }

    alert('Install option is not ready in this browser yet. Open in Chrome mobile and try again.');
  };

  return (
    <div className="home-page">

      <section className="hero-section">
        <div className="hero-image-wrap">
          <img
            src="https://res.cloudinary.com/dllobgxw0/image/upload/v1772166207/3_qwzp2p.jpg"
            alt="ADZAP Event Poster"
            className="hero-image"
            onError={(e) => {
              e.currentTarget.src = '/logo192.png';
            }}
          />
        </div>
        <div className="hero-content">
          <p className="hero-host">
            Rajeev Gandhi Memorial College of Engineering &amp; Technology
          </p>
          <p className="hero-department">
            Department of Computer Science &amp; Engineering (Cyber Security)
          </p>
          <h1 className="hero-title">ADZAP</h1>
          <div className="event-banner">
            <span className="event-pill">DEFEND-X 2K26</span>
            <span className="event-pill">RIPPLE-2K26</span>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn hero-register-btn" onClick={openParticipantRegistration}>
              Participant Registration
            </button>
            {showInstallButton && (
              <button type="button" className="btn hero-download-btn" onClick={handleDownloadApp}>
                Download ADZAP App
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="grid-3">
          <div className="card">
            <div className="feature-icon">📝 Registration</div>
            <h3>Team Registration</h3>
            <p>Easy online registration with team and participant details</p>
          </div>
          <div className="card">
            <div className="feature-icon">⚖️ Judges</div>
            <h3>Multi-Judge System</h3>
            <p>Multiple judges scoring with automatic average calculation</p>
          </div>
          <div className="card">
            <div className="feature-icon">🏆 Rankings</div>
            <h3>Live Rankings</h3>
            <p>Real-time leaderboard with automatic rankings</p>
          </div>
          <div className="card">
            <div className="feature-icon">🎬 Present</div>
            <h3>Presentation Mode</h3>
            <p>Fullscreen presentation view with team posters</p>
          </div>
          <div className="card">
            <div className="feature-icon">📊 Admin</div>
            <h3>Admin Dashboard</h3>
            <p>Complete control over teams, rounds, and selections</p>
          </div>
          <div className="card">
            <div className="feature-icon">📱 Mobile</div>
            <h3>Mobile Ready</h3>
            <p>Responsive design works on all devices</p>
          </div>
        </div>
      </section>

      <section className="contact-info-section">
        <h2 className="section-title">Need Help?</h2>
        <div className="contact-grid">
          <div className="contact-card">
            <h3>Team Leads</h3>
            <div className="person-list">
              <div className="person-box">
                <p className="person-name">M. Rajinikanth Reddy</p>
                <p className="person-contact">+91-9392485881</p>
              </div>
              <div className="person-box">
                <p className="person-name">S VijayaLakshmi</p>
                <p className="person-contact">+91-9014578810</p>
              </div>
            </div>
          </div>
          <div className="contact-card">
            <h3>Coordinators</h3>
            <div className="person-list">
              <div className="person-box">
                <p className="person-name">Giridhar</p>
              </div>
              <div className="person-box">
                <p className="person-name">Ganga Mahesh</p>
              </div>
              <div className="person-box">
                <p className="person-name">Karthik</p>
              </div>
              <div className="person-box">
                <p className="person-name">Immanuel</p>
              </div>
            </div>
          </div>
          <div className="contact-card">
            <h3>Help Desk</h3>
            <div className="person-list">
              <div className="person-box">
                <p className="person-name">Phone</p>
                <p className="person-contact">+91-9392485881</p>
              </div>
              <div className="person-box">
                <p className="person-name">Email</p>
                <p className="person-contact">support@adzap.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .home-page {
          animation: fadeIn 0.6s ease-out;
        }

        .hero-section {
          text-align: center;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, rgba(10, 14, 39, 0.9) 0%, rgba(34, 211, 238, 0.05) 50%);
          border-radius: 12px;
          border: 2px solid rgba(34, 211, 238, 0.2);
          margin-bottom: 3rem;
        }

        .hero-image-wrap {
          display: flex;
          justify-content: center;
        }

        .hero-image {
          width: 100%;
          max-width: 420px;
          border-radius: 14px;
          border: 2px solid rgba(34, 211, 238, 0.3);
          box-shadow: 0 12px 28px rgba(34, 211, 238, 0.25);
        }

        .hero-content {
          margin-top: 1.2rem;
          text-align: center;
        }

        .hero-host {
          color: #e2e8f0;
          margin: 0.25rem 0;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .hero-department {
          color: #cbd5e1;
          margin: 0.3rem 0 0.9rem;
          font-size: 1rem;
          font-weight: 600;
        }

        .hero-title {
          font-size: 3rem;
          background: linear-gradient(135deg, #fde047 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0.2rem 0 0.8rem;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .event-banner {
          display: flex;
          justify-content: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .event-pill {
          display: inline-block;
          padding: 0.45rem 0.85rem;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
          border: 1px solid rgba(250, 204, 21, 0.45);
          color: #fde68a;
          font-weight: 700;
          font-size: 0.86rem;
          letter-spacing: 0.3px;
        }

        .hero-actions {
          margin-top: 1rem;
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .hero-register-btn {
          min-width: 240px;
        }

        .hero-download-btn {
          min-width: 240px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          box-shadow: 0 10px 24px rgba(34, 197, 94, 0.3);
        }

        .section-title {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 2rem;
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }

        .features-section {
          margin-bottom: 3rem;
        }

        .feature-icon {
          font-size: 1.5rem;
          font-weight: 700;
          color: #22d3ee;
          margin-bottom: 1rem;
        }

        .contact-info-section {
          margin-top: 4rem;
          margin-bottom: 2rem;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .contact-card {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.7) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
        }

        .contact-card h3 {
          color: #22d3ee;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .person-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          text-align: left;
        }

        .person-box {
          background: rgba(34, 211, 238, 0.08);
          border: 1px solid rgba(34, 211, 238, 0.25);
          border-radius: 8px;
          padding: 0.65rem 0.75rem;
        }

        .person-name {
          color: #22d3ee;
          font-weight: 700;
          margin: 0 0 0.2rem 0;
          font-size: 0.92rem;
        }

        .person-contact {
          color: #cbd5e1;
          margin: 0;
          font-size: 0.87rem;
          word-break: break-word;
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
          .hero-title {
            font-size: 2rem;
          }

          .hero-host {
            font-size: 0.96rem;
          }

          .hero-department {
            font-size: 0.86rem;
          }

          .btn {
            width: 100%;
          }

          .section-title {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
}

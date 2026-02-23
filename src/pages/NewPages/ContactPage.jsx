import React, { useState } from 'react';

export default function ContactPage({ onNavigate, onSubmitMessage }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('Please fill in all required fields');
      return;
    }
    if (onSubmitMessage) {
      const result = await Promise.resolve(onSubmitMessage(formData));
      if (result?.success === false) {
        setSubmitStatus(result.message || 'Failed to send message');
        return;
      }
    }
    setSubmitStatus('Message sent successfully! We will contact you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setSubmitStatus(''), 3000);
  };

  return (
    <div className="contact-page">
      <h1>Contact Us</h1>
      <p className="page-subtitle">Get in touch with the ADZAP team</p>

      <div className="contact-container">
        {/* Contact Information */}
        <div className="contact-info-section">
          <h2>Get in Touch</h2>
          
          <div className="info-cards">
            {/* Team Leads */}
            <div className="info-card">
              <div className="card-icon">👨‍💼</div>
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

            {/* Coordinators */}
            <div className="info-card">
              <div className="card-icon">👥</div>
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
            {/* General Support */}
            <div className="info-card">
              <div className="card-icon">💬</div>
              <h3>General Support</h3>
              <div className="contact-list">
                <div className="contact-item">
                  <p className="contact-label">Main Email</p>
                  <p>
                    <a href="mailto:rajinikanthreddymadem@gmail.com" className="contact-link">
                      ✉️ support@adzap.com
                    </a>
                  </p>
                </div>
                <div className="contact-item">
                  <p className="contact-label">Help Desk</p>
                  <p>
                    <a href="tel:+91 9392485881" className="contact-link">
                      📱 +91 9392485881
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Venue & Timing */}
            <div className="info-card">
              <div className="card-icon">📍</div>
              <h3>Event Details</h3>
              <div className="contact-list">
                <div className="contact-item">
                  <p className="contact-label">Venue</p>
                  <p>RGMCET Civil Block CB(4020/4030/4070)</p>
                </div>
                <div className="contact-item">
                  <p className="contact-label">Event Date</p>
                  <p>9th-10th March 2026</p>
                </div>
                <div className="contact-item">
                  <p className="contact-label">Registration Deadline</p>
                  <p>8th March 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-section">
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 90000 00000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Message subject"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Your message here..."
                rows="4"
                required
              ></textarea>
            </div>

            {submitStatus && (
              <div className={`status-message ${submitStatus.includes('successfully') ? 'success' : 'error'}`}>
                {submitStatus}
              </div>
            )}

            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          <div className="faq-item">
            <h4>When is the event scheduled?</h4>
            <p>The event dates will be announced soon on our website. Please check back regularly for updates.</p>
          </div>
          <div className="faq-item">
            <h4>How do I register my team?</h4>
            <p>Click on "Register" from the home page, fill in your team details and member information, and submit. You'll receive a confirmation email with your login credentials.</p>
          </div>
          <div className="faq-item">
            <h4>What is the team size?</h4>
            <p>Each team should have exactly 5 members. This is a requirement for participation in ADZAP Arena.</p>
          </div>
          <div className="faq-item">
            <h4>How is the scoring done?</h4>
            <p>Teams are scored by 2 independent judges in each round. The final score is the average of both judges' scores (0-10 scale).</p>
          </div>
          <div className="faq-item">
            <h4>What happens after Round 1?</h4>
            <p>Top-performing teams from Round 1 are selected to advance to Round 2 (Finals). The final results will be declared after Round 2.</p>
          </div>
          <div className="faq-item">
            <h4>Can I upload my project poster?</h4>
            <p>Yes! Once you're selected for Round 1, you can upload your project poster or documentation through your participant dashboard.</p>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="back-link">
        <button onClick={() => onNavigate('home')} className="link-btn">
          ← Back to Home
        </button>
      </div>

      <style>{`
        .contact-page {
          animation: fadeIn 0.6s ease-out;
        }

        .contact-page h1 {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.25rem;
          text-align: center;
        }

        .page-subtitle {
          text-align: center;
          color: #a0aab9;
          font-size: 0.95rem;
          margin-bottom: 1.2rem;
        }

        .contact-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .contact-info-section h2,
        .contact-form-section h2,
        .faq-section h2 {
          color: #22d3ee;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .info-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .info-card {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.7) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .info-card:hover {
          border-color: #22d3ee;
          box-shadow: 0 8px 20px rgba(34, 211, 238, 0.2);
          transform: translateY(-4px);
        }

        .card-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .info-card h3 {
          color: #22d3ee;
          margin: 0 0 0.6rem 0;
          font-size: 1rem;
        }

        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .contact-item {
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(34, 211, 238, 0.1);
        }

        .contact-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .contact-label {
          color: #8a92a1;
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          text-transform: uppercase;
        }
        .person-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .person-box {
          padding: 0.6rem;
          border: 1px solid rgba(34, 211, 238, 0.25);
          border-radius: 8px;
          background: rgba(34, 211, 238, 0.08);
        }

        .person-name {
          color: #22d3ee;
          margin: 0;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .person-contact {
          color: #a0aab9;
          margin: 0.3rem 0 0 0;
          font-size: 0.85rem;
        }

        .contact-link {
          color: #22d3ee;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .contact-link:hover {
          color: #06b6d4;
          text-decoration: underline;
        }

        .contact-form-section {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.7) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 12px;
          width: 100%;
          max-width: 440px;
          justify-self: center;
          padding: 0.75rem;
          max-height: 560px;
          overflow-y: auto;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-group label {
          color: #22d3ee;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .contact-form input,
        .contact-form textarea {
          padding: 0.45rem 0.55rem;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(34, 211, 238, 0.2);
          color: #fff;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.82rem;
          transition: all 0.3s ease;
        }

        .contact-form textarea {
          min-height: 70px;
          resize: vertical;
        }

        .contact-form input::placeholder,
        .contact-form textarea::placeholder {
          color: #6b7280;
        }

        .contact-form input:focus,
        .contact-form textarea:focus {
          outline: none;
          border-color: #22d3ee;
          box-shadow: 0 0 12px rgba(34, 211, 238, 0.3);
        }

        .status-message {
          padding: 1rem;
          border-radius: 6px;
          text-align: center;
          font-weight: 600;
          animation: slideIn 0.3s ease-out;
        }

        .status-message.success {
          background: rgba(34, 197, 94, 0.2);
          color: #86efac;
          border: 1px solid rgba(34, 197, 94, 0.4);
        }

        .status-message.error {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .submit-btn {
          padding: 0.55rem 0.75rem;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          border: none;
          color: #fff;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-btn:hover {
          box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
          transform: translateY(-2px);
        }

        .faq-section {
          margin-bottom: 1.5rem;
        }

        .faq-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .faq-item {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.7) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          border-color: #22d3ee;
          box-shadow: 0 8px 20px rgba(34, 211, 238, 0.2);
        }

        .faq-item h4 {
          color: #22d3ee;
          margin: 0 0 0.45rem 0;
          font-size: 0.92rem;
        }

        .faq-item p {
          color: #a0aab9;
          margin: 0;
          line-height: 1.4;
          font-size: 0.85rem;
        }

        .back-link {
          display: flex;
          justify-content: center;
          margin-top: 1rem;
        }

        .link-btn {
          padding: 0.8rem 1.5rem;
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

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .contact-page h1 {
            font-size: 1.8rem;
          }

          .contact-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .info-cards {
            grid-template-columns: 1fr;
          }

          .faq-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}


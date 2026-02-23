import React, { useState, useEffect } from 'react';
import './NewApp.css';
import logo from './logo.svg';
import { SpeedInsights } from '@vercel/speed-insights/react';
import HomePage from './pages/NewPages/HomePage';
import RegisterPage from './pages/NewPages/RegisterPage';
import AdminDashboard from './pages/NewPages/AdminDashboard';
import JudgeDashboard from './pages/NewPages/JudgeDashboard';
import ParticipantDashboard from './pages/NewPages/ParticipantDashboard';
import ContactPage from './pages/NewPages/ContactPage';
import PresentationPage from './pages/NewPages/PresentationPage';
import FinalPage from './pages/NewPages/FinalPage';
import ParticipantLoginPage from './pages/NewPages/ParticipantLoginPage';
import AdminRegisterPage from './pages/NewPages/AdminRegisterPage';
import AdminLoginPage from './pages/NewPages/AdminLoginPage';
import JudgeRegisterPage from './pages/NewPages/JudgeRegisterPage';
import JudgeLoginPage from './pages/NewPages/JudgeLoginPage';

export default function NewApp() {
  const MAX_PARTICIPANT_REGISTRATIONS = 600;
  const MAX_ADMIN_ACCOUNTS = 6;
  const MAX_JUDGE_ACCOUNTS = 2;
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [judgeAccounts, setJudgeAccounts] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('adzap_user');
    const savedTeams = localStorage.getItem('adzap_teams');
    const savedMessages = localStorage.getItem('adzap_contact_messages');
    const savedAdmins = localStorage.getItem('adzap_admins');
    const savedJudges = localStorage.getItem('adzap_judges');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedMessages) setContactMessages(JSON.parse(savedMessages));
    if (savedAdmins) setAdminAccounts(JSON.parse(savedAdmins));
    if (savedJudges) setJudgeAccounts(JSON.parse(savedJudges));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('adzap_user', JSON.stringify(user));
    else localStorage.removeItem('adzap_user');

    if (teams.length > 0) localStorage.setItem('adzap_teams', JSON.stringify(teams));
    else localStorage.removeItem('adzap_teams');

    if (contactMessages.length > 0) localStorage.setItem('adzap_contact_messages', JSON.stringify(contactMessages));
    else localStorage.removeItem('adzap_contact_messages');

    if (adminAccounts.length > 0) localStorage.setItem('adzap_admins', JSON.stringify(adminAccounts));
    else localStorage.removeItem('adzap_admins');

    if (judgeAccounts.length > 0) localStorage.setItem('adzap_judges', JSON.stringify(judgeAccounts));
    else localStorage.removeItem('adzap_judges');
  }, [user, teams, contactMessages, adminAccounts, judgeAccounts]);

  const submitContactMessage = (messageData) => {
    const newMessage = {
      id: Date.now(),
      ...messageData,
      createdAt: new Date().toISOString(),
    };
    setContactMessages(prev => [newMessage, ...prev]);
  };

  const handleRegister = (teamData) => {
    if (teams.length >= MAX_PARTICIPANT_REGISTRATIONS) {
      return {
        success: false,
        message: `Registrations are closed. Maximum ${MAX_PARTICIPANT_REGISTRATIONS} participants reached.`,
      };
    }

    const normalizedEmail = teamData.email?.trim().toLowerCase();
    const duplicateTeam = teams.find(
      t => t.email?.trim().toLowerCase() === normalizedEmail
    );
    if (duplicateTeam) {
      return {
        success: false,
        message: 'This email is already registered. Please use participant login.',
      };
    }

    const newTeam = {
      id: Date.now(),
      ...teamData,
      email: teamData.email?.trim(),
      round1: { avgScore: 0, selected: false },
      round2: { avgScore: 0, selected: false },
    };
    setTeams([...teams, newTeam]);
    setCurrentPage('participant-login');
    return { success: true };
  };

  const handleParticipantLogin = (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const team = teams.find(
      t => t.email?.trim().toLowerCase() === normalizedEmail && t.password === trimmedPassword
    );
    if (team) {
      setUser({ ...team, teamId: team.id, role: 'participant' });
      setCurrentPage('participant-dashboard');
      return true;
    }
    return false;
  };

  const handleAdminRegister = (adminData) => {
    if (adminAccounts.length >= MAX_ADMIN_ACCOUNTS) {
      return {
        success: false,
        message: `Only ${MAX_ADMIN_ACCOUNTS} admin accounts can be registered.`,
      };
    }

    const alreadyExists = adminAccounts.some(
      account => account.email.toLowerCase() === adminData.email.toLowerCase()
    );
    if (alreadyExists) {
      return {
        success: false,
        message: 'Admin with this email already exists',
      };
    }

    const newAdmin = { id: Date.now(), ...adminData };
    setAdminAccounts(prev => [...prev, newAdmin]);
    setCurrentPage('admin-login');
    return { success: true };
  };

  const handleJudgeRegister = (judgeData) => {
    if (judgeAccounts.length >= MAX_JUDGE_ACCOUNTS) {
      return {
        success: false,
        message: `Only ${MAX_JUDGE_ACCOUNTS} judge accounts can be registered.`,
      };
    }

    const alreadyExists = judgeAccounts.some(
      account => account.email.toLowerCase() === judgeData.email.toLowerCase()
    );
    if (alreadyExists) {
      return {
        success: false,
        message: 'Judge with this email already exists',
      };
    }

    const newJudge = { id: Date.now(), ...judgeData };
    setJudgeAccounts(prev => [...prev, newJudge]);
    setCurrentPage('judge-login');
    return { success: true };
  };

  const handleAdminLogin = (email, password) => {
    const savedAdmin = adminAccounts.find(
      account =>
        account.email.toLowerCase() === email.toLowerCase() &&
        account.password === password
    );

    if (savedAdmin) {
      setUser({ name: savedAdmin.name, email: savedAdmin.email, role: 'admin' });
      setCurrentPage('admin-dashboard');
      return true;
    }

    // Allow default admin login only until 6 admin accounts are registered.
    if (adminAccounts.length < MAX_ADMIN_ACCOUNTS) {
      if (email.toLowerCase() === 'admin@adzap.com' && password === 'admin123') {
        setUser({ name: 'Default Admin', email, role: 'admin' });
        setCurrentPage('admin-dashboard');
        return true;
      }
    }

    return false;
  };

  const handleJudgeLogin = (email, password) => {
    const savedJudge = judgeAccounts.find(
      account =>
        account.email.toLowerCase() === email.toLowerCase() &&
        account.password === password
    );

    if (savedJudge) {
      setUser({ name: savedJudge.name, email: savedJudge.email, role: 'judge' });
      setCurrentPage('judge-dashboard');
      return true;
    }

    // Allow default judge login only until 2 judge accounts are registered.
    if (judgeAccounts.length < MAX_JUDGE_ACCOUNTS) {
      const defaultJudgeEmails = ['judge1@adzap.com', 'judge2@adzap.com'];
      if (defaultJudgeEmails.includes(email.toLowerCase()) && password === 'judge123') {
        setUser({ name: email, email, role: 'judge' });
        setCurrentPage('judge-dashboard');
        return true;
      }
    }

    return false;
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const openAdminSection = () => {
    if (user?.role === 'admin') {
      setCurrentPage('admin-dashboard');
      return;
    }
    setCurrentPage('admin-login');
  };

  const openParticipantSection = () => {
    if (user?.role === 'participant') {
      setCurrentPage('participant-dashboard');
      return;
    }
    setCurrentPage('participant-login');
  };

  const openJudgeSection = () => {
    if (user?.role === 'judge') {
      setCurrentPage('judge-dashboard');
      return;
    }
    setCurrentPage('judge-login');
  };

  const updateTeamScores = (teamId, judgeId, score) => {
    const updated = teams.map(team => {
      if (team.id === teamId) {
        const existingJudgeScores = team.scores?.[judgeId] || {};
        const roundKey = `round${score.round}`;
        return {
          ...team,
          scores: {
            ...team.scores,
            [judgeId]: {
              ...existingJudgeScores,
              [roundKey]: score.score,
            },
          },
        };
      }
      return team;
    });
    setTeams(updated);
  };

  const selectRound1 = (teamIds) => {
    const updated = teams.map(team => ({
      ...team,
      round1: { ...team.round1, selected: teamIds.includes(team.id) },
      // Reset round2 selection when round1 qualifiers are re-finalized
      round2: { ...team.round2, selected: false },
    }));
    setTeams(updated);
  };

  const selectRound2 = (teamIds) => {
    const updated = teams.map(team => ({
      ...team,
      // Only round1-qualified teams can be selected in round2
      round2: {
        ...team.round2,
        selected: team.round1?.selected ? teamIds.includes(team.id) : false,
      },
    }));
    setTeams(updated);
  };

  const uploadTeamPoster = (teamId, posterData) => {
    const updated = teams.map(team => {
      if (team.id === teamId) {
        return { ...team, poster: posterData };
      }
      return team;
    });
    setTeams(updated);
  };

  const updateTeamProductName = (teamId, productName) => {
    const updated = teams.map(team => {
      if (team.id === teamId) {
        return { ...team, productName };
      }
      return team;
    });
    setTeams(updated);
  };

  const clearRoundSelections = (round) => {
    const roundKey = `round${round}`;
    setTeams(prev =>
      prev.map(team => ({
        ...team,
        [roundKey]: {
          ...(team[roundKey] || {}),
          selected: false,
        },
      }))
    );
  };

  const deleteTeams = (teamIds) => {
    if (!teamIds || teamIds.length === 0) return;
    setTeams(prev => prev.filter(team => !teamIds.includes(team.id)));
  };

  const clearJudgeScores = (judgeId, round, teamIds = null) => {
    const roundKey = `round${round}`;
    setTeams(prev =>
      prev.map(team => {
        if (teamIds && !teamIds.includes(team.id)) return team;
        const judgeScores = team.scores?.[judgeId];
        if (!judgeScores) return team;

        const updatedJudgeScores = { ...judgeScores };
        delete updatedJudgeScores[roundKey];

        const updatedScores = { ...(team.scores || {}) };
        if (Object.keys(updatedJudgeScores).length === 0) {
          delete updatedScores[judgeId];
        } else {
          updatedScores[judgeId] = updatedJudgeScores;
        }

        return { ...team, scores: updatedScores };
      })
    );
  };

  const downloadRegistrationPdfReport = () => {
    if (user?.role !== 'admin') {
      alert('Only admin can download this report.');
      return;
    }

    if (!teams || teams.length === 0) {
      alert('No registrations available to export.');
      return;
    }

    const formatMembers = (members = []) => {
      if (!members.length) return '<li>No members added</li>';
      return members
        .map(
          member =>
            `<li>${member.name || '-'} | ${member.email || '-'} | ${member.phone || '-'}</li>`
        )
        .join('');
    };

    const teamRows = teams
      .map(
        (team, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${team.teamName || '-'}</td>
            <td>${team.productName || '-'}</td>
            <td>${team.email || '-'}</td>
            <td>${team.round1?.selected ? 'Selected' : 'Not Selected'}</td>
            <td>${team.round2?.selected ? 'Selected' : 'Not Selected'}</td>
          </tr>
        `
      )
      .join('');

    const memberBlocks = teams
      .map(
        team => `
          <div class="member-block">
            <h3>${team.teamName || 'Unnamed Team'} (${team.productName || '-'})</h3>
            <ul>${formatMembers(team.members)}</ul>
          </div>
        `
      )
      .join('');

    const round1Selected = teams.filter(team => team.round1?.selected);
    const round2Selected = teams.filter(team => team.round2?.selected);

    const formatSelectedTeams = (selectedTeams) => {
      if (!selectedTeams.length) return '<li>No teams selected</li>';
      return selectedTeams
        .map(
          (team, index) =>
            `<li>${index + 1}. ${team.teamName || '-'} (${team.productName || '-'}) - ${team.email || '-'}</li>`
        )
        .join('');
    };

    const reportWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!reportWindow) {
      alert('Popup blocked. Please allow popups and try again.');
      return;
    }

    reportWindow.document.write(`
      <html>
        <head>
          <title>ADZAP Registration & Selection Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
            h1 { margin-bottom: 4px; }
            .meta { color: #334155; margin-bottom: 18px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 22px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 13px; text-align: left; }
            th { background: #e2e8f0; }
            .member-block { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; margin-bottom: 10px; }
            .member-block h3 { margin: 0 0 8px 0; font-size: 14px; }
            .member-block ul { margin: 0; padding-left: 20px; }
            .member-block li { margin: 4px 0; font-size: 13px; }
            @media print {
              body { margin: 10mm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>ADZAP Registration & Round Selection Report</h1>
          <div class="meta">Generated on: ${new Date().toLocaleString()}</div>

          <h2>Team Registration & Selection Summary</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Team Name</th>
                <th>Product Name</th>
                <th>Team Email</th>
                <th>Round 1</th>
                <th>Round 2</th>
              </tr>
            </thead>
            <tbody>
              ${teamRows}
            </tbody>
          </table>

          <h2>Registered Members</h2>
          ${memberBlocks}

          <h2>Round 1 Selected Teams</h2>
          <ul>
            ${formatSelectedTeams(round1Selected)}
          </ul>

          <h2>Round 2 Selected Teams</h2>
          <ul>
            ${formatSelectedTeams(round2Selected)}
          </ul>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  return (
    <div className="adzap-container">
      {/* Header */}
      <header className="adzap-header">
        <div className="header-content">
          <div className="logo-section">
            <img
              src="https://res.cloudinary.com/dllobgxw0/image/upload/v1771827938/WhatsApp_Image_2026-02-22_at_6.00.23_PM_t525yv.jpg"
              alt="ADZAP Logo"
              className="adzap-logo-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = logo;
              }}
            />
            <h1 className="adzap-logo">⚡ ADZAP-DefendX</h1>
          </div>
          <nav className="nav-menu">
            {!user ? (
              <>
                <button onClick={() => setCurrentPage('home')} className="nav-btn">Home</button>
                <button onClick={openParticipantSection} className="nav-btn">Participant</button>
                <button onClick={openAdminSection} className="nav-btn">Admin</button>
                <button onClick={openJudgeSection} className="nav-btn">Judge</button>
                <button onClick={() => setCurrentPage('presentations')} className="nav-btn">Presentations</button>
                <button onClick={() => setCurrentPage('final')} className="nav-btn">Final</button>
                <button onClick={() => setCurrentPage('contact')} className="nav-btn">Contact</button>
              </>
            ) : (
              <>
                <span className="user-badge">{user.role.toUpperCase()}</span>
                <button onClick={() => setCurrentPage('home')} className="nav-btn">Home</button>
                <button onClick={openParticipantSection} className="nav-btn">Participant</button>
                <button onClick={openAdminSection} className="nav-btn">Admin</button>
                <button onClick={openJudgeSection} className="nav-btn">Judge</button>
                <button onClick={() => setCurrentPage('presentations')} className="nav-btn">Presentations</button>
                <button onClick={() => setCurrentPage('final')} className="nav-btn">Final</button>
                <button onClick={() => setCurrentPage('contact')} className="nav-btn">Contact</button>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="adzap-main">
        {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
        {currentPage === 'participant-register' && <RegisterPage onRegister={handleRegister} onNavigate={setCurrentPage} />}
        {currentPage === 'participant-login' && <ParticipantLoginPage onLogin={handleParticipantLogin} onNavigate={setCurrentPage} />}
        {currentPage === 'admin-register' && (
          <AdminRegisterPage
            onRegister={handleAdminRegister}
            onNavigate={setCurrentPage}
            registrationsClosed={adminAccounts.length >= MAX_ADMIN_ACCOUNTS}
          />
        )}
        {currentPage === 'admin-login' && (
          <AdminLoginPage
            onLogin={handleAdminLogin}
            onNavigate={setCurrentPage}
            registrationsClosed={adminAccounts.length >= MAX_ADMIN_ACCOUNTS}
            showDefaultLogin={adminAccounts.length < MAX_ADMIN_ACCOUNTS}
          />
        )}
        {currentPage === 'judge-register' && <JudgeRegisterPage onRegister={handleJudgeRegister} onNavigate={setCurrentPage} />}
        {currentPage === 'judge-login' && (
          <JudgeLoginPage
            onLogin={handleJudgeLogin}
            onNavigate={setCurrentPage}
            showDefaultLogin={judgeAccounts.length < MAX_JUDGE_ACCOUNTS}
          />
        )}
        {currentPage === 'presentations' && <PresentationPage teams={teams} onNavigate={setCurrentPage} />}
        {currentPage === 'final' && <FinalPage teams={teams} onNavigate={setCurrentPage} />}
        {currentPage === 'admin-dashboard' && user?.role === 'admin' && (
          <AdminDashboard
            teams={teams}
            contactMessages={contactMessages}
            onSelectRound1={selectRound1}
            onSelectRound2={selectRound2}
            onDeleteTeams={deleteTeams}
            onClearRoundSelections={clearRoundSelections}
            onUpdateProductName={updateTeamProductName}
            onDownloadReport={downloadRegistrationPdfReport}
            onNavigate={setCurrentPage}
          />
        )}
        {currentPage === 'judge-dashboard' && user?.role === 'judge' && (
          <JudgeDashboard
            teams={teams}
            onUpdateScores={updateTeamScores}
            onClearScores={clearJudgeScores}
            onNavigate={setCurrentPage}
          />
        )}
        {currentPage === 'participant-dashboard' && user?.role === 'participant' && (
          <ParticipantDashboard user={user} teams={teams} onNavigate={setCurrentPage} onUploadPoster={uploadTeamPoster} />
        )}
        {currentPage === 'contact' && <ContactPage onNavigate={setCurrentPage} onSubmitMessage={submitContactMessage} />}
      </main>

      {/* Footer */}
      <footer className="adzap-footer">
        <p>&copy; 2026 ADZAP-DefendX Event Management System. All rights reserved.</p>
      </footer>
      <SpeedInsights />
    </div>
  );
}

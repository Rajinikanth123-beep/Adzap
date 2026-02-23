import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './NewApp.css';
import logo from './logo.svg';
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

const API_BASE = (process.env.REACT_APP_API_BASE_URL || 'https://adzap.onrender.com')
  .trim()
  .replace(/\/$/, '');
const LOCAL_FALLBACK_ENABLED =
  process.env.REACT_APP_ALLOW_LOCAL_FALLBACK === 'true' || process.env.NODE_ENV !== 'production';

export default function NewApp() {
  const MAX_PARTICIPANT_REGISTRATIONS = 600;
  const MAX_ADMIN_ACCOUNTS = 6;
  const MAX_JUDGE_ACCOUNTS = 2;
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      return localStorage.getItem('adzap_current_page') || 'home';
    } catch (_error) {
      return 'home';
    }
  });
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [judgeAccounts, setJudgeAccounts] = useState([]);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [backendRequiredError, setBackendRequiredError] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const dedupeTeams = useCallback((teamList = []) => {
    const byEmailOrId = new Map();
    for (const team of teamList) {
      const emailKey = String(team?.email || '').trim().toLowerCase();
      const idKey = String(team?.id ?? '').trim();
      const key = emailKey || idKey;
      if (!key) continue;
      byEmailOrId.set(key, team);
    }
    return Array.from(byEmailOrId.values());
  }, []);

  const safeSetItem = (key, value, options = {}) => {
    const { fallbackValue } = options;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (fallbackValue !== undefined) {
        try {
          localStorage.setItem(key, JSON.stringify(fallbackValue));
          return true;
        } catch (_fallbackError) {
          return false;
        }
      }
      return false;
    }
  };

  const callApi = async (method, url, data) => {
    const fullUrl = `${API_BASE}${url}`;

    const run = () =>
      axios({
        method,
        url: fullUrl,
        data,
        timeout: 30000,
      });

    try {
      const response = await run();
      return response.data;
    } catch (error) {
      // Render free tier can cold-start; retry once on transient/network errors.
      const status = error?.response?.status;
      const shouldRetry =
        error?.code === 'ECONNABORTED' || !error?.response || [502, 503, 504].includes(status);
      if (!shouldRetry) throw error;

      const response = await run();
      return response.data;
    }
  };

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedUser = localStorage.getItem('adzap_user');
      const savedTeams = localStorage.getItem('adzap_teams');
      const savedMessages = localStorage.getItem('adzap_contact_messages');
      const savedAdmins = localStorage.getItem('adzap_admins');
      const savedJudges = localStorage.getItem('adzap_judges');
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedTeams) setTeams(dedupeTeams(JSON.parse(savedTeams)));
      if (savedMessages) setContactMessages(JSON.parse(savedMessages));
      if (savedAdmins) setAdminAccounts(JSON.parse(savedAdmins));
      if (savedJudges) setJudgeAccounts(JSON.parse(savedJudges));
    } catch (error) {
      localStorage.removeItem('adzap_user');
      localStorage.removeItem('adzap_teams');
      localStorage.removeItem('adzap_contact_messages');
      localStorage.removeItem('adzap_admins');
      localStorage.removeItem('adzap_judges');
    }
  }, [dedupeTeams]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      setIsBootstrapping(true);
      try {
        const data = await callApi('get', '/api/bootstrap');
        if (!mounted) return;

        setTeams(dedupeTeams(Array.isArray(data?.teams) ? data.teams : []));
        setContactMessages(Array.isArray(data?.contactMessages) ? data.contactMessages : []);
        setAdminAccounts(Array.isArray(data?.adminAccounts) ? data.adminAccounts : []);
        setJudgeAccounts(Array.isArray(data?.judgeAccounts) ? data.judgeAccounts : []);
        setBackendAvailable(true);
        setBackendRequiredError('');

        const savedUser = localStorage.getItem('adzap_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (_error) {
        if (!mounted) return;
        setBackendAvailable(false);
        if (LOCAL_FALLBACK_ENABLED) {
          loadFromLocalStorage();
        } else {
          setBackendRequiredError(
            'Backend is not reachable. Registration/login across devices needs a live backend API.'
          );
        }
      } finally {
        if (mounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [dedupeTeams, loadFromLocalStorage]);

  // Save data to localStorage
  useEffect(() => {
    if (user) {
      const persisted = safeSetItem('adzap_user', user);
      if (!persisted) localStorage.removeItem('adzap_user');
    } else {
      localStorage.removeItem('adzap_user');
    }

    if (teams.length > 0) {
      const teamsWithoutPosterData = teams.map(team => {
        if (!team.poster || typeof team.poster !== 'string') return team;
        if (!team.poster.startsWith('data:')) return team;
        const { poster, ...rest } = team;
        return rest;
      });

      const persisted = safeSetItem('adzap_teams', teams, {
        fallbackValue: teamsWithoutPosterData,
      });
      if (!persisted) {
        localStorage.removeItem('adzap_teams');
      }
    } else {
      localStorage.removeItem('adzap_teams');
    }

    if (contactMessages.length > 0) {
      const persisted = safeSetItem('adzap_contact_messages', contactMessages);
      if (!persisted) {
        localStorage.removeItem('adzap_contact_messages');
      }
    } else {
      localStorage.removeItem('adzap_contact_messages');
    }

    if (adminAccounts.length > 0) {
      const persisted = safeSetItem('adzap_admins', adminAccounts);
      if (!persisted) {
        localStorage.removeItem('adzap_admins');
      }
    } else {
      localStorage.removeItem('adzap_admins');
    }

    if (judgeAccounts.length > 0) {
      const persisted = safeSetItem('adzap_judges', judgeAccounts);
      if (!persisted) {
        localStorage.removeItem('adzap_judges');
      }
    } else {
      localStorage.removeItem('adzap_judges');
    }
  }, [user, teams, contactMessages, adminAccounts, judgeAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem('adzap_current_page', currentPage);
    } catch (_error) {
      // Ignore storage issues and keep app functional.
    }
  }, [currentPage]);

  const getApiErrorMessage = (error, fallbackMessage) =>
    error?.response?.data?.message || fallbackMessage;

  const persistTeams = async (nextTeams) => {
    setTeams(nextTeams);
    if (!backendAvailable) return true;

    try {
      await callApi('put', '/api/teams', { teams: nextTeams });
      return true;
    } catch (error) {
      alert(getApiErrorMessage(error, 'Failed to sync teams with backend.'));
      return false;
    }
  };

  const submitContactMessage = async (messageData) => {
    if (backendAvailable) {
      try {
        const created = await callApi('post', '/api/contact-messages', messageData);
        setContactMessages(prev => [created, ...prev]);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          message: getApiErrorMessage(error, 'Failed to submit message'),
        };
      }
    }

    if (!LOCAL_FALLBACK_ENABLED) {
      return {
        success: false,
        message: 'Backend is unavailable. Please try again once server is online.',
      };
    }

    const newMessage = {
      id: Date.now(),
      ...messageData,
      createdAt: new Date().toISOString(),
    };
    setContactMessages(prev => [newMessage, ...prev]);
    return { success: true };
  };

  const handleRegister = async (teamData) => {
    if (backendAvailable) {
      try {
        const data = await callApi('post', '/api/teams/register', teamData);
        setTeams(prev => dedupeTeams([...prev, data.team]));
        setCurrentPage('participant-login');
        return { success: true };
      } catch (error) {
        return {
          success: false,
          message: getApiErrorMessage(error, 'Registration failed'),
        };
      }
    }

    if (!LOCAL_FALLBACK_ENABLED) {
      return {
        success: false,
        message: 'Backend is unavailable. Registration is disabled until server is online.',
      };
    }

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
      teamName: teamData.teamName?.trim(),
      teamNumber: teamData.teamNumber?.trim(),
      email: teamData.email?.trim(),
      password: teamData.password?.trim(),
      round1: { avgScore: 0, selected: false },
      round2: { avgScore: 0, selected: false },
    };
    setTeams([...teams, newTeam]);
    setCurrentPage('participant-login');
    return { success: true };
  };

  const handleParticipantLogin = async (email, password) => {
    if (backendAvailable) {
      try {
        const data = await callApi('post', '/api/auth/participant/login', { email, password });
        const teamFromServer = data?.team;
        if (teamFromServer) {
          setTeams(prev => {
            const merged = prev.map(t =>
              t.id === teamFromServer.id ? { ...t, ...teamFromServer } : t
            );
            return dedupeTeams([...merged, teamFromServer]);
          });
        }
        const team = teamFromServer || teams.find(t => t.id === data?.user?.teamId);
        setUser(team ? { ...team, role: 'participant', teamId: team.id } : data.user);
        setCurrentPage('participant-dashboard');
        return true;
      } catch (_error) {
        return false;
      }
    }

    if (!LOCAL_FALLBACK_ENABLED) {
      alert('Backend is unavailable. Login is disabled until server is online.');
      return false;
    }

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

  const handleAdminRegister = async (adminData) => {
    if (backendAvailable) {
      try {
        const data = await callApi('post', '/api/auth/admin/register', adminData);
        setAdminAccounts(prev => [...prev, data.admin]);
        setCurrentPage('admin-login');
        return { success: true };
      } catch (error) {
        return {
          success: false,
          message: getApiErrorMessage(error, 'Admin registration failed'),
        };
      }
    }

    if (!LOCAL_FALLBACK_ENABLED) {
      return {
        success: false,
        message: 'Backend is unavailable. Admin registration is disabled until server is online.',
      };
    }

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

  const handleJudgeRegister = async (judgeData) => {
    if (backendAvailable) {
      try {
        const data = await callApi('post', '/api/auth/judge/register', judgeData);
        setJudgeAccounts(prev => [...prev, data.judge]);
        setCurrentPage('judge-login');
        return { success: true };
      } catch (error) {
        return {
          success: false,
          message: getApiErrorMessage(error, 'Judge registration failed'),
        };
      }
    }

    if (!LOCAL_FALLBACK_ENABLED) {
      return {
        success: false,
        message: 'Backend is unavailable. Judge registration is disabled until server is online.',
      };
    }

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

  const handleAdminLogin = async (email, password) => {
    if (backendAvailable) {
      try {
        const data = await callApi('post', '/api/auth/admin/login', { email, password });
        setUser(data.user);
        setCurrentPage('admin-dashboard');
        return true;
      } catch (_error) {
        return false;
      }
    }

    if (!LOCAL_FALLBACK_ENABLED) {
      alert('Backend is unavailable. Login is disabled until server is online.');
      return false;
    }

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

  const handleJudgeLogin = async (email, password) => {
    if (backendAvailable) {
      try {
        const data = await callApi('post', '/api/auth/judge/login', { email, password });
        setUser(data.user);
        setCurrentPage('judge-dashboard');
        return true;
      } catch (_error) {
        return false;
      }
    }

    if (!LOCAL_FALLBACK_ENABLED) {
      alert('Backend is unavailable. Login is disabled until server is online.');
      return false;
    }

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
    try {
      localStorage.removeItem('adzap_current_page');
    } catch (_error) {
      // Ignore storage issues.
    }
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

  const updateTeamScores = async (teamId, judgeId, score) => {
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
    await persistTeams(updated);
  };

  const selectRound1 = async (teamIds) => {
    const updated = teams.map(team => ({
      ...team,
      round1: { ...team.round1, selected: teamIds.includes(team.id) },
      // Reset round2 selection when round1 qualifiers are re-finalized
      round2: { ...team.round2, selected: false },
    }));
    await persistTeams(updated);
  };

  const selectRound2 = async (teamIds) => {
    const updated = teams.map(team => ({
      ...team,
      // Only round1-qualified teams can be selected in round2
      round2: {
        ...team.round2,
        selected: team.round1?.selected ? teamIds.includes(team.id) : false,
      },
    }));
    await persistTeams(updated);
  };

  const uploadTeamPoster = async (teamId, posterData) => {
    const updated = teams.map(team => {
      if (team.id === teamId) {
        return { ...team, poster: posterData };
      }
      return team;
    });
    await persistTeams(updated);
  };

  const updateTeamProductName = async (teamId, productName) => {
    const updated = teams.map(team => {
      if (team.id === teamId) {
        return { ...team, productName };
      }
      return team;
    });
    await persistTeams(updated);
  };

  const clearRoundSelections = async (round) => {
    const roundKey = `round${round}`;
    const updated = teams.map(team => ({
      ...team,
      [roundKey]: {
        ...(team[roundKey] || {}),
        selected: false,
      },
    }));
    await persistTeams(updated);
  };

  const deleteTeams = async (teamIds) => {
    if (!teamIds || teamIds.length === 0) return;
    const updated = teams.filter(team => !teamIds.includes(team.id));
    await persistTeams(updated);
  };

  const clearJudgeScores = async (judgeId, round, teamIds = null) => {
    const roundKey = `round${round}`;
    const updated = teams.map(team => {
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
    });
    await persistTeams(updated);
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'participant-register':
        return <RegisterPage onRegister={handleRegister} onNavigate={setCurrentPage} />;
      case 'participant-login':
        return <ParticipantLoginPage onLogin={handleParticipantLogin} onNavigate={setCurrentPage} />;
      case 'admin-register':
        return (
          <AdminRegisterPage
            onRegister={handleAdminRegister}
            onNavigate={setCurrentPage}
            registrationsClosed={adminAccounts.length >= MAX_ADMIN_ACCOUNTS}
          />
        );
      case 'admin-login':
        return (
          <AdminLoginPage
            onLogin={handleAdminLogin}
            onNavigate={setCurrentPage}
            registrationsClosed={adminAccounts.length >= MAX_ADMIN_ACCOUNTS}
            showDefaultLogin={adminAccounts.length < MAX_ADMIN_ACCOUNTS}
          />
        );
      case 'judge-register':
        return <JudgeRegisterPage onRegister={handleJudgeRegister} onNavigate={setCurrentPage} />;
      case 'judge-login':
        return (
          <JudgeLoginPage
            onLogin={handleJudgeLogin}
            onNavigate={setCurrentPage}
            showDefaultLogin={judgeAccounts.length < MAX_JUDGE_ACCOUNTS}
          />
        );
      case 'presentations':
        return <PresentationPage teams={teams} onNavigate={setCurrentPage} />;
      case 'final':
        return <FinalPage teams={teams} onNavigate={setCurrentPage} />;
      case 'admin-dashboard':
        return user?.role === 'admin' ? (
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
        ) : (
          <AdminLoginPage
            onLogin={handleAdminLogin}
            onNavigate={setCurrentPage}
            registrationsClosed={adminAccounts.length >= MAX_ADMIN_ACCOUNTS}
            showDefaultLogin={adminAccounts.length < MAX_ADMIN_ACCOUNTS}
          />
        );
      case 'judge-dashboard':
        return user?.role === 'judge' ? (
          <JudgeDashboard
            teams={teams}
            onUpdateScores={updateTeamScores}
            onClearScores={clearJudgeScores}
            onNavigate={setCurrentPage}
          />
        ) : (
          <JudgeLoginPage
            onLogin={handleJudgeLogin}
            onNavigate={setCurrentPage}
            showDefaultLogin={judgeAccounts.length < MAX_JUDGE_ACCOUNTS}
          />
        );
      case 'participant-dashboard':
        return user?.role === 'participant' ? (
          <ParticipantDashboard
            user={user}
            teams={teams}
            onNavigate={setCurrentPage}
            onUploadPoster={uploadTeamPoster}
          />
        ) : (
          <ParticipantLoginPage onLogin={handleParticipantLogin} onNavigate={setCurrentPage} />
        );
      case 'contact':
        return <ContactPage onNavigate={setCurrentPage} onSubmitMessage={submitContactMessage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="adzap-container">
      {isBootstrapping ? (
        <main className="adzap-main" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
          <div className="card" style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.7rem', color: '#22d3ee' }}>Server waking up, please wait...</h2>
            <p style={{ color: '#a0aab9', lineHeight: 1.6 }}>
              Initial connection can take a few seconds on first load.
            </p>
          </div>
        </main>
      ) : (
        <>
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
        {backendRequiredError && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {backendRequiredError}
          </div>
        )}
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <footer className="adzap-footer">
        <p>&copy; 2026 ADZAP-DefendX Event Management System. All rights reserved.</p>
      </footer>
        </>
      )}
    </div>
  );
}

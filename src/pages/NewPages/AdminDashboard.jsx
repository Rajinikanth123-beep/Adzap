import React, { useState } from 'react';

export default function AdminDashboard({ teams, contactMessages = [], onDeleteContactMessage, onSelectRound1, onSelectRound2, onDeleteTeams, onClearRoundSelections, onUpdateProductName, onUpdateScores, onDownloadReport, onNavigate }) {
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);

  const toggleTeamSelection = (teamId) => {
    setSelectedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const finalizeRound = () => {
    if (selectedTeams.length === 0) {
      alert(`Select at least one team before finalizing Round ${currentRound}`);
      return;
    }

    if (currentRound === 1) {
      onSelectRound1(selectedTeams);
      setCurrentRound(2);
      setSelectedTeams([]);
    } else {
      onSelectRound2(selectedTeams);
      alert('Round 2 finalized successfully');
    }
  };

  const getTeamsForRound = () => {
    if (currentRound === 1) {
      return teams;
    } else {
      return teams.filter(t => t.round1?.selected);
    }
  };

  const teamsToDisplay = getTeamsForRound();

  const getAverageScore = (team, round) => {
    const scores = team.scores || {};
    const judgeScores = [];

    for (let i = 1; i <= 2; i++) {
      const judgeData = scores[`judge${i}`];
      if (!judgeData) continue;

      const roundKey = `round${round}`;
      if (judgeData[roundKey] !== undefined && judgeData[roundKey] !== null) {
        judgeScores.push(Number(judgeData[roundKey]));
        continue;
      }

      // Backward compatibility with older format: { round: N, score: X }
      if (judgeData.round === round && judgeData.score !== undefined && judgeData.score !== null) {
        judgeScores.push(Number(judgeData.score));
      }
    }

    if (judgeScores.length === 0) return null;
    return judgeScores.reduce((a, b) => a + b, 0) / judgeScores.length;
  };

  const getScoreValue = (team, judgeId, round) => {
    const judgeData = team?.scores?.[judgeId];
    if (!judgeData) return '';

    const roundKey = `round${round}`;
    if (judgeData[roundKey] !== undefined && judgeData[roundKey] !== null) {
      return judgeData[roundKey];
    }

    if (judgeData.round === round && judgeData.score !== undefined && judgeData.score !== null) {
      return judgeData.score;
    }

    return '';
  };

  const handleAdminScoreChange = (teamId, judgeId, rawScore) => {
    if (typeof onUpdateScores !== 'function') return;
    if (rawScore === '') return;

    const parsedScore = Number(rawScore);
    if (!Number.isFinite(parsedScore)) return;

    onUpdateScores(teamId, judgeId, {
      round: currentRound,
      score: Math.min(10, Math.max(0, parsedScore)),
    });
  };

  const clearSelection = () => {
    const confirmClear = window.confirm(
      `Clear saved Round ${currentRound} selected teams?`
    );
    if (!confirmClear) return;
    onClearRoundSelections(currentRound);
    setSelectedTeams([]);
    alert(`Round ${currentRound} selections cleared`);
  };

  const deleteSelectedTeams = () => {
    if (selectedTeams.length === 0) {
      alert('Select at least one team to delete');
      return;
    }
    const confirmDelete = window.confirm(
      `Delete ${selectedTeams.length} selected team(s)? This cannot be undone.`
    );
    if (!confirmDelete) return;
    onDeleteTeams(selectedTeams);
    setSelectedTeams([]);
    alert('Selected teams deleted');
  };

  const deleteSingleTeam = (teamId, teamName) => {
    const confirmDelete = window.confirm(
      `Delete team "${teamName}"? This cannot be undone.`
    );
    if (!confirmDelete) return;
    onDeleteTeams([teamId]);
    setSelectedTeams(prev => prev.filter(id => id !== teamId));
    alert(`Team "${teamName}" deleted`);
  };

  const formatMessageTime = (isoTime) => {
    if (!isoTime) return '-';
    return new Date(isoTime).toLocaleString();
  };

  const deleteContactMessage = async (messageId) => {
    const confirmDelete = window.confirm('Delete this contact message? This cannot be undone.');
    if (!confirmDelete) return;

    if (typeof onDeleteContactMessage !== 'function') return;
    const result = await onDeleteContactMessage(messageId);
    if (!result?.success) {
      alert(result?.message || 'Failed to delete contact message');
      return;
    }
    alert('Contact message deleted');
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Control Panel</h1>
      
      <div className="admin-tabs">
        <button
          className={`tab ${currentRound === 1 ? 'active' : ''}`}
          onClick={() => setCurrentRound(1)}
        >
          Round 1
        </button>
        <button
          className={`tab ${currentRound === 2 ? 'active' : ''}`}
          onClick={() => setCurrentRound(2)}
          disabled={teams.every(t => !t.round1?.selected)}
        >
          Round 2
        </button>
      </div>

      <div className="admin-content">
        <div className="teams-selection">
          <h2>Select Top Teams for Round {currentRound}</h2>
          {currentRound === 2 && teamsToDisplay.length === 0 && (
            <p className="no-qualified-msg">
              No Round 1 qualified teams found. Finalize Round 1 with selected teams first.
            </p>
          )}
          <div className="teams-table">
            <table>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Team Name</th>
                  <th>{currentRound === 2 ? 'Product Name (Admin)' : 'Product'}</th>
                  <th>Judge 1</th>
                  <th>Judge 2</th>
                  <th>Average (Round {currentRound})</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {teamsToDisplay.map(team => (
                  <tr key={team.id} className={selectedTeams.includes(team.id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team.id)}
                        onChange={() => toggleTeamSelection(team.id)}
                      />
                    </td>
                    <td>{team.teamName}</td>
                    <td>
                      {currentRound === 2 ? (
                        <input
                          type="text"
                          value={team.productName || ''}
                          onChange={(e) => onUpdateProductName(team.id, e.target.value)}
                          className="product-input"
                          placeholder="Enter product name"
                        />
                      ) : (
                        team.productName
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={getScoreValue(team, 'judge1', currentRound)}
                        onChange={(e) => handleAdminScoreChange(team.id, 'judge1', e.target.value)}
                        className="score-input"
                        placeholder="-"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={getScoreValue(team, 'judge2', currentRound)}
                        onChange={(e) => handleAdminScoreChange(team.id, 'judge2', e.target.value)}
                        className="score-input"
                        placeholder="-"
                      />
                    </td>
                    <td>{getAverageScore(team, currentRound)?.toFixed(2) ?? '-'}</td>
                    <td>
                      <button
                        type="button"
                        className="row-delete-btn"
                        onClick={() => deleteSingleTeam(team.id, team.teamName)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="action-buttons">
            <button onClick={finalizeRound} className="btn btn-primary">
              Finalize Round {currentRound}
            </button>
            <p className="selected-count">
              {selectedTeams.length} team(s) selected
            </p>
          </div>

          <div className="danger-actions">
            <h3>Clear / Delete</h3>
            <div className="danger-buttons">
              <button onClick={clearSelection} className="btn clear-btn">
                Clear Round Selection
              </button>
              <button onClick={deleteSelectedTeams} className="btn delete-btn">
                Delete Selected Teams
              </button>
            </div>
          </div>

          <div className="report-actions">
            <h3>Reports</h3>
            <button onClick={onDownloadReport} className="btn report-btn">
              Download Registration PDF
            </button>
          </div>
        </div>

        <div className="statistics">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{teams.length}</div>
              <div className="stat-label">Total Teams</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{teams.filter(t => t.round1?.selected).length}</div>
              <div className="stat-label">Round 1 Selected</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{teams.filter(t => t.round2?.selected).length}</div>
              <div className="stat-label">Round 2 Winners</div>
            </div>
          </div>

          <div className="contact-messages">
            <h3>Contact Messages ({contactMessages.length})</h3>
            {contactMessages.length === 0 ? (
              <p className="no-messages">No messages received yet.</p>
            ) : (
              <div className="messages-list">
                {contactMessages.map((message) => (
                  <div key={message.id} className="message-card">
                    <div className="message-top">
                      <strong>{message.name || 'Unknown'}</strong>
                      <span>{formatMessageTime(message.createdAt)}</span>
                    </div>
                    <p><strong>Email:</strong> {message.email || '-'}</p>
                    <p><strong>Phone:</strong> {message.phone || '-'}</p>
                    <p><strong>Subject:</strong> {message.subject || '-'}</p>
                    <p><strong>Message:</strong> {message.message || '-'}</p>
                    <div className="message-actions">
                      <button
                        type="button"
                        className="message-delete-btn"
                        onClick={() => deleteContactMessage(message.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="quick-links">
        <button className="link-btn" onClick={() => onNavigate('home')}>
          Back to Home
        </button>
      </div>

      <style>{`
        .admin-dashboard {
          animation: fadeIn 0.6s ease-out;
        }

        .admin-dashboard h1 {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 2rem;
          text-align: center;
        }

        .admin-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid rgba(34, 211, 238, 0.2);
        }

        .tab {
          padding: 1rem 2rem;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: #8a92a1;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .tab:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tab.active {
          color: #22d3ee;
          border-bottom-color: #22d3ee;
        }

        .tab:hover:not(:disabled) {
          color: #22d3ee;
        }

        .admin-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .teams-selection {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.7) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 12px;
          padding: 2rem;
        }

        .teams-selection h2 {
          color: #22d3ee;
          margin-bottom: 1.5rem;
        }

        .no-qualified-msg {
          margin-top: -0.8rem;
          margin-bottom: 1rem;
          color: #fcd34d;
          font-size: 0.9rem;
          background: rgba(252, 211, 77, 0.1);
          border: 1px solid rgba(252, 211, 77, 0.35);
          border-radius: 6px;
          padding: 0.6rem 0.75rem;
        }

        .teams-table {
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: rgba(34, 211, 238, 0.1);
          color: #22d3ee;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid rgba(34, 211, 238, 0.2);
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid rgba(34, 211, 238, 0.1);
          color: #a0aab9;
        }

        tr.selected {
          background: rgba(34, 211, 238, 0.1);
        }

        input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #22d3ee;
        }

        .product-input {
          width: 100%;
          min-width: 150px;
          padding: 0.45rem 0.6rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(34, 211, 238, 0.35);
          color: #e2e8f0;
          border-radius: 5px;
          font-size: 0.85rem;
        }

        .product-input:focus {
          outline: none;
          border-color: #22d3ee;
          box-shadow: 0 0 8px rgba(34, 211, 238, 0.25);
        }

        .score-input {
          width: 78px;
          padding: 0.45rem 0.55rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(34, 211, 238, 0.35);
          color: #e2e8f0;
          border-radius: 5px;
          font-size: 0.85rem;
          text-align: center;
        }

        .score-input:focus {
          outline: none;
          border-color: #22d3ee;
          box-shadow: 0 0 8px rgba(34, 211, 238, 0.25);
        }

        .action-buttons {
          display: flex;
          margin-top: 1.5rem;
          gap: 1rem;
          align-items: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          padding: 0.8rem 2rem;
        }

        .selected-count {
          color: #8a92a1;
          font-size: 0.9rem;
        }

        .danger-actions {
          margin-top: 1.5rem;
          border-top: 1px solid rgba(239, 68, 68, 0.25);
          padding-top: 1rem;
        }

        .danger-actions h3 {
          color: #fca5a5;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }

        .danger-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .clear-btn {
          background: rgba(148, 163, 184, 0.2);
          border: 1px solid rgba(148, 163, 184, 0.5);
          color: #cbd5e1;
          box-shadow: none;
        }

        .clear-btn:hover {
          background: rgba(148, 163, 184, 0.3);
          transform: translateY(-1px);
        }

        .delete-btn {
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          color: #fff;
          box-shadow: none;
        }

        .delete-btn:hover {
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
          transform: translateY(-1px);
        }

        .row-delete-btn {
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          border: none;
          color: #fff;
          border-radius: 6px;
          padding: 0.4rem 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .row-delete-btn:hover {
          box-shadow: 0 6px 14px rgba(239, 68, 68, 0.3);
          transform: translateY(-1px);
        }

        .report-actions {
          margin-top: 1.5rem;
          border-top: 1px solid rgba(34, 211, 238, 0.2);
          padding-top: 1rem;
        }

        .report-actions h3 {
          color: #22d3ee;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }

        .report-btn {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: #fff;
          box-shadow: none;
        }

        .report-btn:hover {
          box-shadow: 0 8px 20px rgba(14, 165, 233, 0.35);
          transform: translateY(-1px);
        }

        .quick-links {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
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

        .statistics {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.7) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 12px;
          padding: 2rem;
          height: fit-content;
        }

        .statistics h2 {
          color: #22d3ee;
          margin-bottom: 1.5rem;
        }

        .contact-messages {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(34, 211, 238, 0.2);
        }

        .contact-messages h3 {
          color: #22d3ee;
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
        }

        .no-messages {
          color: #8a92a1;
          font-size: 0.9rem;
          margin: 0;
        }

        .messages-list {
          max-height: 260px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .message-card {
          background: rgba(34, 211, 238, 0.08);
          border: 1px solid rgba(34, 211, 238, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
        }

        .message-card p {
          margin: 0.35rem 0;
          color: #cbd5e1;
          font-size: 0.85rem;
          line-height: 1.35;
          word-break: break-word;
        }

        .message-top {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.35rem;
        }

        .message-top strong {
          color: #22d3ee;
          font-size: 0.9rem;
        }

        .message-top span {
          color: #8a92a1;
          font-size: 0.75rem;
          white-space: nowrap;
        }

        .message-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 0.5rem;
        }

        .message-delete-btn {
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          border: none;
          color: #fff;
          border-radius: 6px;
          padding: 0.35rem 0.65rem;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .message-delete-btn:hover {
          box-shadow: 0 6px 14px rgba(239, 68, 68, 0.3);
          transform: translateY(-1px);
        }

        .stats-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat-card {
          background: rgba(34, 211, 238, 0.1);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #8a92a1;
          font-weight: 600;
          font-size: 0.9rem;
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

        @media (max-width: 1024px) {
          .admin-content {
            grid-template-columns: 1fr;
          }

          .statistics {
            height: auto;
          }
        }

        @media (max-width: 768px) {
          .admin-dashboard h1 {
            font-size: 1.8rem;
          }

          table {
            font-size: 0.85rem;
          }

          th, td {
            padding: 0.75rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-primary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

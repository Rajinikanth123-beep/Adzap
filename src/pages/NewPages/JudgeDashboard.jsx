import React, { useState } from 'react';

export default function JudgeDashboard({ teams, onUpdateScores, onClearScores, onNavigate }) {
  const [currentJudge, setCurrentJudge] = useState('judge1');
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const getTeamsForRound = () => {
    if (currentRound === 1) return teams;
    return teams.filter((t) => t.round1?.selected);
  };

  const handleScoreChange = (teamId, score) => {
    onUpdateScores(teamId, currentJudge, {
      round: currentRound,
      score: Math.min(10, Math.max(0, score)),
    });
  };

  const getTeamScore = (team) => {
    if (!team.scores) return '-';
    const judgeScores = team.scores[currentJudge];
    if (!judgeScores) return '-';

    const roundKey = currentRound === 1 ? 'round1' : 'round2';
    const roundScore = judgeScores[roundKey];
    if (roundScore !== undefined && roundScore !== null) return roundScore;

    if (judgeScores.round === currentRound && judgeScores.score !== undefined && judgeScores.score !== null) {
      return judgeScores.score;
    }

    return '-';
  };

  const teamsToDisplay = getTeamsForRound();

  const clearCurrentRoundScores = () => {
    const confirmClear = window.confirm(`Clear all scores for ${currentJudge} in Round ${currentRound}?`);
    if (!confirmClear) return;
    onClearScores(currentJudge, currentRound);
    alert(`Cleared ${currentJudge} scores for Round ${currentRound}`);
  };

  const deleteSelectedTeamScore = () => {
    if (!selectedTeamId) {
      alert('Select a team first');
      return;
    }
    const teamName = teams.find((t) => t.id === selectedTeamId)?.teamName || 'this team';
    const confirmDelete = window.confirm(`Delete ${currentJudge}'s Round ${currentRound} score for ${teamName}?`);
    if (!confirmDelete) return;
    onClearScores(currentJudge, currentRound, [selectedTeamId]);
    alert(`Deleted score for ${teamName}`);
  };

  return (
    <div className="judge-dashboard">
      <h1>Judge Scoring Panel</h1>

      <div className="judge-controls">
        <div className="control-group">
          <label>Judge ID:</label>
          <select value={currentJudge} onChange={(e) => setCurrentJudge(e.target.value)} className="select-field">
            <option value="judge1">Judge 1</option>
            <option value="judge2">Judge 2</option>
          </select>
        </div>

        <div className="control-group">
          <label>Round:</label>
          <div className="round-buttons">
            <button className={`round-btn ${currentRound === 1 ? 'active' : ''}`} onClick={() => setCurrentRound(1)}>
              Round 1
            </button>
            <button
              className={`round-btn ${currentRound === 2 ? 'active' : ''}`}
              onClick={() => setCurrentRound(2)}
              disabled={teams.every((t) => !t.round1?.selected)}
            >
              Round 2
            </button>
          </div>
        </div>
      </div>

      <div className="judge-summary">
        Current Judge: {currentJudge} | Scored: {teamsToDisplay.filter((t) => getTeamScore(t) !== '-').length} / {teamsToDisplay.length} teams
      </div>

      <div className="teams-scoring-container">
        <div className="teams-scoring">
          <h2>Team Scores (Round {currentRound})</h2>
          <div className="scoring-table-container">
            <table className="scoring-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Product</th>
                  <th>Score (0-10)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teamsToDisplay.map((team) => (
                  <tr
                    key={team.id}
                    className={`team-row ${selectedTeamId === team.id ? 'selected' : ''} ${team.poster ? 'has-poster' : ''}`}
                    onClick={() => setSelectedTeamId(team.id)}
                  >
                    <td className="team-name">{team.teamName}</td>
                    <td className="product-name">{team.productName}</td>
                    <td className="score-cell">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={getTeamScore(team) === '-' ? '' : getTeamScore(team)}
                        onChange={(e) => handleScoreChange(team.id, parseFloat(e.target.value) || 0)}
                        className="score-input"
                        placeholder="0"
                      />
                      <span className="score-max">/10</span>
                    </td>
                    <td className="status">
                      {getTeamScore(team) !== '-' ? (
                        <span className="status-badge done">Scored</span>
                      ) : (
                        <span className="status-badge pending">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedTeamId && (
          <div className="poster-preview-panel">
            <div className="poster-header">
              <h3>{teams.find((t) => t.id === selectedTeamId)?.teamName} - Poster</h3>
              <button className="close-btn" onClick={() => setSelectedTeamId(null)}>
                X
              </button>
            </div>
            {teams.find((t) => t.id === selectedTeamId)?.poster ? (
              <div className="poster-container">
                <img src={teams.find((t) => t.id === selectedTeamId)?.poster} alt="Team Poster" className="poster-image" />
              </div>
            ) : (
              <div className="no-poster">
                <p>No poster uploaded yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="judge-info">
        <p>
          <strong>Current Judge:</strong> {currentJudge}
        </p>
        <p>
          Scored: {teamsToDisplay.filter((t) => getTeamScore(t) !== '-').length} / {teamsToDisplay.length} teams
        </p>
      </div>

      <div className="danger-actions">
        <h2>Clear / Delete</h2>
        <div className="danger-buttons">
          <button onClick={clearCurrentRoundScores} className="danger-btn clear-btn">
            Clear All Round Scores
          </button>
          <button onClick={deleteSelectedTeamScore} className="danger-btn delete-btn">
            Delete Selected Team Score
          </button>
        </div>
      </div>

      <div className="quick-links">
        <button className="link-btn" onClick={() => onNavigate('home')}>
          Back to Home
        </button>
      </div>

      <style>{`
        .judge-dashboard { animation: fadeIn 0.6s ease-out; }
        .judge-dashboard h1 {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 2rem;
          text-align: center;
        }
        .judge-controls { display: flex; gap: 2rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
        .control-group { display: flex; align-items: center; gap: 1rem; }
        .control-group label { color: #22d3ee; font-weight: 600; white-space: nowrap; }
        .select-field {
          padding: 0.6rem 1rem;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(34, 211, 238, 0.2);
          color: #fff;
          border-radius: 6px;
          min-width: 150px;
        }
        .round-buttons { display: flex; gap: 0.5rem; }
        .round-btn {
          padding: 0.6rem 1.2rem;
          background: transparent;
          border: 2px solid rgba(34, 211, 238, 0.3);
          color: #22d3ee;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        .round-btn.active {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          border-color: transparent;
        }
        .round-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .judge-summary {
          margin-bottom: 1rem;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(34, 211, 238, 0.3);
          background: rgba(34, 211, 238, 0.08);
          color: #e2e8f0;
          font-weight: 600;
        }
        .teams-scoring-container { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; margin-bottom: 2rem; align-items: start; }
        .teams-scoring {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.7) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 12px;
          padding: 2rem;
        }
        .teams-scoring h2 { color: #22d3ee; margin-bottom: 1.5rem; font-size: 1.5rem; }
        .scoring-table { width: 100%; border-collapse: collapse; }
        .scoring-table th {
          background: rgba(34, 211, 238, 0.1);
          color: #22d3ee;
          padding: 1rem;
          text-align: left;
          border-bottom: 2px solid rgba(34, 211, 238, 0.2);
        }
        .scoring-table td { padding: 1rem; border-bottom: 1px solid rgba(34, 211, 238, 0.1); color: #a0aab9; }
        .team-name { color: #22d3ee; font-weight: 600; }
        .product-name { font-size: 0.9rem; color: #8a92a1; }
        .score-cell { display: flex; align-items: center; gap: 0.5rem; }
        .score-input {
          width: 80px;
          padding: 0.6rem;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(34, 211, 238, 0.2);
          color: #fff;
          border-radius: 6px;
          text-align: center;
        }
        .score-max { color: #8a92a1; font-weight: 600; }
        .status-badge { display: inline-block; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .status-badge.done { background: rgba(34, 197, 94, 0.2); color: #86efac; }
        .status-badge.pending { background: rgba(239, 193, 53, 0.2); color: #fcd34d; }
        .team-row { cursor: pointer; }
        .team-row:hover { background: rgba(34, 211, 238, 0.1); }
        .team-row.selected { background: rgba(34, 211, 238, 0.15); border-left: 4px solid #22d3ee; }
        .poster-preview-panel {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.9) 0%, rgba(34, 211, 238, 0.1) 100%);
          border: 2px solid rgba(34, 211, 238, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          position: sticky;
          top: 100px;
          max-height: 600px;
          display: flex;
          flex-direction: column;
        }
        .poster-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .poster-header h3 { color: #22d3ee; margin: 0; font-size: 1rem; }
        .close-btn { background: transparent; border: none; color: #22d3ee; font-size: 1.2rem; cursor: pointer; }
        .poster-container { flex: 1; overflow-y: auto; border-radius: 8px; background: rgba(0, 0, 0, 0.3); padding: 1rem; }
        .poster-image { width: 100%; height: auto; border-radius: 6px; }
        .no-poster { text-align: center; color: #8a92a1; padding: 2rem 1rem; }
        .judge-info {
          background: rgba(34, 211, 238, 0.1);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          color: #a0aab9;
          text-align: center;
        }
        .danger-actions {
          margin-top: 1.5rem;
          margin-bottom: 2rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.35);
          border-radius: 10px;
          padding: 1rem;
        }
        .danger-actions h2 { color: #fca5a5; margin-bottom: 0.75rem; font-size: 1.1rem; }
        .danger-buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .danger-btn { border: none; border-radius: 6px; padding: 0.65rem 1rem; font-weight: 700; color: #fff; cursor: pointer; }
        .clear-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .delete-btn { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
        .quick-links { display: flex; justify-content: center; margin-top: 2rem; }
        .link-btn {
          padding: 0.8rem 1.5rem;
          background: transparent;
          border: 2px solid rgba(34, 211, 238, 0.3);
          color: #22d3ee;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .judge-dashboard h1 { font-size: 1.8rem; }
          .judge-controls { flex-direction: column; gap: 1rem; }
          .control-group { flex-direction: column; width: 100%; }
          .select-field { width: 100%; }
          .teams-scoring-container { grid-template-columns: 1fr; }
          .poster-preview-panel { max-height: 400px; position: static; }
        }
      `}</style>
    </div>
  );
}

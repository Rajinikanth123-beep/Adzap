import React, { useEffect, useState } from 'react';

const SCORE_CRITERIA = [
  { key: 'creativityAndDesign', label: 'Creativity and Design' },
  { key: 'technicalKnowledge', label: 'Technical Knowledge' },
  { key: 'clarityOfConcept', label: 'Clarity of Concept' },
  { key: 'visualPresentation', label: 'Visual Presentation' },
  { key: 'explanationAndInteraction', label: 'Explanation and Interaction' },
];

export default function JudgeDashboard({ user, teams, onUpdateScores, onClearScores, onNavigate }) {
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [posterPreviewFailed, setPosterPreviewFailed] = useState(false);

  const currentJudge = (() => {
    if (user?.judgeId === 'judge1' || user?.judgeId === 'judge2') return user.judgeId;
    const email = String(user?.email || '').trim().toLowerCase();
    if (email.includes('judge1')) return 'judge1';
    if (email.includes('judge2')) return 'judge2';
    return 'judge1';
  })();

  const getTeamsForRound = () => {
    if (currentRound === 1) return teams;
    return teams.filter((t) => t.round1?.selected);
  };

  const getRoundEntry = (team) => {
    if (!team?.scores) return null;
    const emailKey = String(user?.email || '').trim().toLowerCase();
    const judgeScores = team.scores[currentJudge] || (emailKey ? team.scores[emailKey] : null);
    if (!judgeScores) return null;

    const roundKey = currentRound === 1 ? 'round1' : 'round2';
    if (judgeScores[roundKey] !== undefined && judgeScores[roundKey] !== null) {
      return judgeScores[roundKey];
    }

    if (judgeScores.round === currentRound && judgeScores.score !== undefined && judgeScores.score !== null) {
      return judgeScores.score;
    }

    return null;
  };

  const toCriteriaScores = (entry) => {
    const base = SCORE_CRITERIA.reduce((acc, item) => ({ ...acc, [item.key]: 0 }), {});
    if (!entry || typeof entry !== 'object') return base;
    const source = entry.criteriaScores && typeof entry.criteriaScores === 'object' ? entry.criteriaScores : entry;
    return SCORE_CRITERIA.reduce((acc, item) => {
      const raw = Number(source[item.key]);
      const safe = Number.isFinite(raw) ? Math.min(10, Math.max(0, raw)) : 0;
      acc[item.key] = safe;
      return acc;
    }, { ...base });
  };

  const getTotalFromEntry = (entry) => {
    if (entry === null || entry === undefined) return '-';
    if (typeof entry === 'number') return Number.isFinite(entry) ? entry : '-';
    if (typeof entry === 'object') {
      if (entry.total !== undefined && entry.total !== null) {
        const total = Number(entry.total);
        if (Number.isFinite(total)) return total;
      }
      const criteria = toCriteriaScores(entry);
      return SCORE_CRITERIA.reduce((sum, item) => sum + Number(criteria[item.key] || 0), 0);
    }
    return '-';
  };

  const handleScoreChange = (teamId, criterionKey, rawScore) => {
    const parsed = Number(rawScore);
    const safeScore = Number.isFinite(parsed) ? Math.min(10, Math.max(0, parsed)) : 0;
    const team = teams.find((t) => t.id === teamId);
    const existing = toCriteriaScores(getRoundEntry(team));
    const criteriaScores = {
      ...existing,
      [criterionKey]: safeScore,
    };
    const total = SCORE_CRITERIA.reduce((sum, item) => sum + Number(criteriaScores[item.key] || 0), 0);

    onUpdateScores(teamId, currentJudge, {
      round: currentRound,
      criteriaScores,
      total,
    });
  };

  const getTeamCriteriaScore = (team, criterionKey) => {
    const entry = getRoundEntry(team);
    if (!entry || typeof entry !== 'object') return '';
    const criteria = toCriteriaScores(entry);
    return criteria[criterionKey] ?? '';
  };

  const getTeamTotalScore = (team) => getTotalFromEntry(getRoundEntry(team));

  const teamsToDisplay = getTeamsForRound();
  const resolveMediaUrl = (media) => {
    if (!media) return '';
    if (typeof media === 'string') return media.trim();
    if (typeof media === 'object') {
      if (typeof media.secure_url === 'string') return media.secure_url;
      if (typeof media.url === 'string') return media.url;
      if (typeof media.asset_url === 'string') return media.asset_url;
      if (typeof media.display_url === 'string') return media.display_url;
      if (typeof media.src === 'string') return media.src;
      if (typeof media.poster === 'string') return media.poster;
      if (typeof media.video === 'string') return media.video;
      if (typeof media.value === 'string') return media.value;

      // Fallback for nested payloads from older saves/API responses.
      for (const value of Object.values(media)) {
        const nested = resolveMediaUrl(value);
        if (nested) return nested;
      }
    }
    return '';
  };

  const getMediaType = (url) => {
    const value = String(url || '').toLowerCase();
    if (!value) return 'unknown';
    if (value.includes('/video/upload/')) return 'video';
    if (value.includes('/raw/upload/')) return 'pdf';
    if (value.includes('/image/upload/')) return 'image';
    if (value.startsWith('data:video/')) return 'video';
    if (value.startsWith('data:application/pdf')) return 'pdf';
    if (value.startsWith('data:image/')) return 'image';
    if (/\.(mp4|mov|webm|m4v|avi)(\?|#|$)/i.test(value)) return 'video';
    if (/\.pdf(\?|#|$)/i.test(value)) return 'pdf';
    return 'unknown';
  };
  const isLikelyMediaUrl = (value) => {
    const url = String(value || '').trim().toLowerCase();
    if (!url) return false;
    if (url.startsWith('data:image/') || url.startsWith('data:video/') || url.startsWith('data:application/pdf')) return true;
    if (url.includes('/image/upload/') || url.includes('/video/upload/') || url.includes('/raw/upload/')) return true;
    if (/\.(png|jpe?g|gif|webp|svg|pdf|mp4|mov|webm|m4v|avi|mkv|mpeg|mpg)(\?|#|$)/i.test(url)) return true;
    return false;
  };
  const findMediaUrlDeep = (obj, depth = 0) => {
    if (!obj || depth > 4) return '';
    if (typeof obj === 'string') return isLikelyMediaUrl(obj) ? obj : '';
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const found = findMediaUrlDeep(item, depth + 1);
        if (found) return found;
      }
      return '';
    }
    if (typeof obj === 'object') {
      for (const value of Object.values(obj)) {
        const found = findMediaUrlDeep(value, depth + 1);
        if (found) return found;
      }
    }
    return '';
  };
  const resolveTeamPosterUrl = (team) => {
    if (!team) return '';
    return (
      resolveMediaUrl(team.poster) ||
      resolveMediaUrl(team.posterUrl) ||
      resolveMediaUrl(team.posterURL) ||
      resolveMediaUrl(team.documentUrl) ||
      resolveMediaUrl(team.documentationUrl) ||
      resolveMediaUrl(team.fileUrl) ||
      resolveMediaUrl(team.uploadUrl) ||
      resolveMediaUrl(team.round1?.poster) ||
      resolveMediaUrl(team.round2?.poster) ||
      findMediaUrlDeep(team) ||
      ''
    );
  };
  const selectedTeam = teams.find((t) => String(t.id) === String(selectedTeamId));
  const selectedPosterUrl = resolveTeamPosterUrl(selectedTeam);
  const selectedPosterType = getMediaType(selectedPosterUrl);
  const selectedVideoUrl = resolveMediaUrl(selectedTeam?.video);
  useEffect(() => {
    setPosterPreviewFailed(false);
  }, [selectedPosterUrl]);
  const getParticipantNames = (team) => {
    if (!Array.isArray(team?.members) || team.members.length === 0) return 'No participants added';
    return team.members.map((member) => member?.name || 'Unnamed').join(', ');
  };

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
      <h1>Judge  Scoring Panel</h1>

      <div className="judge-controls">
        <div className="control-group">
          <label>Judge:</label>
          <div className="judge-identity">{user?.name || user?.email || currentJudge}</div>
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

      <div className="teams-scoring-container">
        <div className="teams-scoring">
          <h2>Team Evaluation (Round {currentRound})</h2>
          <div className="scoring-table-container">
            <table className="scoring-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Participants</th>
                  <th>Product</th>
                  {SCORE_CRITERIA.map((criteria) => (
                    <th key={criteria.key} className="criteria-col">
                      {criteria.label} (0-10)
                    </th>
                  ))}
                  <th>Total (0-50)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teamsToDisplay.map((team) => (
                  <tr
                    key={team.id}
                    className={`team-row ${selectedTeamId === team.id ? 'selected' : ''} ${resolveTeamPosterUrl(team) ? 'has-poster' : ''}`}
                    onClick={() => {
                      setSelectedTeamId(team.id);
                      setPosterPreviewFailed(false);
                    }}
                  >
                    <td className="team-name">{team.teamName}</td>
                    <td className="participant-names">{getParticipantNames(team)}</td>
                    <td className="product-name">{team.productName}</td>
                    {SCORE_CRITERIA.map((criteria) => (
                      <td key={`${team.id}-${criteria.key}`} className="score-cell">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={getTeamCriteriaScore(team, criteria.key)}
                          onChange={(e) => handleScoreChange(team.id, criteria.key, e.target.value)}
                          className="score-input"
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td className="total-cell">
                      {getTeamTotalScore(team) === '-' ? '-' : (
                        <span className="total-badge">{Number(getTeamTotalScore(team)).toFixed(1)}/50</span>
                      )}
                    </td>
                    <td className="status">
                      {getTeamTotalScore(team) !== '-' ? (
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
      </div>

      {selectedTeamId && (
        <div className="poster-preview-panel">
          <div className="poster-header">
            <h3>{selectedTeam?.teamName} - Poster & Details</h3>
            <button className="close-btn" onClick={() => setSelectedTeamId(null)}>
              X
            </button>
          </div>
          <div className="team-details-grid">
            <div><strong>Team:</strong> {selectedTeam?.teamName || '-'}</div>
            <div><strong>Product:</strong> {selectedTeam?.productName || '-'}</div>
            <div className="team-details-full"><strong>Participants:</strong> {getParticipantNames(selectedTeam)}</div>
          </div>
          {selectedPosterUrl ? (
            <div className="poster-container">
              {!posterPreviewFailed && selectedPosterType === 'image' && (
                <img
                  src={selectedPosterUrl}
                  alt="Team Poster"
                  className="poster-image"
                  onError={() => setPosterPreviewFailed(true)}
                />
              )}
              {!posterPreviewFailed && selectedPosterType === 'pdf' && (
                <iframe
                  src={selectedPosterUrl}
                  title="Team Poster"
                  className="poster-pdf"
                  onError={() => setPosterPreviewFailed(true)}
                />
              )}
              {!posterPreviewFailed && selectedPosterType === 'video' && (
                <video src={selectedPosterUrl} controls className="poster-video" onError={() => setPosterPreviewFailed(true)}>
                  Your browser does not support the video tag.
                </video>
              )}
              {(selectedPosterType === 'unknown' || posterPreviewFailed) && (
                <a href={selectedPosterUrl} target="_blank" rel="noreferrer" className="poster-open-link">
                  Open Poster File
                </a>
              )}
              {selectedPosterType !== 'unknown' && (
                <div style={{ marginTop: '0.7rem' }}>
                  <a href={selectedPosterUrl} target="_blank" rel="noreferrer" className="poster-open-link">
                    Open Poster in New Tab
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="no-poster">
              <p>No poster uploaded yet</p>
            </div>
          )}
          {selectedVideoUrl && (
            <div className="poster-container" style={{ marginTop: '0.8rem' }}>
              <video src={selectedVideoUrl} controls className="poster-video">
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      )}

      <div className="judge-info">
        <p>
          <strong>Current Judge:</strong> {currentJudge}
        </p>
        <p>
          Scored: {teamsToDisplay.filter((t) => getTeamTotalScore(t) !== '-').length} / {teamsToDisplay.length} teams
        </p>
      </div>

      <div className="danger-actions">
        <h2>Clear / Delete</h2>
        <div className="danger-buttons">
          <button onClick={clearCurrentRoundScores} className="danger-btn clear-btn">
            Clear All Round Scores
          </button>
          <button onClick={deleteSelectedTeamScore} className="danger-btn delete-btn">
            Delete Selected Team Evaluation
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
        .judge-identity {
          padding: 0.6rem 1rem;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(34, 211, 238, 0.2);
          color: #e2e8f0;
          border-radius: 6px;
          min-width: 150px;
          font-weight: 600;
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
        .teams-scoring-container { margin-bottom: 1.2rem; }
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
        .participant-names { font-size: 0.85rem; color: #cbd5e1; max-width: 280px; }
        .scoring-table-container { overflow-x: auto; }
        .criteria-col { min-width: 130px; }
        .score-cell { text-align: center; }
        .score-input {
          width: 70px;
          padding: 0.6rem;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(34, 211, 238, 0.2);
          color: #fff;
          border-radius: 6px;
          text-align: center;
        }
        .total-cell { text-align: center; }
        .total-badge {
          display: inline-block;
          padding: 0.35rem 0.7rem;
          border-radius: 999px;
          background: rgba(34, 211, 238, 0.15);
          border: 1px solid rgba(34, 211, 238, 0.35);
          color: #67e8f9;
          font-weight: 700;
          font-size: 0.82rem;
        }
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
          padding: 1rem;
          max-width: 640px;
          margin: 0 auto 2rem auto;
        }
        .poster-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .poster-header h3 { color: #22d3ee; margin: 0; font-size: 1rem; }
        .team-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem 1.2rem;
          color: #cbd5e1;
          margin-bottom: 0.9rem;
          font-size: 0.92rem;
        }
        .team-details-full { grid-column: 1 / -1; }
        .close-btn { background: transparent; border: none; color: #22d3ee; font-size: 1.2rem; cursor: pointer; }
        .poster-container { border-radius: 8px; background: rgba(0, 0, 0, 0.3); padding: 0.8rem; max-width: 560px; }
        .poster-image { width: 100%; max-width: 520px; max-height: 420px; object-fit: contain; height: auto; border-radius: 6px; }
        .poster-pdf,
        .poster-video { width: 100%; max-width: 520px; height: 320px; border: none; border-radius: 6px; background: rgba(0, 0, 0, 0.6); }
        .poster-open-link {
          display: inline-block;
          padding: 0.7rem 0.9rem;
          border: 1px solid rgba(34, 211, 238, 0.6);
          border-radius: 6px;
          color: #22d3ee;
          text-decoration: none;
          font-weight: 600;
        }
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
          .judge-identity { width: 100%; }
          .team-details-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

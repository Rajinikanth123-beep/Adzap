import React, { useState } from 'react';

export default function PresentationPage({ teams, onNavigate }) {
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isPosterPageOpen, setIsPosterPageOpen] = useState(false);

  const teamsForRound = selectedRound === 1
    ? teams
    : teams.filter((t) => t.round1?.selected);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  if (selectedTeam && selectedTeam.poster && isPosterPageOpen) {
    return (
      <div className="poster-page-view">
        <div className="poster-page-header">
          <h1>{selectedTeam.teamName} - Poster</h1>
          <button
            type="button"
            className="poster-page-back-btn"
            onClick={() => setIsPosterPageOpen(false)}
          >
            Back
          </button>
        </div>

        <div className="poster-page-content">
          <img
            src={selectedTeam.poster}
            alt={`${selectedTeam.teamName} Poster`}
            className="poster-page-image"
          />
        </div>

        <style>{`
          .poster-page-view {
            min-height: calc(100vh - 140px);
            display: flex;
            flex-direction: column;
            gap: 1rem;
            animation: fadeIn 0.35s ease-out;
          }

          .poster-page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
          }

          .poster-page-header h1 {
            margin: 0;
            color: #22d3ee;
            font-size: 1.5rem;
          }

          .poster-page-back-btn {
            padding: 0.7rem 1.1rem;
            background: transparent;
            border: 2px solid rgba(34, 211, 238, 0.4);
            color: #22d3ee;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
          }

          .poster-page-back-btn:hover {
            border-color: #22d3ee;
            box-shadow: 0 4px 12px rgba(34, 211, 238, 0.25);
          }

          .poster-page-content {
            flex: 1;
            background: rgba(0, 0, 0, 0.45);
            border: 2px solid rgba(34, 211, 238, 0.25);
            border-radius: 12px;
            padding: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .poster-page-image {
            max-width: 100%;
            max-height: calc(100vh - 250px);
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 8px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="presentation-page">
      <h1>Team Presentations</h1>

      <div className="round-selector">
        <button
          className={`round-btn ${selectedRound === 1 ? 'active' : ''}`}
          onClick={() => {
            setSelectedRound(1);
            setSelectedTeamId(null);
            setIsPosterPageOpen(false);
          }}
        >
          Round 1: All Teams
        </button>
        <button
          className={`round-btn ${selectedRound === 2 ? 'active' : ''}`}
          onClick={() => {
            setSelectedRound(2);
            setSelectedTeamId(null);
            setIsPosterPageOpen(false);
          }}
          disabled={teams.length === 0}
        >
          Round 2: Qualified Teams
        </button>
      </div>

      <div className="presentation-container">
        <div className="teams-list-section">
          <h2>Teams (Round {selectedRound})</h2>
          <div className="teams-grid">
            {teamsForRound.map((team) => (
              <div
                key={team.id}
                className={`team-card ${selectedTeamId === team.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTeamId(team.id);
                  setIsPosterPageOpen(false);
                }}
              >
                <div className="team-card-header">
                  <h3>{team.teamName}</h3>
                  {team.poster && <span className="poster-badge">Poster</span>}
                </div>

                <p className="team-product">{team.productName}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedTeam && (
          <div className="poster-section">
            <div className="poster-header">
              <h2>{selectedTeam.teamName}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setSelectedTeamId(null);
                  setIsPosterPageOpen(false);
                }}
              >
                X
              </button>
            </div>

            <div className="poster-content">
              {selectedTeam.poster ? (
                <div className="poster-box">
                  <img
                    src={selectedTeam.poster}
                    alt={`${selectedTeam.teamName} Poster`}
                    className="poster-image"
                  />
                  <button
                    type="button"
                    className="poster-open-btn"
                    onClick={() => setIsPosterPageOpen(true)}
                  >
                    Open Poster Page
                  </button>
                </div>
              ) : (
                <div className="no-poster">
                  <p>No poster uploaded</p>
                </div>
              )}

              <div className="team-details-box">
                <h3>Team Details</h3>
                <div className="detail-row">
                  <span className="label">Product:</span>
                  <span className="value">{selectedTeam.productName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Team Size:</span>
                  <span className="value">{selectedTeam.members?.length || 0} members</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button className="back-btn" onClick={() => onNavigate('home')}>
        {'<- Back to Home'}
      </button>

      <style>{`
        .presentation-page {
          padding: 2rem;
          animation: fadeIn 0.6s ease-out;
        }

        .presentation-page h1 {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 2rem;
          text-align: center;
        }

        .round-selector {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .round-btn {
          padding: 0.8rem 1.5rem;
          background: transparent;
          border: 2px solid rgba(34, 211, 238, 0.3);
          color: #22d3ee;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .round-btn.active {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }

        .round-btn:hover:not(:disabled) {
          border-color: #22d3ee;
          box-shadow: 0 0 8px rgba(34, 211, 238, 0.3);
        }

        .round-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .presentation-container {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
          margin-bottom: 2rem;
          align-items: start;
        }

        .teams-list-section h2,
        .poster-section h2 {
          color: #22d3ee;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .teams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }

        .team-card {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.7) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .team-card:hover {
          border-color: #22d3ee;
          box-shadow: 0 8px 20px rgba(34, 211, 238, 0.2);
          transform: translateY(-4px);
        }

        .team-card.selected {
          border-color: #22d3ee;
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
          box-shadow: 0 8px 24px rgba(34, 211, 238, 0.3);
        }

        .team-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .team-card-header h3 {
          color: #22d3ee;
          margin: 0;
          font-size: 0.95rem;
          word-break: break-word;
        }

        .poster-badge {
          font-size: 0.75rem;
          background: rgba(34, 211, 238, 0.2);
          color: #22d3ee;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
        }

        .team-product {
          color: #8a92a1;
          font-size: 0.8rem;
          margin: 0.4rem 0;
          min-height: 2em;
        }

        .poster-section {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.9) 0%, rgba(34, 211, 238, 0.1) 100%);
          border: 2px solid rgba(34, 211, 238, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          position: sticky;
          top: 100px;
          max-height: 520px;
          display: flex;
          flex-direction: column;
        }

        .poster-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          border-bottom: 2px solid rgba(34, 211, 238, 0.2);
          padding-bottom: 1rem;
        }

        .poster-header h2 {
          color: #22d3ee;
          margin: 0;
          font-size: 1.1rem;
          word-break: break-word;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: #22d3ee;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .close-btn:hover {
          color: #06b6d4;
        }

        .poster-content {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .poster-box {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 0.8rem;
          min-height: 200px;
        }

        .poster-image {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(34, 211, 238, 0.2);
        }

        .poster-open-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 0.5rem 0.9rem;
          background: rgba(6, 182, 212, 0.85);
          border: 1px solid rgba(34, 211, 238, 0.8);
          color: #fff;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.2s ease;
          z-index: 2;
        }

        .poster-open-btn:hover {
          background: rgba(8, 145, 178, 0.95);
        }

        .no-poster {
          text-align: center;
          color: #8a92a1;
          padding: 2rem 1rem;
          font-size: 0.9rem;
        }

        .team-details-box {
          background: rgba(34, 211, 238, 0.05);
          border: 1px solid rgba(34, 211, 238, 0.2);
          border-radius: 6px;
          padding: 1rem;
        }

        .team-details-box h3 {
          color: #22d3ee;
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(34, 211, 238, 0.1);
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row .label {
          color: #8a92a1;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .detail-row .value {
          color: #22d3ee;
          font-weight: 600;
        }

        .back-btn {
          display: block;
          margin-top: 2rem;
          padding: 0.8rem 1.5rem;
          background: transparent;
          border: 2px solid rgba(34, 211, 238, 0.3);
          color: #22d3ee;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
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
          .presentation-page h1 {
            font-size: 1.8rem;
          }

          .presentation-container {
            grid-template-columns: 1fr;
          }

          .teams-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }

          .poster-section {
            position: static;
            max-height: none;
          }
        }
      `}</style>
    </div>
  );
}

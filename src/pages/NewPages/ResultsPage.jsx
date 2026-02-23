import React from 'react';

export default function ResultsPage({ teams, onNavigate }) {
  const getAverageScore = (team, round) => {
    const scores = team.scores || {};
    const judgeScores = [];

    for (let i = 1; i <= 2; i++) {
      const judgeScoreData = scores[`judge${i}`];
      const value = judgeScoreData?.[`round${round}`];
      if (value !== undefined && value !== null) {
        judgeScores.push(Number(value));
      }
    }

    if (judgeScores.length === 0) return null;
    return judgeScores.reduce((a, b) => a + b, 0) / judgeScores.length;
  };

  const getRoundTable = (round, baseTeams) =>
    baseTeams
      .map(team => ({
        ...team,
        average: getAverageScore(team, round),
      }))
      .filter(team => team.average !== null)
      .sort((a, b) => b.average - a.average);

  const round1Table = getRoundTable(1, teams);
  const round2BaseTeams = teams.filter(team => team.round1?.selected);
  const round2Table = getRoundTable(2, round2BaseTeams);

  return (
    <div className="results-page">
      <h1>Results</h1>

      <section className="results-card">
        <h2>Round 1 Leaderboard</h2>
        {round1Table.length === 0 ? (
          <p className="empty-text">No Round 1 scores available yet.</p>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Product</th>
                <th>Average</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {round1Table.map((team, index) => (
                <tr key={team.id}>
                  <td>#{index + 1}</td>
                  <td>{team.teamName}</td>
                  <td>{team.productName}</td>
                  <td>{team.average.toFixed(2)}/10</td>
                  <td>{team.round1?.selected ? 'Qualified' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="results-card">
        <h2>Round 2 Leaderboard</h2>
        {round2Table.length === 0 ? (
          <p className="empty-text">No Round 2 scores available yet.</p>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Product</th>
                <th>Average</th>
                <th>Final Status</th>
              </tr>
            </thead>
            <tbody>
              {round2Table.map((team, index) => (
                <tr key={team.id}>
                  <td>#{index + 1}</td>
                  <td>{team.teamName}</td>
                  <td>{team.productName}</td>
                  <td>{team.average.toFixed(2)}/10</td>
                  <td>{team.round2?.selected ? 'Winner List' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="quick-links">
        <button className="link-btn" onClick={() => onNavigate('home')}>
          Back to Home
        </button>
      </div>

      <style>{`
        .results-page { animation: fadeIn 0.6s ease-out; }
        .results-page h1 {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 2rem;
          color: #22d3ee;
        }
        .results-card {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.75) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .results-card h2 {
          color: #22d3ee;
          margin-bottom: 1rem;
        }
        .results-table {
          width: 100%;
          border-collapse: collapse;
        }
        .results-table th, .results-table td {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(34, 211, 238, 0.12);
          text-align: left;
          color: #cbd5e1;
        }
        .results-table th {
          color: #22d3ee;
          font-weight: 700;
          background: rgba(34, 211, 238, 0.08);
        }
        .empty-text {
          color: #94a3b8;
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
        }
        .link-btn:hover {
          border-color: #22d3ee;
          box-shadow: 0 4px 12px rgba(34, 211, 238, 0.3);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

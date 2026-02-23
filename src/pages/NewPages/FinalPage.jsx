import React from 'react';

export default function FinalPage({ teams, onNavigate }) {
  const getAverageScore = (team, round) => {
    const scores = team.scores || {};
    const judgeScores = [];

    for (let i = 1; i <= 2; i++) {
      const value = scores[`judge${i}`]?.[`round${round}`];
      if (value !== undefined && value !== null) {
        judgeScores.push(Number(value));
      }
    }

    if (judgeScores.length === 0) return null;
    return judgeScores.reduce((a, b) => a + b, 0) / judgeScores.length;
  };

  const finalists = teams.filter(team => team.round1?.selected);
  const ranking = finalists
    .map(team => ({ ...team, average: getAverageScore(team, 2) }))
    .filter(team => team.average !== null)
    .sort((a, b) => b.average - a.average);

  const winnerList = teams.filter(team => team.round2?.selected);

  return (
    <div className="final-page">
      <h1>Final Section</h1>

      {winnerList.length > 0 && (
        <section className="celebration-banner">
          <div className="sparkles" />
          <h2>Congratulations Winners!</h2>
          <p>Round 2 is completed. Celebrating the winning teams.</p>
          <div className="winner-chips">
            {winnerList.map((team, index) => (
              <span key={team.id} className="winner-chip">
                {index === 0 ? '🏆' : '🎉'} {team.teamName}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="final-card">
        <h2>Finalists</h2>
        {finalists.length === 0 ? (
          <p className="empty-text">No finalists selected yet.</p>
        ) : (
          <ul className="simple-list">
            {finalists.map(team => (
              <li key={team.id}>{team.teamName} - {team.productName}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="final-card">
        <h2>Final Ranking (By Round 2 Average)</h2>
        {ranking.length === 0 ? (
          <p className="empty-text">No final scores available yet.</p>
        ) : (
          <table className="final-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Team</th>
                <th>Product</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((team, index) => (
                <tr key={team.id}>
                  <td>#{index + 1}</td>
                  <td>{team.teamName}</td>
                  <td>{team.productName}</td>
                  <td>{team.average.toFixed(2)}/10</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="final-card">
        <h2>Declared Winners</h2>
        {winnerList.length === 0 ? (
          <p className="empty-text">No final winners declared yet.</p>
        ) : (
          <div className="winner-grid">
            {winnerList.map((team, index) => (
              <div key={team.id} className="winner-card">
                <div className="winner-rank">{index === 0 ? '🏆 Winner' : `🎖️ Winner ${index + 1}`}</div>
                <h3>{team.teamName}</h3>
                <p>{team.productName}</p>
                <div className="winner-glow" />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="quick-links">
        <button className="link-btn" onClick={() => onNavigate('home')}>
          Back to Home
        </button>
      </div>

      <style>{`
        .final-page { animation: fadeIn 0.6s ease-out; }
        .final-page h1 {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 2rem;
          color: #22d3ee;
        }
        .final-card {
          background: linear-gradient(135deg, rgba(10, 15, 35, 0.75) 0%, rgba(34, 211, 238, 0.05) 100%);
          border: 2px solid rgba(34, 211, 238, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .celebration-banner {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(250, 204, 21, 0.18) 0%, rgba(34, 211, 238, 0.14) 100%);
          border: 2px solid rgba(250, 204, 21, 0.45);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .celebration-banner h2 {
          margin: 0 0 0.35rem 0;
          color: #fde68a;
          font-size: 1.6rem;
        }
        .celebration-banner p {
          margin: 0;
          color: #e2e8f0;
        }
        .winner-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          justify-content: center;
          margin-top: 0.9rem;
        }
        .winner-chip {
          display: inline-block;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(250, 204, 21, 0.5);
          border-radius: 999px;
          color: #fde68a;
          padding: 0.35rem 0.8rem;
          font-weight: 700;
          animation: popIn 0.45s ease-out;
        }
        .sparkles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 10% 20%, rgba(250, 204, 21, 0.8) 0 2px, transparent 3px),
            radial-gradient(circle at 25% 70%, rgba(34, 211, 238, 0.85) 0 2px, transparent 3px),
            radial-gradient(circle at 60% 35%, rgba(250, 204, 21, 0.8) 0 2px, transparent 3px),
            radial-gradient(circle at 80% 65%, rgba(34, 211, 238, 0.85) 0 2px, transparent 3px),
            radial-gradient(circle at 92% 25%, rgba(250, 204, 21, 0.8) 0 2px, transparent 3px);
          animation: twinkle 1.8s ease-in-out infinite alternate;
        }
        .final-card h2 {
          color: #22d3ee;
          margin-bottom: 1rem;
        }
        .final-table {
          width: 100%;
          border-collapse: collapse;
        }
        .final-table th, .final-table td {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(34, 211, 238, 0.12);
          text-align: left;
          color: #cbd5e1;
        }
        .final-table th {
          color: #22d3ee;
          font-weight: 700;
          background: rgba(34, 211, 238, 0.08);
        }
        .simple-list {
          margin: 0;
          padding-left: 1.2rem;
          color: #cbd5e1;
        }
        .simple-list li { margin-bottom: 0.35rem; }
        .empty-text { color: #94a3b8; }
        .winner-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .winner-card {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(250, 204, 21, 0.18) 0%, rgba(34, 211, 238, 0.14) 100%);
          border: 1px solid rgba(250, 204, 21, 0.5);
          border-radius: 12px;
          padding: 1rem;
          animation: winnerPulse 2.2s ease-in-out infinite;
        }
        .winner-rank {
          display: inline-block;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.25);
          color: #fde68a;
          font-size: 0.78rem;
          font-weight: 700;
          margin-bottom: 0.6rem;
        }
        .winner-card h3 {
          margin: 0 0 0.25rem 0;
          color: #fef3c7;
          font-size: 1.05rem;
        }
        .winner-card p {
          margin: 0;
          color: #e2e8f0;
          font-size: 0.9rem;
        }
        .winner-glow {
          position: absolute;
          width: 120px;
          height: 120px;
          right: -35px;
          bottom: -45px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(250, 204, 21, 0.35) 0%, transparent 70%);
          pointer-events: none;
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
        @keyframes popIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes twinkle {
          from { opacity: 0.45; }
          to { opacity: 0.95; }
        }
        @keyframes winnerPulse {
          0%, 100% { transform: translateY(0); box-shadow: 0 0 0 rgba(250, 204, 21, 0.2); }
          50% { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(250, 204, 21, 0.25); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

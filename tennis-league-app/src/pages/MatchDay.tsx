import React, { useEffect, useState } from 'react';
import { MatchDay, CourtAssignment, Player } from '@/lib/match';

interface DoublesMatch {
  courtNumber: number;
  player1: string;
  player1Rating: number;
  player2: string;
  player2Rating: number;
  player3: string;
  player3Rating: number;
  player4: string;
  player4Rating: number;
  team1Score: number;
  team2Score: number;
  winnerTeam: 1 | 2 | null;
  recorded: boolean;
}

export default function MatchDayPage() {
  const [numCourts, setNumCourts] = useState<number>(6);
  const [matches, setMatches] = useState<DoublesMatch[]>([]);
  const [ratingUpdates, setRatingUpdates] = useState<{ [playerId: string]: { old: number; new: number } }>({});

  // Initialize court matches
  useEffect(() => {
    const initialMatches: DoublesMatch[] = Array.from({ length: numCourts }, (_, idx) => {
      const courtNum = idx + 1;
      return {
        courtNumber: courtNum,
        player1: `Player ${courtNum}A`,
        player1Rating: 1200 - (courtNum * 20),
        player2: `Player ${courtNum}B`,
        player2Rating: 1190 - (courtNum * 20),
        player3: `Player ${courtNum}C`,
        player3Rating: 1180 - (courtNum * 20),
        player4: `Player ${courtNum}D`,
        player4Rating: 1170 - (courtNum * 20),
        team1Score: 0,
        team2Score: 0,
        winnerTeam: null,
        recorded: false,
      };
    });
    setMatches(initialMatches);
  }, [numCourts]);

  const handlePlayerChange = (courtNum: number, field: string, value: string | number) => {
    setMatches((prev) =>
      prev.map((m) => (m.courtNumber === courtNum ? { ...m, [field]: value } : m))
    );
  };

  const handleRecordScore = (courtNum: number) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.courtNumber === courtNum) {
          let winner: 1 | 2 | null = null;
          if (m.team1Score > m.team2Score) {
            winner = 1;
          } else if (m.team2Score > m.team1Score) {
            winner = 2;
          }
          
          if (winner) {
            // Calculate rating changes
            const p1Id = `c${courtNum}_p1`;
            const p2Id = `c${courtNum}_p2`;
            const p3Id = `c${courtNum}_p3`;
            const p4Id = `c${courtNum}_p4`;

            setRatingUpdates((updates) => ({
              ...updates,
              [p1Id]: { old: m.player1Rating, new: m.player1Rating + (winner === 1 ? 10 : -5) },
              [p2Id]: { old: m.player2Rating, new: m.player2Rating + (winner === 1 ? 10 : -5) },
              [p3Id]: { old: m.player3Rating, new: m.player3Rating + (winner === 2 ? 10 : -5) },
              [p4Id]: { old: m.player4Rating, new: m.player4Rating + (winner === 2 ? 10 : -5) },
            }));
          }

          return { ...m, winnerTeam: winner, recorded: !!winner };
        }
        return m;
      })
    );
  };

  const resetMatch = (courtNum: number) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.courtNumber === courtNum
          ? { ...m, team1Score: 0, team2Score: 0, winnerTeam: null, recorded: false }
          : m
      )
    );
    // Remove rating updates for this court
    setRatingUpdates((prev) => {
      const copy = { ...prev };
      delete copy[`c${courtNum}_p1`];
      delete copy[`c${courtNum}_p2`];
      delete copy[`c${courtNum}_p3`];
      delete copy[`c${courtNum}_p4`];
      return copy;
    });
  };

  return (
    <div className="glass" style={{ margin: '2rem', padding: '2rem', color: '#fff' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.8rem', color: '#10b981' }}>
        🎾 Match Day Court & Score Entry
      </h2>

      {/* Court Count Selector */}
      <div className="glass" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <span style={{ fontWeight: '600' }}>Active Courts:</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => setNumCourts(num)}
              className="button"
              style={{
                background: numCourts === num ? 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' : 'rgba(255,255,255,0.05)',
                color: '#white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: numCourts === num ? '0 0 10px rgba(16,185,129,0.4)' : 'none',
              }}
            >
              {num} {num === 1 ? 'Court' : 'Courts'}
            </button>
          ))}
        </div>
      </div>

      {/* Courts Entry List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {matches.map((match) => {
          const cNum = match.courtNumber;
          return (
            <div
              key={cNum}
              className="glass"
              style={{
                padding: '1.5rem',
                border: match.recorded ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                background: match.recorded ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.01)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#3b82f6' }}>Court {cNum}</h3>
                {match.recorded && (
                  <span style={{ fontSize: '0.8rem', backgroundColor: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                    Winner: Team {match.winnerTeam}
                  </span>
                )}
              </div>

              {/* Team 1 Entry */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <strong style={{ fontSize: '0.9rem', color: '#10b981' }}>Team 1 (Doubles Pair 1)</strong>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={match.player1}
                    onChange={(e) => handlePlayerChange(cNum, 'player1', e.target.value)}
                    placeholder="Player A"
                    disabled={match.recorded}
                    style={{ flex: 2, padding: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    value={match.player1Rating}
                    onChange={(e) => handlePlayerChange(cNum, 'player1Rating', parseInt(e.target.value) || 0)}
                    placeholder="Rating"
                    disabled={match.recorded}
                    style={{ flex: 1, padding: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: '4px', textAlign: 'center' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={match.player2}
                    onChange={(e) => handlePlayerChange(cNum, 'player2', e.target.value)}
                    placeholder="Player B"
                    disabled={match.recorded}
                    style={{ flex: 2, padding: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    value={match.player2Rating}
                    onChange={(e) => handlePlayerChange(cNum, 'player2Rating', parseInt(e.target.value) || 0)}
                    placeholder="Rating"
                    disabled={match.recorded}
                    style={{ flex: 1, padding: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: '4px', textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* Team 2 Entry */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <strong style={{ fontSize: '0.9rem', color: '#10b981' }}>Team 2 (Doubles Pair 2)</strong>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={match.player3}
                    onChange={(e) => handlePlayerChange(cNum, 'player3', e.target.value)}
                    placeholder="Player C"
                    disabled={match.recorded}
                    style={{ flex: 2, padding: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    value={match.player3Rating}
                    onChange={(e) => handlePlayerChange(cNum, 'player3Rating', parseInt(e.target.value) || 0)}
                    placeholder="Rating"
                    disabled={match.recorded}
                    style={{ flex: 1, padding: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: '4px', textAlign: 'center' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={match.player4}
                    onChange={(e) => handlePlayerChange(cNum, 'player4', e.target.value)}
                    placeholder="Player D"
                    disabled={match.recorded}
                    style={{ flex: 2, padding: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    value={match.player4Rating}
                    onChange={(e) => handlePlayerChange(cNum, 'player4Rating', parseInt(e.target.value) || 0)}
                    placeholder="Rating"
                    disabled={match.recorded}
                    style={{ flex: 1, padding: '0.4rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: '4px', textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* Score Input & Record Actions */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Match Score (Games):</span>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={match.team1Score}
                      onChange={(e) => handlePlayerChange(cNum, 'team1Score', parseInt(e.target.value) || 0)}
                      disabled={match.recorded}
                      style={{ width: '40px', padding: '0.3rem', textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={match.team2Score}
                      onChange={(e) => handlePlayerChange(cNum, 'team2Score', parseInt(e.target.value) || 0)}
                      disabled={match.recorded}
                      style={{ width: '40px', padding: '0.3rem', textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                {!match.recorded ? (
                  <button
                    onClick={() => handleRecordScore(cNum)}
                    className="button-primary"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: 'none',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Record Score & Winners
                  </button>
                ) : (
                  <button
                    onClick={() => resetMatch(cNum)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Clear / Edit Match
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ratings Change Summary */}
      {Object.keys(ratingUpdates).length > 0 && (
        <div className="glass" style={{ marginTop: '2.5rem', padding: '1.5rem', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.02)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#10b981' }}>📈 Live Rating Changes (Calculated)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {matches.map((m) => {
              const c = m.courtNumber;
              const p1 = ratingUpdates[`c${c}_p1`];
              const p2 = ratingUpdates[`c${c}_p2`];
              const p3 = ratingUpdates[`c${c}_p3`];
              const p4 = ratingUpdates[`c${c}_p4`];
              
              if (!p1 && !p2 && !p3 && !p4) return null;

              return (
                <div key={c} className="glass" style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.1)' }}>
                  <strong style={{ color: '#3b82f6', fontSize: '0.85rem' }}>Court {c} Updates</strong>
                  <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem' }}>
                    {p1 && <div>{m.player1}: {p1.old} → <span style={{ color: p1.new > p1.old ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{p1.new}</span></div>}
                    {p2 && <div>{m.player2}: {p2.old} → <span style={{ color: p2.new > p2.old ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{p2.new}</span></div>}
                    {p3 && <div>{m.player3}: {p3.old} → <span style={{ color: p3.new > p3.old ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{p3.new}</span></div>}
                    {p4 && <div>{m.player4}: {p4.old} → <span style={{ color: p4.new > p4.old ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{p4.new}</span></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

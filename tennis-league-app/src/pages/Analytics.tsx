import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/app-store';
import { getAiSuggestions } from '@/lib/aiRecommendation';
import { MatchDay } from '@/lib/match';

export default function Analytics() {
  const { user } = useApp();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // For demo we reuse the stub matchDay data from MatchDay page
  const stubMatchDay: MatchDay = {
    id: 'demo',
    date: new Date().toISOString().split('T')[0],
    courts: [],
  };

  useEffect(() => {
    if (!user) return;
    getAiSuggestions(stubMatchDay)
      .then((s) => setSuggestions(s))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="glass" style={{ margin: '2rem', padding: '2rem' }}>
      <h2>Analytics & AI Recommendations</h2>
      {loading && <p>Loading suggestions…</p>}
      {!loading && suggestions.length === 0 && <p>No suggestions available.</p>}
      <ul>
        {suggestions.map((s, i) => (
          <li key={i}>
            {s.pair?.join(' & ')} → Court {s.court} ({s.reason})
          </li>
        ))}
      </ul>
    </div>
  );
}

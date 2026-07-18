import React from 'react';
import { useApp } from '@/lib/app-store';
import { Player } from '@/lib/match';

// Mock ranking data – in a real app this would be fetched from Supabase
const mockPlayers: Player[] = [
  { id: 'p1', name: 'Alice', rating: 1220 },
  { id: 'p2', name: 'Beth', rating: 1195 },
  { id: 'p3', name: 'Carol', rating: 1170 },
  { id: 'p4', name: 'Dana', rating: 1155 },
  { id: 'p5', name: 'Eve', rating: 1130 },
];

export default function Rankings() {
  const { user } = useApp();
  return (
    <div className="glass" style={{ margin: '2rem', padding: '2rem' }}>
      <h2>Player Rankings</h2>
      <table className="glass" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-muted)' }}>
            <th>#</th>
            <th>Player</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {mockPlayers.map((p, idx) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--color-muted)' }}>
              <td>{idx + 1}</td>
              <td>{p.name}</td>
              <td>{p.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/lib/app-store';

export default function Home() {
  const { user, loading } = useApp();

  return (
    <div className="glass" style={{ margin: '2rem', padding: '2rem' }}>
      <h1 style={{ color: 'var(--color-primary)' }}>Eunice Ladies Tennis League</h1>
      <p>Welcome {user ? user.email : 'guest'}!{user ? '' : ' Please sign in to manage matches.'}</p>
      <nav style={{ marginTop: '1rem' }}>
        <Link to="/rankings" className="button-primary" style={{ marginRight: '0.5rem' }}>View Rankings</Link>
        {user && <Link to="/matchday" className="button-primary" style={{ marginRight: '0.5rem' }}>Today's Matches</Link>}
        {user && <Link to="/analytics" className="button-accent">Analytics & AI</Link>}
      </nav>
    </div>
  );
}

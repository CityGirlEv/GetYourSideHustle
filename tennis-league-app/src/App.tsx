import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import MatchDay from './pages/MatchDay';
import Rankings from './pages/Rankings';
import Analytics from './pages/Analytics';
import SignInForm from './components/auth/SignInForm';
import SignUpForm from './components/auth/SignUpForm';
import { useApp } from '@/lib/app-store';

function App() {
  const { user } = useApp();
  const isAuthenticated = !!user;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        {/* Protected routes */}
        <Route
          path="/matchday"
          element={isAuthenticated ? <MatchDay /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/rankings"
          element={<Rankings />}
        />
        <Route
          path="/analytics"
          element={isAuthenticated ? <Analytics /> : <Navigate to="/signin" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

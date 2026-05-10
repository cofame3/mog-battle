import React, { useState, useEffect } from 'react';
import BattleArena from './components/BattleArena';
import AuthForm from './components/AuthForm';

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // Восстановить сессию при перезагрузке страницы
  useEffect(() => {
    const stored = localStorage.getItem('mog_user');
    const token = localStorage.getItem('mog_token');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('mog_user');
        localStorage.removeItem('mog_token');
      }
    }
    setChecking(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mog_token');
    localStorage.removeItem('mog_user');
    setUser(null);
  };

  if (checking) return null; // Кратковременная пауза пока проверяем localStorage

  return (
    <div className="min-h-screen">
      {!user ? (
        <AuthForm onAuth={setUser} />
      ) : (
        <BattleArena user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;

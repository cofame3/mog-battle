import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Lock, AlertTriangle, User as UserIcon } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : `http://${window.location.hostname}:3001/api`;
const SERVER_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : `http://${window.location.hostname}:3001`;

export default function ProfileSettings({ user, setUser, onClose, t, lang }) {
  const [newUsername, setNewUsername] = useState(user.username);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Вычисляем, можно ли сменить ник (прошло ли 7 дней)
  const canChangeName = () => {
    if (user.isGuest) return false;
    if (!user.lastNicknameChange) return true;
    const diffMs = Date.now() - new Date(user.lastNicknameChange).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
  };

  const getDaysLeft = () => {
    if (!user.lastNicknameChange) return 0;
    const diffMs = Date.now() - new Date(user.lastNicknameChange).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return Math.ceil(7 - diffDays);
  };

  const isNameLocked = !canChangeName();
  const daysLeft = getDaysLeft();

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError(lang === 'ru' ? 'Размер файла не должен превышать 5МБ' : 'File size must not exceed 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('mog_token');
      const res = await fetch(`${API}/profile/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Обновляем локальный стейт
      const updatedUser = { ...user, avatarUrl: data.avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('mog_user', JSON.stringify(updatedUser));
      setMessage(lang === 'ru' ? 'Фото обновлено!' : 'Photo updated!');
    } catch (err) {
      setError(err.message || 'Error uploading photo');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = async () => {
    if (newUsername === user.username) return;
    if (newUsername.length < 3) {
      setError(lang === 'ru' ? 'Минимум 3 символа' : 'Min 3 characters');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('mog_token');
      const res = await fetch(`${API}/profile/username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newUsername })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Обновляем токен и стейт
      localStorage.setItem('mog_token', data.token);
      const updatedUser = { 
        ...user, 
        username: data.username, 
        lastNicknameChange: data.lastNicknameChange 
      };
      setUser(updatedUser);
      localStorage.setItem('mog_user', JSON.stringify(updatedUser));
      setMessage(lang === 'ru' ? 'Имя успешно изменено!' : 'Username changed successfully!');
    } catch (err) {
      setError(err.message || 'Error changing username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cyber-panel border border-cyber-border rounded-2xl w-full max-w-md relative overflow-hidden shadow-[0_0_30px_rgba(0,255,157,0.1)]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-cyber-border bg-black/40">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">
            {lang === 'ru' ? 'Настройки профиля' : 'Profile Settings'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => !user.isGuest && fileInputRef.current?.click()}>
              <div className="w-28 h-28 rounded-full border-2 border-cyber-neon/50 bg-black overflow-hidden flex items-center justify-center relative shadow-[0_0_20px_rgba(0,255,157,0.2)]">
                {user.avatarUrl ? (
                  <img src={`${SERVER_URL}${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={48} className="text-gray-600" />
                )}
                
                {!user.isGuest && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={28} className="text-white" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            {!user.isGuest && (
              <p className="text-xs text-gray-500 mt-3 font-mono">
                {lang === 'ru' ? 'Нажмите чтобы изменить фото' : 'Click to change photo'}
              </p>
            )}
          </div>

          {/* Username Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 tracking-widest uppercase">
              {lang === 'ru' ? 'Никнейм' : 'Username'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={user.isGuest || isNameLocked || loading}
                  className="w-full bg-black border border-cyber-border rounded-lg px-4 py-3 text-white font-mono focus:border-cyber-neon focus:outline-none transition-colors disabled:opacity-50"
                  maxLength={20}
                />
                {(isNameLocked && !user.isGuest) && (
                  <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                )}
              </div>
              
              {!user.isGuest && (
                <button
                  onClick={handleNameChange}
                  disabled={isNameLocked || loading || newUsername === user.username}
                  className="bg-cyber-neon/20 hover:bg-cyber-neon/40 border border-cyber-neon/50 text-cyber-neon px-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Check size={20} />
                </button>
              )}
            </div>
            
            {user.isGuest ? (
              <p className="text-xs text-yellow-500/80 flex items-center gap-1 mt-2">
                <AlertTriangle size={12} />
                {lang === 'ru' ? 'Гости не могут менять профиль' : 'Guests cannot change profile'}
              </p>
            ) : isNameLocked ? (
              <p className="text-xs text-red-400/80 mt-2 font-mono">
                {lang === 'ru' 
                  ? `Смена ника будет доступна через ${daysLeft} дн.` 
                  : `Name change available in ${daysLeft} days`}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2">
                {lang === 'ru' ? 'Ник можно менять 1 раз в 7 дней' : 'Name can be changed once every 7 days'}
              </p>
            )}
          </div>

          {/* Messages */}
          {error && <div className="text-red-400 text-sm font-bold bg-red-500/10 p-3 rounded border border-red-500/30 text-center">{error}</div>}
          {message && <div className="text-cyber-neon text-sm font-bold bg-cyber-neon/10 p-3 rounded border border-cyber-neon/30 text-center">{message}</div>}

        </div>
      </div>
    </div>
  );
}

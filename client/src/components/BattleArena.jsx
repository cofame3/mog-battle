import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Camera, Zap, ShieldAlert, Crosshair, Cpu, Users, Home, User, Shuffle, LogOut, Upload, Mic, MicOff, Trophy, Lock, Unlock, Settings, Shield, ChevronRight, Info, Scan, Gift } from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { analyzeAppearance, initModel, getLiveFaces } from '../utils/aiMock';
import LightPillar from './LightPillar';
import Leaderboard from './Leaderboard';
import ProfileSettings from './ProfileSettings';
import PSLReport from './PSLReport';
import { getMogRank, RANK_TIERS } from '../utils/ranks';

// Connect to the signaling server dynamically so it works on local network devices, or via env
const SOCKET_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;
const socket = io(SOCKET_URL, { autoConnect: false });

const BATTLE_DURATION = 10; // 10 seconds for battle

export default function BattleArena({ user, setUser, onLogout, t, lang, onShowDaily }) {
  const [appState, setAppState] = useState('lobby'); // lobby, arena
  const [lobbyMode, setLobbyMode] = useState('initial'); // initial, friend_join, searching
  const [gameMode, setGameMode] = useState(null); // solo, random, friend, photo
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState(null);

  const [stream, setStream] = useState(null);
  const [opponentStream, setOpponentStream] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [opponentName, setOpponentName] = useState('SUBJECT_02');
  const [opponentElo, setOpponentElo] = useState(400);
  const [countdown, setCountdown] = useState(null);
  const [battleState, setBattleState] = useState('idle'); // idle, readying, battling, result
  const [eloChangeData, setEloChangeData] = useState(null);
  const statsPostedRef = useRef(false);

  const [myResult, setMyResult] = useState(null);
  const [opponentResult, setOpponentResult] = useState(null);
  const [playersCount, setPlayersCount] = useState(0);
  const [liveScore, setLiveScore] = useState(null);
  const [opponentLiveScore, setOpponentLiveScore] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showRankInfo, setShowRankInfo] = useState(false);
  const lastDrawTimeRef = useRef(0);

  useEffect(() => {
    if (!stream || battleState === 'result') {
      setLiveScore(null);
      return;
    }

    // Pick a random target that mimics the final result range
    const target = Math.random() * 55 + 40; // 40–95
    let current = target + (Math.random() * 20 - 10); // start offset
    if (current > 99.9) current = 99.9;
    if (current < 10.0) current = 10.0;

    const interval = setInterval(() => {
      // Drift toward target with small noise
      const drift = (target - current) * 0.15;
      const noise = (Math.random() * 4 - 2);
      current += drift + noise;
      if (current > 99.9) current = 99.9;
      if (current < 10.0) current = 10.0;
      setLiveScore(current.toFixed(1));
    }, 200);

    return () => clearInterval(interval);
  }, [stream, battleState]);

  // Opponent live score estimate (1v1 only)
  useEffect(() => {
    if (!opponentStream || battleState !== 'battling') {
      setOpponentLiveScore(null);
      return;
    }

    const target = Math.random() * 55 + 40;
    let current = target + (Math.random() * 20 - 10);
    if (current > 99.9) current = 99.9;
    if (current < 10.0) current = 10.0;

    const interval = setInterval(() => {
      const drift = (target - current) * 0.15;
      const noise = (Math.random() * 4 - 2);
      current += drift + noise;
      if (current > 99.9) current = 99.9;
      if (current < 10.0) current = 10.0;
      setOpponentLiveScore(current.toFixed(1));
    }, 200);

    return () => clearInterval(interval);
  }, [opponentStream, battleState]);

  const videoRef = useRef(null);
  const opponentVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null); // always up-to-date ref for stream
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const liveCanvasRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setGameMode('photo');
    setRoomCode('PHOTO-AI');
    setPlayersCount(2); // Bypass requirement
    setOpponentReady(true);
    setAppState('arena');
  };

  useEffect(() => {
    // Preload TFJS model
    initModel();

    // Socket Events
    socket.on('room_update', (count) => setPlayersCount(count));
    socket.on('opponent_ready', (payload) => {
      if (typeof payload === 'object') {
        setOpponentReady(payload.isReady);
        if (payload.username) setOpponentName(payload.username);
        if (payload.elo) setOpponentElo(payload.elo);
      } else {
        setOpponentReady(payload);
      }
    });
    socket.on('start_battle', startBattleSequence);
    socket.on('opponent_snapshot', (data) => {
      setOpponentResult(data);
    });

    // Matchmaking Event
    socket.on('match_found', (code) => {
      setRoomCode(code);
      socket.emit('join_room', code);
      setAppState('arena');
    });

    // WebRTC Signaling
    socket.on('user_joined', (newUserId) => {
      peerRef.current = createPeer(newUserId, socket.id, streamRef.current);
    });

    socket.on('user_joined_signal', (payload) => {
      if (payload.signal.type === 'candidate') {
        peerRef.current?.addIceCandidate(new RTCIceCandidate(payload.signal.candidate));
      } else {
        peerRef.current = addPeer(payload.signal, payload.callerID, streamRef.current);
      }
    });

    socket.on('receiving_returned_signal', async (payload) => {
      if (payload.signal.type === 'candidate') {
        peerRef.current?.addIceCandidate(new RTCIceCandidate(payload.signal.candidate));
      } else if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload.signal));
      }
    });

    return () => {
      socket.off('room_update');
      socket.off('opponent_ready');
      socket.off('start_battle');
      socket.off('opponent_snapshot');
      socket.off('match_found');
      socket.off('user_joined');
      socket.off('user_joined_signal');
      socket.off('receiving_returned_signal');
    };
  }, [stream]);

  // Синхронное открытие результатов в 1 на 1
  useEffect(() => {
    if (battleState === 'analyzing' && myResult && opponentResult) {
      setBattleState('result');
    }
  }, [myResult, opponentResult, battleState]);

  // Keep streamRef in sync
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    if (appState === 'arena' && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, appState]);

  useEffect(() => {
    if (appState === 'arena' && opponentVideoRef.current && opponentStream) {
      opponentVideoRef.current.srcObject = opponentStream;
    }
  }, [opponentStream, appState]);

  const createPeer = (userToSignal, callerID, localStream) => {
    const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    if (localStream) localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    peer.ontrack = e => {
      const remoteStream = e.streams[0];
      setOpponentStream(remoteStream);
      if (opponentVideoRef.current) {
        opponentVideoRef.current.srcObject = remoteStream;
      }
    };
    peer.onicecandidate = e => {
      if (e.candidate) socket.emit('sending_signal', { userToSignal, callerID, signal: { type: 'candidate', candidate: e.candidate } });
    };
    peer.createOffer().then(offer => {
      peer.setLocalDescription(offer);
      socket.emit('sending_signal', { userToSignal, callerID, signal: offer });
    });
    return peer;
  };

  const addPeer = (incomingSignal, callerID, localStream) => {
    const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    if (localStream) localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    peer.ontrack = e => {
      const remoteStream = e.streams[0];
      setOpponentStream(remoteStream);
      if (opponentVideoRef.current) {
        opponentVideoRef.current.srcObject = remoteStream;
      }
    };
    peer.onicecandidate = e => {
      if (e.candidate) socket.emit('returning_signal', { callerID, signal: { type: 'candidate', candidate: e.candidate } });
    };
    peer.setRemoteDescription(new RTCSessionDescription(incomingSignal)).then(() => {
      peer.createAnswer().then(answer => {
        peer.setLocalDescription(answer);
        socket.emit('returning_signal', { callerID, signal: answer });
      });
    });
    return peer;
  };

  const initCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        return true;
      } catch (err) {
        console.error("Webcam error:", err);
        alert("Ошибка: Камера недоступна. Пожалуйста, разрешите доступ к камере.");
        return false;
      }
    } else {
      alert("Ошибка: Камера недоступна. Пожалуйста, убедитесь, что вы открыли сайт по HTTPS.");
      return false;
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const joinSolo = async () => {
    const hasCam = await initCamera();
    if (!hasCam) return;
    setGameMode('solo');
    setRoomCode('SOLO-AI');
    setPlayersCount(2); // Bypass requirement
    setOpponentReady(true);
    setAppState('arena');
  };

  const joinRandom = async () => {
    const hasCam = await initCamera();
    if (!hasCam) return;
    setGameMode('random');
    setLobbyMode('searching');
    socket.connect();
    socket.emit('join_random');
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createPrivateRoom = async () => {
    const newCode = generateRoomCode();
    setRoomCodeInput(newCode);
    joinPrivateRoom(newCode);
  };

  const joinPrivateRoom = async (codeToJoin) => {
    if (!codeToJoin.trim()) return;
    const hasCam = await initCamera();
    if (!hasCam) return;
    setGameMode('friend');
    socket.connect();
    socket.emit('join_room', codeToJoin.trim());
    setRoomCode(codeToJoin.trim());
    setAppState('arena');
  };

  const returnHome = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setOpponentStream(null);
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    socket.emit('leave_room');
    socket.disconnect();

    setAppState('lobby');
    setLobbyMode('initial');
    setGameMode(null);
    setRoomCode(null);
    setBattleState('idle');
    setIsReady(false);
    setOpponentReady(false);
    setOpponentName('SUBJECT_02');
    setMyResult(null);
    setOpponentResult(null);
    setPlayersCount(0);
  };

  const findNextRandom = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    socket.emit('leave_room');
    setOpponentStream(null);
    setBattleState('idle');
    setIsReady(false);
    setOpponentReady(false);
    setOpponentName('SUBJECT_02');
    setMyResult(null);
    setOpponentResult(null);
    setPlayersCount(0);

    setLobbyMode('searching');
    setAppState('lobby');
    socket.emit('join_random');
  };

  useEffect(() => {
    if (gameMode === 'solo') {
      if (battleState === 'idle') {
        startBattleSequence();
      }
    } else if (gameMode === 'photo') {
      if (battleState === 'idle') {
        setBattleState('analyzing');
      }
    } else if (gameMode !== null) {
      if (battleState === 'idle' && opponentStream) {
        setIsReady(true);
        socket.emit('set_ready', { isReady: true, roomCode, username: user ? user.username : 'GUEST', elo: user ? user.elo : 400 });
      }
    }
  }, [battleState, opponentStream, gameMode, roomCode, user]);

  useEffect(() => {
    if (gameMode === 'photo' && battleState === 'analyzing' && imageRef.current?.complete) {
      takePhotoSnapshotAndAnalyze();
    }
  }, [battleState, gameMode, uploadedImage]);

  const startBattleSequence = () => {
    setBattleState('battling');
    setIsReady(false);
    if (gameMode !== 'solo') setOpponentReady(false);

    const startTime = Date.now();
    const endTime = startTime + BATTLE_DURATION * 1000;
    
    setCountdown(BATTLE_DURATION);

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      
      setCountdown(prev => {
        if (prev !== remaining) return remaining;
        return prev;
      });
      
      if (now >= endTime) {
        clearInterval(interval);
        takeSnapshotAndAnalyze();
      }
    }, 100);
  };

  useEffect(() => {
    let animationFrameId;
    let isActive = true;

    const drawLiveMesh = async () => {
      if (battleState !== 'battling' || !videoRef.current || !liveCanvasRef.current) return;

      // Throttle to ~15 FPS to reduce CPU load and prevent timer freezing
      const now = Date.now();
      if (now - lastDrawTimeRef.current < 66) {
        if (isActive) animationFrameId = requestAnimationFrame(drawLiveMesh);
        return;
      }
      lastDrawTimeRef.current = now;

      const video = videoRef.current;
      const canvas = liveCanvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        if (isActive) animationFrameId = requestAnimationFrame(drawLiveMesh);
        return;
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const faces = await getLiveFaces(video);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (faces && faces.length > 0) {
        const kp = faces[0].keypoints;

        // ── Only essential landmarks (~30 points) ──
        const drawDot = (idx, color, radius, glow) => {
          const pt = kp[idx];
          if (!pt) return;
          ctx.save();
          ctx.fillStyle = color;
          if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
          ctx.fill();
          ctx.restore();
        };

        // Eyes — corners
        [33, 133, 362, 263].forEach(i => drawDot(i, '#00ff9d', 3, 12));
        // Eyebrows — peaks
        [70, 63, 105, 300, 293, 334].forEach(i => drawDot(i, 'rgba(255,0,85,0.8)', 2.5, 10));
        // Nose — bridge & tip
        [6, 4].forEach(i => drawDot(i, '#00ff9d', 2.5, 8));
        // Jaw — angles + chin
        [132, 361, 152].forEach(i => drawDot(i, '#00ff9d', 3, 12));
        // Cheekbones
        [234, 454].forEach(i => drawDot(i, 'rgba(0,255,157,0.5)', 2.5, 8));
        // Lips — corners + center
        [61, 291, 0, 17].forEach(i => drawDot(i, 'rgba(255,0,85,0.7)', 2, 8));
        // Forehead top
        drawDot(10, 'rgba(0,255,157,0.5)', 2.5, 8);
      }

      if (isActive) {
        animationFrameId = requestAnimationFrame(drawLiveMesh);
      }
    };

    if (battleState === 'battling') {
      drawLiveMesh();
    }

    return () => {
      isActive = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (liveCanvasRef.current) {
        const canvas = liveCanvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [battleState]);

  const takePhotoSnapshotAndAnalyze = async () => {
    const image = imageRef.current;
    if (!image) return;

    // Имитация длительного и сложного анализа (чтобы не было ощущения случайного результата)
    await new Promise(resolve => setTimeout(resolve, 2500));

    const analysis = await analyzeAppearance(image);

    const myData = { image: uploadedImage, analysis };
    setMyResult(myData);
    setBattleState('result');
  };

  const takeSnapshotAndAnalyze = async () => {
    setCountdown(null);
    setBattleState('analyzing');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Pass the actual video element for Face Detection
    const analysis = await analyzeAppearance(video);

    // Fallback to taking a snapshot for the result screen / sending to opponent
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageSrc = canvas.toDataURL('image/jpeg', 0.8);

    const myData = { image: imageSrc, analysis };
    setMyResult(myData);

    if (gameMode !== 'solo' && gameMode !== 'photo') {
      socket.emit('submit_snapshot', myData);

      // Если результат оппонента уже пришел, открываем финальный экран
      // Если нет - продолжаем висеть в "analyzing", пока не сработает useEffect или socket.on
      if (opponentResult) {
        setBattleState('result');
      }
    } else {
      // В соло или фото режиме открываем сразу
      setBattleState('result');
    }
  };

  // Отправить статистику на сервер
  const postStats = async (win, score, oppElo) => {
    const token = localStorage.getItem('mog_token');
    if (!token) return;
    try {
      const res = await fetch(`${SOCKET_URL}/api/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ win, score, opponentElo: oppElo, opponentUsername: opponentName }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.elo !== undefined) {
          setEloChangeData({ newElo: data.elo, change: data.eloChange });
          setOpponentElo((prev) => prev - data.eloChange);
          if (setUser && user) {
            const updatedUser = { ...user, elo: data.elo };
            setUser(updatedUser);
            localStorage.setItem('mog_user', JSON.stringify(updatedUser));
          }
        }
      }
    } catch { }
  };

  useEffect(() => {
    if (battleState === 'idle') {
      statsPostedRef.current = false;
    }
  }, [battleState]);

  useEffect(() => {
    if (battleState === 'result' && myResult && user && !user.isGuest && !statsPostedRef.current) {
      if (gameMode === 'random' && opponentResult) {
        statsPostedRef.current = true;
        let isWin;
        if (myResult.analysis.total > opponentResult.analysis.total) isWin = true;
        else if (myResult.analysis.total < opponentResult.analysis.total) isWin = false;
        else isWin = null;
        postStats(isWin, myResult.analysis.total, opponentElo);
      }
    }
  }, [battleState, myResult, opponentResult, gameMode, opponentElo]);

  const resetBattle = () => {
    if (gameMode === 'photo') {
      returnHome();
      return;
    }
    setMyResult(null);
    setOpponentResult(null);
    setEloChangeData(null);
    setBattleState('idle');
    if (gameMode === 'solo') setOpponentReady(true);
  };

  if (appState === 'lobby') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Cyber Effect */}
        <div className="absolute inset-0 bg-black z-0">
          <LightPillar
            topColor="#00ff9d"
            bottomColor="#ff0055"
            intensity={1.0}
            rotationSpeed={0.3}
            glowAmount={0.005}
            pillarWidth={3.0}
            pillarHeight={0.4}
            noiseIntensity={0.5}
            pillarRotation={0}
            interactive={false}
            mixBlendMode="screen"
          />
        </div>

        {/* Animated grid lines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,255,157,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,157,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* User Info / Logout Top Bar */}
        {user && (
          <div className="absolute top-6 right-6 z-20 flex items-center gap-4 bg-black/60 border border-cyber-border px-4 py-2 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(0,255,157,0.1)]">
            {user.avatarUrl ? (
              <img src={`${SOCKET_URL}${user.avatarUrl}`} alt="avatar" className="w-6 h-6 rounded-full object-cover border border-cyber-neon" />
            ) : (
              <User size={16} className="text-gray-400" />
            )}
            <span className="text-sm font-bold text-cyber-neon tracking-widest flex items-center gap-2">
              {user.username}
              {!user.isGuest && lobbyMode !== 'friend_join' && (
                <span className="text-[10px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/30 px-1 rounded flex items-center gap-1">
                  ⚡ {user.elo || 400}
                </span>
              )}
            </span>
            {user.isGuest && (
              <span className="text-[10px] bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/50 px-1 rounded font-black">GUEST</span>
            )}
            {onLogout && (
              <>
                <button
                  onClick={() => setShowRankInfo(true)}
                  className="ml-2 text-gray-500 hover:text-yellow-400 transition-colors border-l border-gray-700 pl-4"
                  title="Rank Info"
                >
                  <Info size={18} />
                </button>
                <button
                  onClick={onShowDaily}
                  className="relative ml-2 text-gray-500 hover:text-cyber-neon transition-all"
                  title={lang === 'ru' ? 'Награды' : 'Daily Rewards'}
                >
                  <Gift size={18} />
                  {localStorage.getItem('mog_last_claim') !== new Date().toDateString() && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-cyber-neon rounded-full shadow-[0_0_8px_rgba(0,255,157,0.8)] animate-pulse" />
                  )}
                </button>
                <button
                  onClick={() => setShowProfile(true)}
                  className="ml-2 text-gray-500 hover:text-white transition-colors"
                  title="Настройки профиля"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={onLogout}
                  className="ml-2 text-gray-500 hover:text-red-400 transition-colors border-l border-gray-700 pl-4"
                  title="Выйти из аккаунта"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        )}

        <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-reveal">
          <div className="text-center mb-8">
            <img src="/logo.jpg" alt="Omogle Logo" className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(0,255,157,0.5)] object-cover rounded-3xl" />
            <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-cyber-accent drop-shadow-[0_0_10px_rgba(0,255,157,0.5)]">
              OMOGLE
            </h1>
            <p className="text-gray-400 mt-2 text-sm tracking-widest uppercase">{t.protocol}</p>
          </div>

          {lobbyMode === 'initial' && (
            <div className="space-y-4">
              {user.isGuest && (
                <div className="bg-cyber-accent/5 border border-cyber-accent/30 rounded-lg p-3 mb-6 text-center">
                  <p className="text-[10px] text-cyber-accent font-bold tracking-widest leading-tight whitespace-pre-line">
                    {t.guestAlert}
                  </p>
                </div>
              )}
              <button
                onClick={joinSolo}
                className="w-full flex items-center justify-center gap-2 bg-transparent border border-white text-white font-black uppercase tracking-widest py-4 rounded hover:bg-white hover:text-black transition-all"
              >
                <User size={20} />
                {t.solo}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-transparent border border-cyber-neon text-cyber-neon font-black uppercase tracking-widest py-4 rounded hover:bg-cyber-neon hover:text-black transition-all"
              >
                <Upload size={20} />
                {t.upload}
              </button>
              <button
                onClick={joinRandom}
                className="w-full flex items-center justify-center gap-2 bg-cyber-accent text-black font-black uppercase tracking-widest py-4 rounded hover:shadow-[0_0_20px_rgba(255,0,85,0.6)] hover:bg-white transition-all"
              >
                <Shuffle size={20} />
                {t.random}
              </button>
              <button
                onClick={() => setLobbyMode('friend_join')}
                className="w-full flex items-center justify-center gap-2 bg-cyber-neon text-black font-black uppercase tracking-widest py-4 rounded hover:shadow-[0_0_20px_rgba(0,255,157,0.6)] hover:bg-white transition-all"
              >
                <Users size={20} />
                {t.friend}
              </button>
              <button
                onClick={() => setLobbyMode('leaderboard')}
                className="w-full flex items-center justify-center gap-2 bg-transparent border border-yellow-500 text-yellow-500 font-black uppercase tracking-widest py-4 rounded hover:bg-yellow-500 hover:text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.6)] transition-all mt-2"
              >
                <Trophy size={20} />
                {t.leaderboard || "РЕЙТИНГ"}
              </button>
            </div>
          )}



          {lobbyMode === 'searching' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <Cpu className="w-16 h-16 text-cyber-accent animate-spin-slow" />
              <div className="text-xl font-bold tracking-widest text-cyber-accent animate-pulse">
                {t.searching}
              </div>
              <button
                onClick={returnHome}
                className="border border-gray-600 text-gray-400 font-bold tracking-widest px-6 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          )}

          {lobbyMode === 'friend_join' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <button
                  onClick={createPrivateRoom}
                  className="flex-1 bg-cyber-border text-white font-bold uppercase tracking-widest py-3 rounded hover:bg-gray-700 transition-colors text-sm"
                >
                  {t.createRoom}
                </button>
              </div>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-xs tracking-widest font-bold uppercase">{t.orJoin}</span>
                <div className="flex-grow border-t border-gray-700"></div>
              </div>
              <div>
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder={t.enterCode}
                  className="w-full bg-black border-2 border-cyber-border rounded px-4 py-3 text-white font-mono text-center tracking-[0.2em] focus:border-cyber-neon focus:outline-none transition-colors"
                  maxLength={10}
                  onKeyDown={(e) => e.key === 'Enter' && joinPrivateRoom(roomCodeInput)}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setLobbyMode('initial')}
                  className="flex-1 border border-gray-600 text-gray-400 font-bold tracking-widest py-4 rounded hover:bg-gray-800 transition-colors"
                >
                  {t.back}
                </button>
                <button
                  onClick={() => joinPrivateRoom(roomCodeInput)}
                  disabled={!roomCodeInput.trim()}
                  className="flex-[2] bg-cyber-neon text-black font-black uppercase tracking-widest py-4 rounded hover:shadow-[0_0_20px_rgba(0,255,157,0.6)] hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.joinRoom}
                </button>
              </div>
            </div>
          )}
        </div>

        {lobbyMode === 'leaderboard' && (
          <Leaderboard t={t} onClose={() => setLobbyMode('initial')} currentUser={user} />
        )}

        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
        {showProfile && <ProfileSettings user={user} setUser={setUser} onClose={() => setShowProfile(false)} t={t} lang={lang} />}

        {/* Rank Info Modal */}
        {showRankInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowRankInfo(false)}>
            <div className="w-full max-w-sm bg-black/90 border border-white/10 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-reveal" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black tracking-widest text-white uppercase flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-500" />
                  {lang === 'ru' ? 'СИСТЕМА РАНГОВ' : 'RANK SYSTEM'}
                </h2>
                <button onClick={() => setShowRankInfo(false)} className="text-gray-500 hover:text-white transition-colors text-xl font-bold">✕</button>
              </div>
              <div className="space-y-2">
                {[...RANK_TIERS].reverse().map((tier, i) => {
                  const isCurrentRank = user && !user.isGuest && getMogRank(user.elo).name === tier.name;
                  return (
                    <div
                      key={tier.name}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                        isCurrentRank
                          ? `${tier.bg} ${tier.border} shadow-[0_0_15px_rgba(255,255,255,0.05)]`
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-black tracking-widest ${tier.color}`}>
                          {tier.name}
                        </span>
                        {isCurrentRank && (
                          <span className="text-[8px] bg-white/10 text-white px-1.5 py-0.5 rounded font-black animate-pulse">
                            {lang === 'ru' ? 'ВЫ' : 'YOU'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-mono font-bold">
                        {tier.maxElo === Infinity ? `${tier.minElo}+` : `${tier.minElo} — ${tier.maxElo}`}
                      </span>
                    </div>
                  );
                })}
              </div>
              {user && !user.isGuest && (
                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                  <span className="text-[10px] text-gray-500 tracking-widest uppercase font-bold">{lang === 'ru' ? 'ВАШ ELO' : 'YOUR ELO'}: </span>
                  <span className={`text-sm font-black ${getMogRank(user.elo).color}`}>⚡ {user.elo || 400}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-8 pb-32">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.3)] gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="Omogle Logo" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(0,255,157,0.4)] object-cover rounded-xl" />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-widest text-cyber-neon">OMOGLE-PROTOCOL</span>
            <span className="text-xs text-gray-400 mt-1 uppercase">{t.room}: <span className="text-white font-mono bg-black px-2 py-1 ml-1 border border-cyber-border rounded tracking-widest">{roomCode}</span></span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {user && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <img src={`${SOCKET_URL}${user.avatarUrl}`} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <User size={16} className="text-gray-400" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white tracking-widest leading-none uppercase">{user.username}</span>
                  <div className="flex items-center gap-2 mt-1">
                    {!user.isGuest && gameMode !== 'friend' && (
                      <>
                        <span className="text-[10px] text-yellow-500 font-bold">⚡ {user.elo || 400}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${getMogRank(user.elo).color} ${getMogRank(user.elo).bg} ${getMogRank(user.elo).border}`}>
                          {getMogRank(user.elo).name}
                        </span>
                      </>
                    )}
                    {user.isGuest && (
                      <span className="text-[8px] bg-white/10 text-gray-400 border border-white/20 px-1 rounded font-black uppercase">GUEST</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {stream && (
            <button onClick={toggleMic} className={`transition-colors ${isMicMuted ? 'text-red-400' : 'text-cyber-neon hover:text-white'}`} title="Микрофон">
              {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
          )}
          <button onClick={returnHome} className="text-gray-400 hover:text-white transition-colors" title="Return Home">
            <Home size={24} />
          </button>
          <button 
            onClick={onShowDaily} 
            className="relative text-gray-500 hover:text-white transition-colors" 
            title={lang === 'ru' ? 'Награды' : 'Daily Rewards'}
          >
            <Gift size={20} />
            {localStorage.getItem('mog_last_claim') !== new Date().toDateString() && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-neon rounded-full shadow-[0_0_8px_rgba(0,255,157,0.8)] animate-pulse" />
            )}
          </button>
          <button onClick={() => setShowProfile(true)} className="text-gray-500 hover:text-white transition-colors" title="Settings">
            <Settings size={20} />
          </button>
          {onLogout && (
            <button onClick={onLogout} className="text-gray-500 hover:text-red-400 transition-colors" title="Выйти">
              <LogOut size={20} />
            </button>
          )}

          {gameMode !== 'solo' && gameMode !== 'photo' && (
            <div className="text-sm uppercase">
              <span className="text-gray-400">{t.users}: </span>
              <span className="text-white font-bold">{playersCount}/2</span>
            </div>
          )}


          {battleState === 'result' && (
            <div className="flex gap-2">
              {gameMode === 'random' ? (
                <button
                  onClick={findNextRandom}
                  className="px-6 py-2 rounded font-bold uppercase border border-cyber-neon text-cyber-neon hover:bg-cyber-neon hover:text-black transition-all"
                >
                  {t.nextOpponent}
                </button>
              ) : (
                <button
                  onClick={resetBattle}
                  className="px-6 py-2 rounded font-bold uppercase border border-cyber-accent text-cyber-accent hover:bg-cyber-accent hover:text-black transition-all"
                >
                  {t.rematch}
                </button>
              )}
            </div>
          )}
        </div>
      </div>


      {battleState === 'analyzing' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
          <Cpu className="w-24 h-24 text-cyber-neon animate-pulse mb-6" />
          <div className="text-3xl font-bold tracking-widest text-cyber-neon animate-pulse text-center uppercase px-4">
            {myResult ? (lang === 'ru' ? 'ОЖИДАНИЕ ОППОНЕНТА...' : 'WAITING FOR OPPONENT...') : t.extracting}
          </div>
          {myResult && (
            <div className="mt-4 text-gray-500 font-bold tracking-widest animate-pulse">
              {lang === 'ru' ? 'ВАШ АНАЛИЗ ЗАВЕРШЕН' : 'YOUR ANALYSIS COMPLETE'}
            </div>
          )}
        </div>
      )}

      {/* Main Arena */}
      <div className={`grid grid-cols-1 ${(gameMode === 'solo' || gameMode === 'photo') ? 'max-w-3xl mx-auto w-full' : 'md:grid-cols-2'} gap-8 relative`}>

        {/* VS Badge */}
        {gameMode !== 'solo' && gameMode !== 'photo' && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-16 h-16 bg-cyber-dark border-2 border-cyber-accent rounded-full shadow-[0_0_20px_rgba(255,0,85,0.5)]">
            <span className="text-xl font-black italic text-cyber-accent">VS</span>
          </div>
        )}

        {/* Player 1 (Local) */}
        <div className={`relative rounded-xl overflow-hidden border-2 ${isReady ? 'border-cyber-neon shadow-[0_0_20px_rgba(0,255,157,0.3)]' : 'border-cyber-border'} transition-all duration-500 bg-cyber-panel`}>
          <div className="absolute top-0 left-0 w-full p-2 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <Crosshair size={16} className="text-cyber-neon" />
              {user ? user.username.toUpperCase() : 'SUBJECT_01'} ({t.you})
            </span>
          </div>

          <div className="aspect-[4/3] relative bg-black flex items-center justify-center">
            {myResult && gameMode !== 'photo' && (
              <img src={myResult.image} alt="My snapshot" className="absolute top-4 left-4 w-24 h-32 object-cover border-2 border-cyber-neon rounded shadow-[0_0_10px_rgba(0,255,157,0.5)] z-30 scale-x-[-1]" />
            )}
            {uploadedImage ? (
              <img
                ref={imageRef}
                src={uploadedImage}
                alt="Uploaded"
                onLoad={() => {
                  if (gameMode === 'photo' && battleState === 'analyzing') takePhotoSnapshotAndAnalyze();
                }}
                className={`w-full h-full object-cover block`}
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] block`}
              />
            )}
            {!myResult && !uploadedImage && (
              <canvas
                ref={liveCanvasRef}
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-20 pointer-events-none opacity-60"
              />
            )}
            {liveScore && !myResult && !uploadedImage && (
              <div className="absolute top-4 right-4 z-30 bg-black/60 border border-cyber-neon px-3 py-1 rounded flex flex-col items-end shadow-[0_0_10px_rgba(0,255,157,0.3)] backdrop-blur-sm">
                <span className="text-[10px] font-bold text-cyber-neon tracking-widest animate-pulse uppercase">{t.liveEstimate}</span>
                <span className="text-xl font-mono font-black text-white">{liveScore}</span>
                <span className={`text-[10px] font-black tracking-widest ${getTier(parseFloat(liveScore)).color}`}>{getTier(parseFloat(liveScore)).label}</span>
              </div>
            )}

          </div>

          {myResult && (
            <ResultPanel
              t={t}
              lang={lang}
              user={user}
              setUser={setUser}
              analysis={myResult.analysis}
              snapshotImage={myResult.image}
              isWinner={gameMode === 'solo' || gameMode === 'photo' ? true : (opponentResult ? (myResult.analysis.total > opponentResult.analysis.total ? true : (myResult.analysis.total < opponentResult.analysis.total ? false : null)) : null)}
              eloChangeData={gameMode === 'solo' || gameMode === 'photo' ? null : eloChangeData}
              isSolo={gameMode === 'solo' || gameMode === 'photo'}
            />
          )}
        </div>

        {/* Player 2 (Opponent) */}
        {gameMode !== 'solo' && gameMode !== 'photo' && (
          <div className={`relative rounded-xl overflow-hidden border-2 ${opponentReady ? 'border-cyber-neon shadow-[0_0_20px_rgba(0,255,157,0.3)]' : 'border-cyber-border'} transition-all duration-500 bg-cyber-panel`}>
            <div className="absolute top-0 left-0 w-full p-2 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <ShieldAlert size={16} className="text-cyber-accent" />
                {opponentName.toUpperCase()} 
                {gameMode === 'random' && (
                  <span className="text-[10px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded ml-2 font-bold flex items-center gap-1">
                    ⚡ ELO: {opponentElo}
                  </span>
                )}
              </span>
            </div>

            <div className="aspect-[4/3] relative bg-black flex items-center justify-center">
              {opponentResult && (
                <img src={opponentResult.image} alt="Opponent snapshot" className="absolute top-4 left-4 w-24 h-32 object-cover border-2 border-cyber-accent rounded shadow-[0_0_10px_rgba(255,0,85,0.5)] z-30" />
              )}
              <video
                ref={opponentVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${opponentStream ? 'block' : 'hidden'}`}
              />
              {!opponentResult && !opponentStream && (
                <div className="text-gray-600 flex flex-col items-center gap-4">
                  <Camera size={48} className="opacity-20 animate-pulse" />
                  <span className="text-sm tracking-widest text-center px-4 uppercase">
                    {playersCount < 2 ? t.searchingOpponent : t.connecting}
                  </span>
                </div>
              )}
              {opponentLiveScore && !opponentResult && opponentStream && (
                <div className="absolute top-4 right-4 z-30 bg-black/60 border border-cyber-accent px-3 py-1 rounded flex flex-col items-end shadow-[0_0_10px_rgba(255,0,85,0.3)] backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-cyber-accent tracking-widest animate-pulse uppercase">{t.liveEstimate}</span>
                  <span className="text-xl font-mono font-black text-white">{opponentLiveScore}</span>
                  <span className={`text-[10px] font-black tracking-widest ${getTier(parseFloat(opponentLiveScore)).color}`}>{getTier(parseFloat(opponentLiveScore)).label}</span>
                </div>
              )}
            </div>

            {opponentResult && (
              <ResultPanel
                t={t}
                lang={lang}
                analysis={opponentResult.analysis}
                snapshotImage={opponentResult.image}
                isWinner={myResult ? (opponentResult.analysis.total > myResult.analysis.total ? true : (opponentResult.analysis.total < myResult.analysis.total ? false : null)) : null}
                eloChangeData={eloChangeData ? {
                  newElo: opponentElo,
                  change: -eloChangeData.change
                } : null}
              />
            )}
          </div>
        )}

      </div>

      {/* Compact Timer Overlay - Moved to bottom to avoid overlapping */}
      {countdown !== null && battleState === 'battling' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none scale-75 md:scale-90">
          <div className="relative flex items-center justify-center w-16 h-16">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="50%" cy="50%" r="45%"
                fill="none" stroke="rgba(0,255,157,0.1)" strokeWidth="4"
              />
              <circle
                cx="50%" cy="50%" r="45%"
                fill="none" stroke="#00ff9d" strokeWidth="4"
                strokeDasharray="283%"
                strokeDashoffset={`${((BATTLE_DURATION - countdown) / BATTLE_DURATION) * 283}%`}
                className="transition-all duration-1000 ease-linear"
                style={{ filter: 'drop-shadow(0 0 8px #00ff9d)' }}
              />
            </svg>
            <span className="absolute text-3xl font-black text-white font-mono drop-shadow-[0_0_10px_rgba(0,255,157,0.5)]">
              {countdown}
            </span>
          </div>
          <div className="mt-2 px-3 py-1 bg-black/60 border border-cyber-neon/30 rounded backdrop-blur-md">
            <span className="text-[8px] font-black text-cyber-neon tracking-[0.3em] uppercase opacity-80">
              {t.timerLabel || 'SECONDS'}
            </span>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      {showProfile && <ProfileSettings user={user} setUser={setUser} onClose={() => setShowProfile(false)} t={t} lang={lang} />}
    </div>
  );
}

function ResultPanel({ t, lang, analysis, isWinner, eloChangeData, isSolo, user, setUser, snapshotImage }) {
  const [advice, setAdvice] = useState(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showPSL, setShowPSL] = useState(false);
  const [pslGateMsg, setPslGateMsg] = useState(null);
  const [pslTimer, setPslTimer] = useState('');

  useEffect(() => {
    setAdvice(null);
    setPslGateMsg(null);
  }, [analysis]);

  // Countdown timer for daily PSL gate
  useEffect(() => {
    if (pslGateMsg !== 'daily') return;
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setPslTimer(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [pslGateMsg]);

  // Check if PSL scan is available
  const handlePSLClick = () => {
    const hasTicket = localStorage.getItem('mog_premium_ticket') === 'true';

    // Gate 1: Must be registered
    if (!user || user.isGuest) {
      setPslGateMsg(lang === 'ru' ? 'signup' : 'signup');
      return;
    }

    // If has ticket, bypass all other gates
    if (hasTicket) {
      localStorage.removeItem('mog_premium_ticket');
      setShowPSL(true);
      return;
    }

    // Gate 2: 1 per day (TEMPORARILY DISABLED FOR TESTING)
    /*
    const storageKey = `psl_last_scan_${user.username}`;
    const lastScan = localStorage.getItem(storageKey);
    if (lastScan) {
      const lastDate = new Date(lastScan).toDateString();
      const today = new Date().toDateString();
      if (lastDate === today) {
        setPslGateMsg('daily');
        return;
      }
    }
    localStorage.setItem(storageKey, new Date().toISOString());
    */
    
    // Allow scan
    setShowPSL(true);
  };

  const getVerdictText = () => {
    if (analysis.error) return t.ru ? 'ОШИБКА' : 'ERROR';
    if (isWinner === true) return "BRUTALIZED";
    if (isWinner === false) return "DESTROYED";
    return t.ru ? 'НИЧЬЯ' : 'DRAW';
  };

  return (
    <div className="p-4 border-t border-cyber-border bg-black/50 relative z-30 animate-reveal">
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">AI VERDICT</div>
          <div className={`text-2xl font-black ${analysis.error ? 'text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]' : isWinner ? 'text-cyber-neon drop-shadow-[0_0_10px_rgba(0,255,157,0.8)] animate-pulse' : isWinner === false ? 'text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]' : 'text-gray-500'}`}>
            {getVerdictText()}
          </div>
          {eloChangeData && !analysis.error && (
            <div className={`mt-3 p-3 rounded-lg bg-black/60 border ${eloChangeData.change > 0 ? 'border-cyber-neon/30' : (eloChangeData.change < 0 ? 'border-red-500/30' : 'border-gray-500/30')} animate-reveal`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">Rank Change</span>
                <span className={`text-sm font-black ${eloChangeData.change > 0 ? 'text-cyber-neon' : (eloChangeData.change < 0 ? 'text-red-500' : 'text-gray-400')}`}>
                  {eloChangeData.change > 0 ? '+' : ''}{eloChangeData.change}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-500 uppercase tracking-widest font-bold">New Rating</span>
                <span className="text-white font-mono font-bold">⚡ {eloChangeData.newElo}</span>
              </div>
            </div>
          )}
        </div>
        {!analysis.error && (
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1 uppercase">MOG SCORE</div>
            <div className="text-4xl font-black text-white">{analysis.total}</div>
            <div className={`text-xs font-black tracking-widest mt-1 ${getTier(analysis.total).color}`}>{getTier(analysis.total).label}</div>
          </div>
        )}
      </div>

      {!analysis.error && (
        <div className="space-y-2">
          <ScoreBar label={t.symmetry.toUpperCase()} value={analysis.symmetry} />
          <ScoreBar label={t.jawline.toUpperCase()} value={analysis.jawline} />
          <ScoreBar label={t.eyes.toUpperCase()} value={analysis.eyes} />
          <ScoreBar label={t.nose.toUpperCase()} value={analysis.nose} />

          {/* PSL Scan Button — Solo/Photo only */}
          {snapshotImage && isSolo && (
            <>
              <button
                onClick={handlePSLClick}
                className="w-full mt-3 flex items-center justify-center gap-2 text-xs font-black tracking-[0.2em] uppercase py-2.5 rounded-lg border border-cyber-neon/40 text-cyber-neon bg-cyber-neon/5 hover:bg-cyber-neon/15 hover:border-cyber-neon/70 transition-all"
              >
                <Scan size={14} />
                {lang === 'ru' ? 'PSL СКАН' : 'VIEW PSL SCAN'}
                {localStorage.getItem('mog_premium_ticket') === 'true' ? (
                  <span className="text-[8px] ml-1 bg-yellow-500/20 px-1.5 py-0.5 rounded text-yellow-500 border border-yellow-500/30 animate-pulse">BONUS</span>
                ) : (
                  <span className="text-[8px] ml-1 bg-cyber-neon/20 px-1.5 py-0.5 rounded text-cyber-neon/80">FREE</span>
                )}
              </button>

              {/* Gate: Sign up required */}
              {pslGateMsg === 'signup' && (
                <div className="mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center animate-reveal">
                  <div className="text-yellow-500 font-black text-xs tracking-widest mb-1">
                    {lang === 'ru' ? '🔒 НУЖНА РЕГИСТРАЦИЯ' : '🔒 SIGN UP REQUIRED'}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {lang === 'ru'
                      ? 'Создай бесплатный аккаунт чтобы открыть PSL скан + систему рангов'
                      : 'Create a free account to unlock PSL scan + ranking system'}
                  </div>
                </div>
              )}

              {/* Gate: Daily limit with timer */}
              {pslGateMsg === 'daily' && (
                <div className="mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center animate-reveal">
                  <div className="text-blue-400 font-black text-xs tracking-widest mb-1">
                    {lang === 'ru' ? '⏳ 1 СКАН В СУТКИ' : '⏳ 1 SCAN PER DAY'}
                  </div>
                  <div className="text-[10px] text-gray-400 mb-2">
                    {lang === 'ru'
                      ? 'Ты уже использовал свой бесплатный скан сегодня.'
                      : 'You already used your free scan today.'}
                  </div>
                  <div className="inline-flex items-center gap-2 bg-black/40 border border-blue-500/20 rounded-lg px-3 py-1.5">
                    <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">
                      {lang === 'ru' ? 'СЛЕДУЮЩИЙ ЧЕРЕЗ' : 'NEXT IN'}
                    </span>
                    <span className="text-lg font-mono font-black text-blue-400">{pslTimer}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {showPSL && snapshotImage && (
        <PSLReport
          imageSrc={snapshotImage}
          analysis={analysis}
          onClose={() => setShowPSL(false)}
          lang={lang}
        />
      )}

      {isSolo && !analysis.error && (
        <div className="mt-4 pt-4 border-t border-yellow-500/20">
          {advice ? (
            /* ── Unlocked content ── */
            <div>
              <div className="text-sm font-black text-yellow-500 mb-3 flex items-center gap-2">
                {advice.title}
              </div>
              <div className="space-y-4">
                {advice.sections ? advice.sections.map((sec, i) => (
                  <div key={i} className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black tracking-widest text-white flex items-center gap-1.5">
                        {sec.icon} {sec.title}
                      </span>
                      {sec.score && (
                        <span className="text-[10px] font-mono font-bold text-cyber-neon bg-cyber-neon/10 px-2 py-0.5 rounded">{sec.score}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{sec.content}</p>
                    {sec.exercises && (
                      <ul className="space-y-1.5">
                        {sec.exercises.map((ex, j) => (
                          <li key={j} className="text-xs text-gray-300 leading-relaxed">{ex}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )) : (
                  advice.points && advice.points.map((p, i) => <p key={i} className="text-sm text-gray-300">• {p}</p>)
                )}
              </div>
            </div>
          ) : (
            /* ── Locked — clean card ── */
            <div className="rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-b from-yellow-500/[0.06] to-transparent p-5 text-center">
              <div className="text-3xl font-black text-yellow-400 mb-2 flex items-center justify-center gap-2">
                <Lock size={22} /> $2
              </div>
              <div className="text-sm font-black text-white tracking-widest mb-1 uppercase">
                {lang === 'ru' ? '💎 ПРЕМИУМ АНАЛИЗ' : '💎 PREMIUM ANALYSIS'}
              </div>
              <div className="text-xs text-gray-400 mb-4">
                {lang === 'ru' ? '6 секций • Упражнения • 30-дневный план' : '6 sections • Exercises • 30-day plan'}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-5 text-left">
                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                  <span className="text-yellow-500">✓</span> {lang === 'ru' ? 'Упражнения для челюсти' : 'Jaw exercises'}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                  <span className="text-yellow-500">✓</span> {lang === 'ru' ? 'Советы по взгляду' : 'Eye improvement tips'}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                  <span className="text-yellow-500">✓</span> {lang === 'ru' ? 'Стиль и груминг' : 'Style & grooming'}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                  <span className="text-yellow-500">✓</span> {lang === 'ru' ? '30-дневный план' : '30-day plan'}
                </div>
              </div>

              <div className="w-full max-w-xs mx-auto relative z-50 space-y-3">
                {localStorage.getItem('mog_analysis_ticket') === 'true' && (
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('mog_token');
                        const res = await fetch(`${SOCKET_URL}/api/use-analysis-ticket`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ analysis, lang })
                        });
                        const result = await res.json();
                        if (result.ok) {
                          localStorage.removeItem('mog_analysis_ticket');
                          setAdvice(result.advice);
                        }
                      } catch (err) { console.error(err); }
                    }}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 transition-all animate-pulse"
                  >
                    {lang === 'ru' ? '🔓 ИСПОЛЬЗОВАТЬ БИЛЕТ' : '🔓 USE REWARD TICKET'}
                  </button>
                )}

                <PayPalButtons
                  style={{ layout: "horizontal", color: "gold", shape: "pill", label: "pay", height: 45 }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: { currency_code: "USD", value: "2.00" },
                        description: "MogBattle Premium Analysis"
                      }]
                    });
                  }}
                  onApprove={async (data, actions) => {
                    try {
                      const token = localStorage.getItem('mog_token');
                      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                      const response = await fetch(`${apiUrl}/api/paypal/capture-order`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ orderID: data.orderID, analysis, lang })
                      });

                      const result = await response.json();
                      if (result.ok) {
                        setAdvice(result.advice);
                      } else {
                        alert("Capture failed: " + (result.error || "Unknown error"));
                      }
                    } catch (err) {
                      console.error("Server capture error:", err);
                      alert("Server capture failed: " + err.message);
                    }
                  }}
                  onError={(err) => {
                    console.error("PayPal Checkout onError", err);
                    alert("Payment Error: " + err.message);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="w-24 text-gray-400 tracking-wider text-xs">{label}</div>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyber-accent to-cyber-neon"
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="w-8 text-right font-bold">{value}</div>
    </div>
  );
}

function getTier(score) {
  if (score >= 90) return { label: 'CHAD', color: 'text-yellow-400' };
  if (score >= 80) return { label: 'CHADLITE', color: 'text-amber-400' };
  if (score >= 72) return { label: 'HTN', color: 'text-cyber-neon' };
  if (score >= 65) return { label: 'MTN', color: 'text-green-400' };
  if (score >= 55) return { label: 'LTN', color: 'text-blue-400' };
  if (score >= 45) return { label: 'sub-5', color: 'text-purple-400' };
  if (score >= 35) return { label: 'sub-3', color: 'text-orange-400' };
  return { label: 'who are you', color: 'text-red-500' };
}

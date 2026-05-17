require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { generatePremiumAdvice } = require('./utils/premiumAdvice');

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = 'https://api-m.paypal.com';

app.use(cors());
app.use(express.json());

// ─── Cloudinary Config ──────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [
      { width: 1080, height: 1080, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── MongoDB ────────────────────────────────────────────────────────────────
let useInMemory = false;
const MONGO_URI = process.env.MONGO_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'mog-battle-secret-key-2024';
const inMemoryUsers = new Map();

async function connectDB() {
  if (!MONGO_URI) {
    console.log('⚠️  MONGO_URI не задан — используется in-memory хранилище (данные сбросятся при рестарте)');
    useInMemory = true;
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB подключена');
  } catch (err) {
    console.log('⚠️  MongoDB недоступна, переключаюсь на in-memory:', err.message);
    useInMemory = true;
  }
}
connectDB();

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  elo: { type: Number, default: 400 },
  communityElo: { type: Number, default: 400 },
  communityWins: { type: Number, default: 0 },
  communityLosses: { type: Number, default: 0 },
  avatarUrl: { type: String, default: '' },
  lastNicknameChange: { type: Date, default: null },
  adviceTokens: { type: Number, default: 0 },
});
const User = mongoose.model('User', UserSchema);

async function findUser(username) {
  if (useInMemory) return inMemoryUsers.get(username.toLowerCase());
  return User.findOne({ username: new RegExp(`^${username}$`, 'i') });
}

async function createUser(username, hashedPassword) {
  if (useInMemory) {
    const user = { username, password: hashedPassword, wins: 0, losses: 0, bestScore: 0, elo: 400, communityElo: 400, avatarUrl: '' };
    inMemoryUsers.set(username.toLowerCase(), user);
    return user;
  }
  return User.create({ username, password: hashedPassword });
}

async function updateStats(username, { win, score, opponentElo, opponentUsername }) {
  const K = 32;
  let oppElo = opponentElo || 400;
  if (opponentUsername) {
    const opp = await findUser(opponentUsername);
    if (opp) oppElo = opp.elo || 400;
  }
  if (useInMemory) {
    let user = inMemoryUsers.get(username.toLowerCase());
    if (!user) {
      user = { username, password: '', wins: 0, losses: 0, bestScore: 0, elo: 400 };
      inMemoryUsers.set(username.toLowerCase(), user);
    }
    let currentElo = user.elo || 400;
    let expected = 1 / (1 + Math.pow(10, (oppElo - currentElo) / 400));
    let actual = win === true ? 1 : (win === false ? 0 : 0.5);
    user.elo = Math.round(currentElo + K * (actual - expected));
    if (win === true) user.wins++;
    else if (win === false) user.losses++;
    if (score > (user.bestScore || 0)) user.bestScore = score;
    return { elo: user.elo, eloChange: user.elo - currentElo };
  }
  const user = await User.findOne({ username });
  if (!user) return;
  let currentElo = user.elo || 400;
  let expected = 1 / (1 + Math.pow(10, (oppElo - currentElo) / 400));
  let actual = win === true ? 1 : (win === false ? 0 : 0.5);
  let newElo = Math.round(currentElo + K * (actual - expected));
  const update = { $set: { elo: newElo }, $inc: {} };
  if (win === true) update.$inc.wins = 1;
  else if (win === false) update.$inc.losses = 1;
  if (score > (user.bestScore || 0)) update.$set.bestScore = score;
  await User.updateOne({ username }, update);
  return { elo: newElo, eloChange: newElo - currentElo };
}

// ─── REST API Routes ─────────────────────────────────────────────────────────

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Заполни все поля' });
    if (username.length < 3) return res.status(400).json({ error: 'Имя минимум 3 символа' });
    if (password.length < 4) return res.status(400).json({ error: 'Пароль минимум 4 символа' });
    const exists = await findUser(username);
    if (exists) return res.status(409).json({ error: 'Это имя уже занято' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser(username, hashed);
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Заполни все поля' });
    const user = await findUser(username);
    if (!user) return res.status(401).json({ error: 'Пользователь не найден' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Неверный пароль' });
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token, username: user.username, wins: user.wins, losses: user.losses, bestScore: user.bestScore,
      elo: user.elo || 400, communityElo: user.communityElo || 400, avatarUrl: user.avatarUrl || '',
      lastNicknameChange: user.lastNicknameChange || null,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/google-auth', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'No credential provided' });
    const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { name } = payload;
    let user = await findUser(name);
    if (!user) {
      const randomPass = await bcrypt.hash(Math.random().toString(36), 10);
      user = await createUser(name, randomPass);
    }
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token, username: user.username, wins: user.wins || 0, losses: user.losses || 0, bestScore: user.bestScore || 0,
      elo: user.elo || 400, communityElo: user.communityElo || 400, avatarUrl: user.avatarUrl || '',
      lastNicknameChange: user.lastNicknameChange || null,
    });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

app.post('/api/stats', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Нет токена' });
    const { username } = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const { win, score, opponentElo, opponentUsername } = req.body;
    const statsResult = await updateStats(username, { win, score, opponentElo, opponentUsername });
    res.json({ ok: true, elo: statsResult?.elo, eloChange: statsResult?.eloChange });
  } catch {
    res.status(401).json({ error: 'Неверный токен' });
  }
});

app.get('/api/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Нет токена' });
    const { username } = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const user = await findUser(username);
    if (!user) return res.status(404).json({ error: 'Не найден' });
    res.json({
      username: user.username, wins: user.wins, losses: user.losses, bestScore: user.bestScore,
      elo: user.elo || 400, communityElo: user.communityElo || 400, adviceTokens: user.adviceTokens || 0,
      avatarUrl: user.avatarUrl || '', lastNicknameChange: user.lastNicknameChange || null,
    });
  } catch {
    res.status(401).json({ error: 'Неверный токен' });
  }
});

app.post('/api/profile/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Нет токена' });
    const { username } = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
    const avatarUrl = req.file.path; // Cloudinary URL is in req.file.path
    if (useInMemory) {
      const user = inMemoryUsers.get(username.toLowerCase());
      if (user) user.avatarUrl = avatarUrl;
    } else {
      await User.updateOne({ username }, { $set: { avatarUrl } });
    }
    res.json({ ok: true, avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/profile/username', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Нет токена' });
    const { username } = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const { newUsername } = req.body;
    if (!newUsername || newUsername.length < 3) return res.status(400).json({ error: 'Имя минимум 3 символа' });
    const user = await findUser(username);
    if (!user) return res.status(404).json({ error: 'Не найден' });
    if (user.lastNicknameChange) {
      const diffDays = (Date.now() - new Date(user.lastNicknameChange).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) return res.status(400).json({ error: `Сменить ник можно будет через ${Math.ceil(7 - diffDays)} дн.` });
    }
    const exists = await findUser(newUsername);
    if (exists && exists.username.toLowerCase() !== username.toLowerCase()) return res.status(409).json({ error: 'Это имя уже занято' });
    const now = new Date();
    if (useInMemory) {
      const u = inMemoryUsers.get(username.toLowerCase());
      if (u) {
        u.username = newUsername;
        u.lastNicknameChange = now;
        inMemoryUsers.delete(username.toLowerCase());
        inMemoryUsers.set(newUsername.toLowerCase(), u);
      }
    } else {
      await User.updateOne({ username }, { $set: { username: newUsername, lastNicknameChange: now } });
    }
    res.json({ ok: true, username: newUsername, lastNicknameChange: now });
  } catch (err) {
    console.error('Username change error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

async function generatePayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST', body: 'grant_type=client_credentials', headers: { Authorization: `Basic ${auth}` },
  });
  const data = await response.json();
  return data.access_token;
}

app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const accessToken = await generatePayPalAccessToken();
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [{ amount: { currency_code: 'USD', value: '2.00' }, description: 'MogBattle Premium' }] }),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderID, analysis, lang } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Нет токена' });
    jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET);
    const accessToken = await generatePayPalAccessToken();
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    if (data.status === 'COMPLETED') {
      const advice = generatePremiumAdvice(analysis, lang);
      res.json({ ok: true, data, advice });
    } else { res.status(400).json({ error: 'Failed' }); }
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/use-analysis-ticket', async (req, res) => {
  try {
    const { analysis, lang } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Нет токена' });
    jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET);
    const advice = generatePremiumAdvice(analysis, lang);
    res.json({ ok: true, advice });
  } catch { res.status(401).json({ error: 'Failed' }); }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const type = req.query.type || 'arena';
    const sortField = type === 'community' ? 'communityElo' : 'elo';
    if (useInMemory) {
      const sorted = Array.from(inMemoryUsers.values()).sort((a, b) => (b[sortField] || 400) - (a[sortField] || 400)).slice(0, 20);
      return res.json(sorted.map(u => ({
        username: u.username, bestScore: u.bestScore || 0, elo: u.elo || 400, communityElo: u.communityElo || 400,
        wins: u.wins || 0, losses: u.losses || 0, avatarUrl: u.avatarUrl || ''
      })));
    }
    const topUsers = await User.find({}, { username: 1, bestScore: 1, elo: 1, communityElo: 1, wins: 1, losses: 1, avatarUrl: 1, _id: 0 }).sort({ [sortField]: -1 }).limit(20);
    res.json(topUsers);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/vote/pair', async (req, res) => {
  try {
    let allUsers = [];
    if (useInMemory) {
      allUsers = Array.from(inMemoryUsers.values()).filter(u => u.avatarUrl);
    } else {
      allUsers = await User.find({ avatarUrl: { $ne: '' } }, { username: 1, avatarUrl: 1, communityElo: 1, communityWins: 1, communityLosses: 1 });
    }
    if (allUsers.length < 2) return res.status(400).json({ error: 'Недостаточно пользователей' });
    const idx1 = Math.floor(Math.random() * allUsers.length);
    let idx2 = Math.floor(Math.random() * allUsers.length);
    while (idx1 === idx2) idx2 = Math.floor(Math.random() * allUsers.length);
    const getWinRate = (u) => {
      const total = (u.communityWins || 0) + (u.communityLosses || 0);
      return total === 0 ? 0 : Math.round(((u.communityWins || 0) / total) * 100);
    };
    res.json({
      player1: { username: allUsers[idx1].username, avatarUrl: allUsers[idx1].avatarUrl, elo: allUsers[idx1].communityElo, winRate: getWinRate(allUsers[idx1]) },
      player2: { username: allUsers[idx2].username, avatarUrl: allUsers[idx2].avatarUrl, elo: allUsers[idx2].communityElo, winRate: getWinRate(allUsers[idx2]) }
    });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/vote/result', async (req, res) => {
  try {
    const { winnerUsername, loserUsername } = req.body;
    const winner = await findUser(winnerUsername);
    const loser = await findUser(loserUsername);
    if (!winner || !loser) return res.status(404).json({ error: 'Не найден' });
    const K = 32;
    const wElo = winner.communityElo || 400;
    const lElo = loser.communityElo || 400;
    const expectedW = 1 / (1 + Math.pow(10, (lElo - wElo) / 400));
    const newWElo = Math.round(wElo + K * (1 - expectedW));
    const newLElo = Math.round(lElo + K * (0 - (1 - expectedW)));
    winner.communityWins = (winner.communityWins || 0) + 1;
    loser.communityLosses = (loser.communityLosses || 0) + 1;
    winner.communityElo = newWElo;
    loser.communityElo = newLElo;
    if (useInMemory) {
      inMemoryUsers.set(winnerUsername.toLowerCase(), winner);
      inMemoryUsers.set(loserUsername.toLowerCase(), loser);
    } else {
      await winner.save();
      await loser.save();
    }
    res.json({ success: true, newElo: newWElo, agreement: newWElo > newLElo ? 72 : 48 });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/users/names', async (req, res) => {
  try {
    if (useInMemory) return res.json(Array.from(inMemoryUsers.values()).map(u => u.username));
    const users = await User.find({}, { username: 1, _id: 0 }).limit(50);
    res.json(users.map(u => u.username));
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/online', (req, res) => { res.json({ online: io.engine.clientsCount }); });

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const PORT = process.env.PORT || 3001;
let rooms = {};
let matchmakingQueue = [];

io.on('connection', (socket) => {
  socket.on('join_random', () => {
    matchmakingQueue = matchmakingQueue.filter(id => id !== socket.id);
    let opponentId = null;
    while (matchmakingQueue.length > 0) {
      const candidateId = matchmakingQueue.shift();
      const candidateSocket = io.sockets.sockets.get(candidateId);
      if (candidateSocket && candidateSocket.connected && candidateId !== socket.id) { opponentId = candidateId; break; }
    }
    if (opponentId) {
      const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      io.to(socket.id).emit('match_found', newRoomCode);
      io.to(opponentId).emit('match_found', newRoomCode);
    } else matchmakingQueue.push(socket.id);
  });
  socket.on('join_room', (roomCode) => {
    socket.join(roomCode);
    if (!rooms[roomCode]) rooms[roomCode] = { players: {}, readyStates: {} };
    rooms[roomCode].players[socket.id] = true;
    rooms[roomCode].readyStates[socket.id] = false;
    socket.data.room = roomCode;
    const playerIds = Object.keys(rooms[roomCode].players);
    io.to(roomCode).emit('room_update', playerIds.length);
    if (playerIds.length === 2) io.to(playerIds[0]).emit('user_joined', socket.id);
  });
  socket.on('leave_room', () => handleDisconnectOrLeave(socket));
  socket.on('sending_signal', payload => io.to(payload.userToSignal).emit('user_joined_signal', { signal: payload.signal, callerID: payload.callerID }));
  socket.on('returning_signal', payload => io.to(payload.callerID).emit('receiving_returned_signal', { signal: payload.signal, id: socket.id }));
  socket.on('set_ready', ({ isReady, roomCode, username, elo }) => {
    if (!rooms[roomCode]) return;
    rooms[roomCode].readyStates[socket.id] = isReady;
    socket.to(roomCode).emit('opponent_ready', { isReady, username, elo });
    const playerIds = Object.keys(rooms[roomCode].players);
    if (playerIds.length >= 2 && playerIds.filter(id => rooms[roomCode].readyStates[id]).length >= 2) {
      io.to(roomCode).emit('start_battle');
      playerIds.forEach(id => rooms[roomCode].readyStates[id] = false);
      io.to(roomCode).emit('opponent_ready', { isReady: false });
    }
  });
  socket.on('submit_snapshot', (data) => {
    const roomCode = socket.data.room;
    if (roomCode) socket.to(roomCode).emit('opponent_snapshot', { playerId: socket.id, image: data.image, analysis: data.analysis });
  });
  socket.on('disconnect', () => { matchmakingQueue = matchmakingQueue.filter(id => id !== socket.id); handleDisconnectOrLeave(socket); });
  function handleDisconnectOrLeave(socket) {
    const roomCode = socket.data.room;
    if (roomCode && rooms[roomCode]) {
      socket.leave(roomCode);
      delete rooms[roomCode].players[socket.id];
      delete rooms[roomCode].readyStates[socket.id];
      socket.data.room = null;
      const playerCount = Object.keys(rooms[roomCode].players).length;
      io.to(roomCode).emit('room_update', playerCount);
      if (playerCount > 0) socket.to(roomCode).emit('opponent_disconnected');
      if (playerCount === 0) delete rooms[roomCode];
    }
  }
});

server.listen(PORT, () => { console.log(`🚀 Mog-Battle server running on port ${PORT}`); });

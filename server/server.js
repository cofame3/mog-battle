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

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
app.use(cors());
app.use(express.json());

// ─── MongoDB ────────────────────────────────────────────────────────────────
// Если нет реальной MongoDB, используем in-memory заглушку
let useInMemory = false;
const MONGO_URI = process.env.MONGO_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'mog-battle-secret-key-2024';

// In-memory хранилище (работает без MongoDB)
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

// ─── Mongoose User Model ─────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  elo: { type: Number, default: 400 },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// ─── Auth helpers ────────────────────────────────────────────────────────────
async function findUser(username) {
  if (useInMemory) return inMemoryUsers.get(username.toLowerCase()) || null;
  return User.findOne({ username: new RegExp(`^${username}$`, 'i') });
}

async function createUser(username, hashedPassword) {
  if (useInMemory) {
    const user = { username, password: hashedPassword, wins: 0, losses: 0, bestScore: 0, elo: 400 };
    inMemoryUsers.set(username.toLowerCase(), user);
    return user;
  }
  return User.create({ username, password: hashedPassword });
}

async function updateStats(username, { win, score, opponentElo }) {
  const K = 32;
  const oppElo = opponentElo || 400;

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

  const update = {};
  if (win === true) update.$inc = { wins: 1 };
  else if (win === false) update.$inc = { losses: 1 };
  update.$set = { elo: newElo };
  
  if (score) update.$max = { bestScore: score };
  await User.updateOne({ username }, update);
  
  return { elo: newElo, eloChange: newElo - currentElo };
}

// ─── REST API Routes ─────────────────────────────────────────────────────────

// POST /api/register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: 'Заполни все поля' });

    if (username.length < 3)
      return res.status(400).json({ error: 'Имя минимум 3 символа' });

    if (password.length < 4)
      return res.status(400).json({ error: 'Пароль минимум 4 символа' });

    const exists = await findUser(username);
    if (exists)
      return res.status(409).json({ error: 'Это имя уже занято' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser(username, hashed);

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: 'Заполни все поля' });

    const user = await findUser(username);
    if (!user)
      return res.status(401).json({ error: 'Пользователь не найден' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: 'Неверный пароль' });

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      username: user.username,
      wins: user.wins,
      losses: user.losses,
      bestScore: user.bestScore,
      elo: user.elo || 400,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/google-auth
app.post('/api/google-auth', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'No credential provided' });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, sub: googleId } = payload;

    let user = await findUser(name);
    
    if (!user) {
      const randomPass = await bcrypt.hash(Math.random().toString(36), 10);
      user = await createUser(name, randomPass);
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      username: user.username,
      wins: user.wins || 0,
      losses: user.losses || 0,
      bestScore: user.bestScore || 0,
      elo: user.elo || 400,
    });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// POST /api/stats  (обновить статистику после боя)
app.post('/api/stats', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Нет токена' });
    const { username } = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const { win, score, opponentElo } = req.body;
    const statsResult = await updateStats(username, { win, score, opponentElo });
    res.json({ ok: true, elo: statsResult?.elo, eloChange: statsResult?.eloChange });
  } catch {
    res.status(401).json({ error: 'Неверный токен' });
  }
});

// GET /api/me  (получить профиль)
app.get('/api/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Нет токена' });
    const { username } = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const user = await findUser(username);
    if (!user) return res.status(404).json({ error: 'Не найден' });
    res.json({ username: user.username, wins: user.wins, losses: user.losses, bestScore: user.bestScore, elo: user.elo || 400 });
  } catch {
    res.status(401).json({ error: 'Неверный токен' });
  }
});

// GET /api/leaderboard  (получить топ-20 игроков)
app.get('/api/leaderboard', async (req, res) => {
  try {
    if (useInMemory) {
      const allUsers = Array.from(inMemoryUsers.values());
      const sorted = allUsers.sort((a, b) => (b.elo || 400) - (a.elo || 400)).slice(0, 20);
      return res.json(sorted.map(u => ({ username: u.username, bestScore: u.bestScore || 0, elo: u.elo || 400, wins: u.wins || 0, losses: u.losses || 0 })));
    }
    const topUsers = await User.find({}, { username: 1, bestScore: 1, elo: 1, wins: 1, losses: 1, _id: 0 })
      .sort({ elo: -1 })
      .limit(20);
    res.json(topUsers);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── Socket.IO ───────────────────────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3001;

let rooms = {};
let matchmakingQueue = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_random', () => {
    if (matchmakingQueue.length > 0) {
      const opponentId = matchmakingQueue.shift();
      const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      io.to(socket.id).emit('match_found', newRoomCode);
      io.to(opponentId).emit('match_found', newRoomCode);
    } else {
      matchmakingQueue.push(socket.id);
    }
  });

  socket.on('join_room', (roomCode) => {
    socket.join(roomCode);

    if (!rooms[roomCode]) {
      rooms[roomCode] = { players: {}, readyStates: {} };
    }

    rooms[roomCode].players[socket.id] = true;
    rooms[roomCode].readyStates[socket.id] = false;
    socket.data.room = roomCode;

    const playerIds = Object.keys(rooms[roomCode].players);
    const playerCount = playerIds.length;
    io.to(roomCode).emit('room_update', playerCount);

    if (playerCount === 2) {
      const firstPlayerId = playerIds[0];
      io.to(firstPlayerId).emit('user_joined', socket.id);
    }
  });

  socket.on('leave_room', () => handleDisconnectOrLeave(socket));

  socket.on('sending_signal', payload => {
    io.to(payload.userToSignal).emit('user_joined_signal', { signal: payload.signal, callerID: payload.callerID });
  });

  socket.on('returning_signal', payload => {
    io.to(payload.callerID).emit('receiving_returned_signal', { signal: payload.signal, id: socket.id });
  });

  socket.on('set_ready', ({ isReady, roomCode, username }) => {
    if (!rooms[roomCode]) return;
    rooms[roomCode].readyStates[socket.id] = isReady;
    socket.to(roomCode).emit('opponent_ready', { isReady, username });

    const playerIds = Object.keys(rooms[roomCode].players);
    if (playerIds.length >= 2) {
      const readyPlayers = playerIds.filter(id => rooms[roomCode].readyStates[id]);
      if (readyPlayers.length >= 2) {
        io.to(roomCode).emit('start_battle');
        playerIds.forEach(id => rooms[roomCode].readyStates[id] = false);
        io.to(roomCode).emit('opponent_ready', { isReady: false });
      }
    }
  });

  socket.on('submit_snapshot', (data) => {
    const roomCode = socket.data.room;
    if (roomCode) {
      socket.to(roomCode).emit('opponent_snapshot', {
        playerId: socket.id,
        image: data.image,
        analysis: data.analysis,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    matchmakingQueue = matchmakingQueue.filter(id => id !== socket.id);
    handleDisconnectOrLeave(socket);
  });

  function handleDisconnectOrLeave(socket) {
    const roomCode = socket.data.room;
    if (roomCode && rooms[roomCode]) {
      socket.leave(roomCode);
      delete rooms[roomCode].players[socket.id];
      delete rooms[roomCode].readyStates[socket.id];
      socket.data.room = null;

      const playerCount = Object.keys(rooms[roomCode].players).length;
      io.to(roomCode).emit('room_update', playerCount);
      socket.to(roomCode).emit('opponent_ready', false);

      if (playerCount === 0) delete rooms[roomCode];
    }
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Mog-Battle server running on port ${PORT}`);
});

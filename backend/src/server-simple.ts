import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'secret';

// Base de dados em memória (para demo)
const users: any[] = [];
const games: any[] = [];
let userId = 1;
let gameId = 1;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar se já existe
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    if (users.find((u) => u.username === username)) {
      return res.status(400).json({ error: 'Nome de usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: userId++,
      username,
      email,
      password: hashedPassword,
    };

    users.push(newUser);

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: { id: newUser.id, username, email },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login realizado com sucesso',
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Middleware de autenticação
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no token' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Enviar pontuação
app.post('/api/game/score', authMiddleware, (req: any, res) => {
  try {
    const { score, taps, duration } = req.body;
    const userId = req.userId;

    const game = {
      id: gameId++,
      user_id: userId,
      score,
      taps,
      duration,
      played_at: new Date(),
    };

    games.push(game);

    res.status(201).json({
      message: 'Pontuação registrada com sucesso',
      gameId: game.id,
      score,
      taps,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar pontuação' });
  }
});

// Leaderboard
app.get('/api/game/leaderboard', authMiddleware, (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;

    // Ordenar por pontuação
    const sortedGames = [...games]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const leaderboard = sortedGames.map((game, index) => {
      const user = users.find((u) => u.id === game.user_id);
      return {
        rank: index + 1,
        userId: user?.id,
        username: user?.username,
        score: game.score,
        taps: game.taps,
        played_at: game.played_at,
      };
    });

    res.json({ leaderboard, cached: false });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar leaderboard' });
  }
});

// Estatísticas do usuário
app.get('/api/game/stats', authMiddleware, (req: any, res) => {
  try {
    const userId = req.userId;
    const userGames = games.filter((g) => g.user_id === userId);

    const bestScore = userGames.length > 0 ? Math.max(...userGames.map((g) => g.score)) : 0;

    const recentGames = userGames
      .sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime())
      .slice(0, 10);

    res.json({
      stats: {
        totalGames: userGames.length,
        bestScore,
        recentGames,
      },
      cached: false,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Estatísticas globais
app.get('/api/game/global-stats', authMiddleware, (req, res) => {
  res.json({
    totalGames: games.length,
    timestamp: new Date(),
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 API disponível em http://localhost:${PORT}/api`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n💾 Modo: EM MEMÓRIA (sem banco de dados)\n`);
});


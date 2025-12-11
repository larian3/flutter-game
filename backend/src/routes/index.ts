import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { GameController } from '../controllers/GameController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Rota de health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    service: 'Tap Game API'
  });
});

// Rotas de autenticação (públicas)
router.post('/auth/register', AuthController.validateRegister, AuthController.register);
router.post('/auth/login', AuthController.validateLogin, AuthController.login);

// Rotas de jogo (protegidas)
router.post('/game/score', authMiddleware, GameController.validateScore, GameController.submitScore);
router.get('/game/leaderboard', authMiddleware, GameController.getLeaderboard);
router.get('/game/stats', authMiddleware, GameController.getUserStats);
router.get('/game/global-stats', authMiddleware, GameController.getGlobalStats);

export default router;


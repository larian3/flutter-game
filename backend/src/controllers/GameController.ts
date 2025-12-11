import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { GameModel } from '../models/Game';
import { getCache, setCache, CACHE_TTL } from '../config/redis';

export class GameController {
  static validateScore = [
    body('score').isInt({ min: 0 }),
    body('taps').isInt({ min: 0 }),
    body('duration').optional().isInt({ min: 1, max: 60 })
  ];

  static async submitScore(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { score, taps, duration = 30 } = req.body;
      const userId = req.userId!;

      // Validação básica: não pode ter mais de 1 tap por 0.1 segundo
      const maxPossibleTaps = duration * 10;
      if (taps > maxPossibleTaps) {
        return res.status(400).json({ error: 'Pontuação suspeita detectada' });
      }

      // Criar registro do jogo
      const gameId = await GameModel.create(userId, score, taps, duration);

      // Invalidar cache do leaderboard
      await setCache('leaderboard:invalidate', Date.now().toString(), 1);

      return res.status(201).json({
        message: 'Pontuação registrada com sucesso',
        gameId,
        score,
        taps
      });
    } catch (error) {
      console.error('Submit score error:', error);
      return res.status(500).json({ error: 'Erro ao registrar pontuação' });
    }
  }

  static async getLeaderboard(req: AuthRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 100;

      // Tentar buscar do cache
      const cacheKey = `leaderboard:${limit}`;
      const cached = await getCache(cacheKey);

      if (cached) {
        return res.json({
          leaderboard: JSON.parse(cached),
          cached: true
        });
      }

      // Buscar do banco
      const leaderboard = await GameModel.getLeaderboard(limit);

      // Salvar no cache
      await setCache(cacheKey, JSON.stringify(leaderboard), CACHE_TTL.LEADERBOARD);

      return res.json({
        leaderboard,
        cached: false
      });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return res.status(500).json({ error: 'Erro ao buscar leaderboard' });
    }
  }

  static async getUserStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;

      // Tentar buscar do cache
      const cacheKey = `user:${userId}:stats`;
      const cached = await getCache(cacheKey);

      if (cached) {
        return res.json({
          stats: JSON.parse(cached),
          cached: true
        });
      }

      // Buscar do banco
      const games = await GameModel.getUserGames(userId, 10);
      const bestScore = await GameModel.getUserBestScore(userId);

      const stats = {
        totalGames: games.length,
        bestScore,
        recentGames: games
      };

      // Salvar no cache
      await setCache(cacheKey, JSON.stringify(stats), CACHE_TTL.USER_STATS);

      return res.json({
        stats,
        cached: false
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }

  static async getGlobalStats(req: AuthRequest, res: Response) {
    try {
      const totalGames = await GameModel.getTotalGames();

      return res.json({
        totalGames,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get global stats error:', error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas globais' });
    }
  }
}


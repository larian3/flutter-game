import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Game {
  id: number;
  user_id: number;
  score: number;
  duration: number;
  taps: number;
  played_at: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  score: number;
  taps: number;
  played_at: Date;
}

export class GameModel {
  static async create(userId: number, score: number, taps: number, duration: number = 30): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO games (user_id, score, taps, duration) VALUES (?, ?, ?, ?)',
      [userId, score, taps, duration]
    );
    return result.insertId;
  }

  static async getUserGames(userId: number, limit: number = 10): Promise<Game[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM games WHERE user_id = ? ORDER BY played_at DESC LIMIT ?',
      [userId, limit]
    );
    return rows as Game[];
  }

  static async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY g.score DESC, g.played_at ASC) as rank,
        u.id as userId,
        u.username,
        g.score,
        g.taps,
        g.played_at
      FROM games g
      INNER JOIN users u ON g.user_id = u.id
      ORDER BY g.score DESC, g.played_at ASC
      LIMIT ?`,
      [limit]
    );
    return rows as LeaderboardEntry[];
  }

  static async getUserBestScore(userId: number): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT MAX(score) as bestScore FROM games WHERE user_id = ?',
      [userId]
    );
    return rows[0]?.bestScore || 0;
  }

  static async getTotalGames(): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM games'
    );
    return rows[0]?.total || 0;
  }
}


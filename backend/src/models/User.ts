import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserStats {
  userId: number;
  username: string;
  totalGames: number;
  bestScore: number;
  averageScore: number;
  totalTaps: number;
}

export class UserModel {
  static async create(username: string, email: string, hashedPassword: string): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    return result.insertId;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  static async getUserStats(userId: number): Promise<UserStats | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        u.id as userId,
        u.username,
        COUNT(g.id) as totalGames,
        COALESCE(MAX(g.score), 0) as bestScore,
        COALESCE(AVG(g.score), 0) as averageScore,
        COALESCE(SUM(g.taps), 0) as totalTaps
      FROM users u
      LEFT JOIN games g ON u.id = g.user_id
      WHERE u.id = ?
      GROUP BY u.id, u.username`,
      [userId]
    );
    return rows.length > 0 ? (rows[0] as UserStats) : null;
  }
}


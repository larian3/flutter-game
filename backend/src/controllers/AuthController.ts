import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/User';

export class AuthController {
  static validateRegister = [
    body('username').isLength({ min: 3, max: 50 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ];

  static validateLogin = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ];

  static async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Verificar se usuário já existe
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Nome de usuário já existe' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário
      const userId = await UserModel.create(username, email, hashedPassword);

      // Gerar token
      const token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: userId,
          username,
          email
        },
        token
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Buscar usuário
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.json({
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }
}


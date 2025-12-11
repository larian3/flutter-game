import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  },
  password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected'));

export async function initRedis() {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Error connecting to Redis:', error);
    throw error;
  }
}

// Cache utilities
export const CACHE_TTL = {
  LEADERBOARD: 60, // 1 minuto
  USER_STATS: 300, // 5 minutos
  SESSION: 604800 // 7 dias
};

export async function getCache(key: string): Promise<string | null> {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCache(key: string, value: string, ttl?: number): Promise<void> {
  try {
    if (ttl) {
      await redisClient.setEx(key, ttl, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}


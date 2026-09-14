import { getRedisClient } from '@config/redis';
import logger from '@utils/logger';

class CacheService {
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const client = getRedisClient();
      const serialized = JSON.stringify(value);
      await client.setEx(key, ttl, serialized);
    } catch (error) {
      logger.error(`Cache set failed for key ${key}:`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Cache get failed for key ${key}:`, error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const client = getRedisClient();
      await client.del(key);
    } catch (error) {
      logger.error(`Cache delete failed for key ${key}:`, error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      logger.error(`Cache delete pattern failed for ${pattern}:`, error);
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      const client = getRedisClient();
      return await client.incrBy(key, amount);
    } catch (error) {
      logger.error(`Cache increment failed for key ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      const client = getRedisClient();
      await client.expire(key, ttl);
    } catch (error) {
      logger.error(`Cache expire failed for key ${key}:`, error);
    }
  }
}

export default new CacheService();

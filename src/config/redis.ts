import { createClient, RedisClientType } from 'redis';
import config from './env';
import logger from '@utils/logger';

let redisClient: RedisClientType | null = null;

const connectRedis = async (): Promise<RedisClientType> => {
  try {
    if (redisClient && redisClient.isOpen) {
      return redisClient;
    }

    redisClient = createClient({
      url: config.redis_url,
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Max Redis reconnection attempts reached');
            return new Error('Max retries exceeded');
          }
          return retries * 50;
        },
      },
    });

    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    redisClient.on('connect', () => logger.info('✅ Redis connected'));
    redisClient.on('reconnecting', () => logger.info('Redis reconnecting...'));

    await redisClient.connect();
    logger.info('✅ Redis connection established');

    return redisClient;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
};

const getRedisClient = (): RedisClientType => {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis client not connected');
  }
  return redisClient;
};

const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('✅ Redis disconnected');
  }
};

export { connectRedis, getRedisClient, disconnectRedis };

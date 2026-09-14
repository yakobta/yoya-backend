import mongoose from 'mongoose';
import config from './env';
import logger from '@utils/logger';

const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = config.node_env === 'production' 
      ? process.env.MONGODB_URI_PROD || config.mongodb_uri
      : config.mongodb_uri;

    const connection = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      retryReads: true,
    });

    logger.info(`✅ MongoDB connected: ${connection.connection.host}`);

    // Enable automatic text indexing for search
    mongoose.set('autoIndex', config.node_env !== 'production');

    return;
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    // Retry connection after 5 seconds
    setTimeout(() => connectDatabase(), 5000);
  }
};

const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('✅ MongoDB disconnected');
  } catch (error) {
    logger.error('❌ MongoDB disconnection failed:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB error:', error);
});

export { connectDatabase, disconnectDatabase };

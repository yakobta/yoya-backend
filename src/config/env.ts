import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  node_env: string;
  port: number;
  api_version: string;
  log_level: string;
  mongodb_uri: string;
  redis_url: string;
  jwt_secret: string;
  jwt_refresh_secret: string;
  jwt_expiry: string;
  jwt_refresh_expiry: string;
  cors_origin: string[];
  cors_credentials: boolean;
  elevenlabs_api_key: string;
  elevenlabs_base_url: string;
  heygen_api_key: string;
  heygen_base_url: string;
  openai_api_key: string;
  google_translate_api_key: string;
  cloudinary_cloud_name: string;
  cloudinary_api_key: string;
  cloudinary_api_secret: string;
  cloudinary_folder: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_from: string;
  smtp_from_name: string;
  stripe_secret_key: string;
  stripe_public_key: string;
  stripe_webhook_secret: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
  sentry_dsn: string;
  sentry_environment: string;
  app_name: string;
  app_url: string;
  frontend_url: string;
  feature_voice_cloning: boolean;
  feature_avatar_generation: boolean;
  feature_video_synthesis: boolean;
  feature_real_time_calls: boolean;
  feature_translation: boolean;
  feature_payment: boolean;
  feature_analytics: boolean;
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || defaultValue || '';
};

const config: EnvConfig = {
  node_env: getEnv('NODE_ENV', 'development'),
  port: parseInt(getEnv('PORT', '3000'), 10),
  api_version: getEnv('API_VERSION', 'v1'),
  log_level: getEnv('LOG_LEVEL', 'info'),
  mongodb_uri: getEnv('MONGODB_URI', 'mongodb://localhost:27017/yoya'),
  redis_url: getEnv('REDIS_URL', 'redis://localhost:6379'),
  jwt_secret: getEnv('JWT_SECRET'),
  jwt_refresh_secret: getEnv('JWT_REFRESH_SECRET'),
  jwt_expiry: getEnv('JWT_EXPIRY', '15m'),
  jwt_refresh_expiry: getEnv('JWT_REFRESH_EXPIRY', '30d'),
  cors_origin: getEnv('CORS_ORIGIN', 'http://localhost:3000,http://localhost:8000').split(','),
  cors_credentials: getEnv('CORS_CREDENTIALS', 'true') === 'true',
  elevenlabs_api_key: getEnv('ELEVENLABS_API_KEY', ''),
  elevenlabs_base_url: getEnv('ELEVENLABS_BASE_URL', 'https://api.elevenlabs.io'),
  heygen_api_key: getEnv('HEYGEN_API_KEY', ''),
  heygen_base_url: getEnv('HEYGEN_BASE_URL', 'https://api.heygen.com'),
  openai_api_key: getEnv('OPENAI_API_KEY', ''),
  google_translate_api_key: getEnv('GOOGLE_TRANSLATE_API_KEY', ''),
  cloudinary_cloud_name: getEnv('CLOUDINARY_CLOUD_NAME', ''),
  cloudinary_api_key: getEnv('CLOUDINARY_API_KEY', ''),
  cloudinary_api_secret: getEnv('CLOUDINARY_API_SECRET', ''),
  cloudinary_folder: getEnv('CLOUDINARY_FOLDER', 'yoya'),
  smtp_host: getEnv('SMTP_HOST', 'smtp.gmail.com'),
  smtp_port: parseInt(getEnv('SMTP_PORT', '587'), 10),
  smtp_user: getEnv('SMTP_USER', ''),
  smtp_password: getEnv('SMTP_PASSWORD', ''),
  smtp_from: getEnv('SMTP_FROM', 'noreply@yoya.com'),
  smtp_from_name: getEnv('SMTP_FROM_NAME', 'Yoya Platform'),
  stripe_secret_key: getEnv('STRIPE_SECRET_KEY', ''),
  stripe_public_key: getEnv('STRIPE_PUBLIC_KEY', ''),
  stripe_webhook_secret: getEnv('STRIPE_WEBHOOK_SECRET', ''),
  twilio_account_sid: getEnv('TWILIO_ACCOUNT_SID', ''),
  twilio_auth_token: getEnv('TWILIO_AUTH_TOKEN', ''),
  twilio_phone_number: getEnv('TWILIO_PHONE_NUMBER', ''),
  sentry_dsn: getEnv('SENTRY_DSN', ''),
  sentry_environment: getEnv('SENTRY_ENVIRONMENT', 'development'),
  app_name: getEnv('APP_NAME', 'Yoya'),
  app_url: getEnv('APP_URL', 'http://localhost:3000'),
  frontend_url: getEnv('FRONTEND_URL', 'http://localhost:8000'),
  feature_voice_cloning: getEnv('FEATURE_VOICE_CLONING', 'true') === 'true',
  feature_avatar_generation: getEnv('FEATURE_AVATAR_GENERATION', 'true') === 'true',
  feature_video_synthesis: getEnv('FEATURE_VIDEO_SYNTHESIS', 'true') === 'true',
  feature_real_time_calls: getEnv('FEATURE_REAL_TIME_CALLS', 'true') === 'true',
  feature_translation: getEnv('FEATURE_TRANSLATION', 'true') === 'true',
  feature_payment: getEnv('FEATURE_PAYMENT', 'true') === 'true',
  feature_analytics: getEnv('FEATURE_ANALYTICS', 'true') === 'true',
};

export default config;

export const CONSTANTS = {
  // User roles
  ROLES: {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    USER: 'user',
    DEVELOPER: 'developer',
  },

  // Subscription plans
  PLANS: {
    FREE: 'free',
    BASIC: 'basic',
    PRO: 'pro',
    ENTERPRISE: 'enterprise',
  },

  // Message types
  MESSAGE_TYPES: {
    TEXT: 'text',
    VOICE: 'voice',
    VIDEO: 'video',
    IMAGE: 'image',
    FILE: 'file',
    LOCATION: 'location',
    CONTACT: 'contact',
  },

  // Message status
  MESSAGE_STATUS: {
    PENDING: 'pending',
    DELIVERED: 'delivered',
    READ: 'read',
    DELETED: 'deleted',
    FAILED: 'failed',
  },

  // Call types
  CALL_TYPES: {
    VOICE: 'voice',
    VIDEO: 'video',
    SCREEN_SHARE: 'screen_share',
  },

  // Call status
  CALL_STATUS: {
    INITIATED: 'initiated',
    RINGING: 'ringing',
    ACCEPTED: 'accepted',
    ONGOING: 'ongoing',
    ENDED: 'ended',
    MISSED: 'missed',
    REJECTED: 'rejected',
  },

  // Voice model status
  VOICE_STATUS: {
    TRAINING: 'training',
    READY: 'ready',
    FAILED: 'failed',
    DEPRECATED: 'deprecated',
  },

  // Avatar status
  AVATAR_STATUS: {
    PROCESSING: 'processing',
    READY: 'ready',
    FAILED: 'failed',
  },

  // Payment status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled',
  },

  // Notification types
  NOTIFICATION_TYPES: {
    MESSAGE: 'message',
    CALL: 'call',
    FRIEND_REQUEST: 'friend_request',
    PAYMENT: 'payment',
    SYSTEM: 'system',
    REMINDER: 'reminder',
  },

  // File constraints
  FILE_CONSTRAINTS: {
    VOICE_MAX_SIZE: 50 * 1024 * 1024, // 50MB
    AVATAR_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
    FILE_MAX_SIZE: 100 * 1024 * 1024, // 100MB
    MESSAGE_MAX_LENGTH: 5000,
    BIO_MAX_LENGTH: 500,
    VOICE_MIN_DURATION: 30, // seconds
    VOICE_MAX_DURATION: 120, // seconds
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // Cache TTL (Time To Live) in seconds
  CACHE_TTL: {
    SHORT: 5 * 60, // 5 minutes
    MEDIUM: 30 * 60, // 30 minutes
    LONG: 24 * 60 * 60, // 24 hours
  },

  // Error messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Not found',
    BAD_REQUEST: 'Bad request',
    CONFLICT: 'Resource already exists',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    INVALID_TOKEN: 'Invalid or expired token',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_ALREADY_EXISTS: 'Email already registered',
    USER_NOT_FOUND: 'User not found',
    MESSAGE_NOT_FOUND: 'Message not found',
    CONVERSATION_NOT_FOUND: 'Conversation not found',
  },

  // Success messages
  SUCCESS_MESSAGES: {
    EMAIL_VERIFIED: 'Email verified successfully',
    PASSWORD_RESET: 'Password reset successfully',
    LOGIN_SUCCESS: 'Logged in successfully',
    LOGOUT_SUCCESS: 'Logged out successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    MESSAGE_SENT: 'Message sent successfully',
    VOICE_CLONED: 'Voice cloned successfully',
    AVATAR_CREATED: 'Avatar created successfully',
  },

  // Feature flags
  FEATURES: {
    VOICE_CLONING: 'voice_cloning',
    AVATAR_GENERATION: 'avatar_generation',
    VIDEO_SYNTHESIS: 'video_synthesis',
    REAL_TIME_CALLS: 'real_time_calls',
    TRANSLATION: 'translation',
    PAYMENT: 'payment',
    ANALYTICS: 'analytics',
  },

  // Email templates
  EMAIL_TEMPLATES: {
    VERIFICATION: 'verification',
    PASSWORD_RESET: 'password_reset',
    WELCOME: 'welcome',
    PAYMENT_RECEIPT: 'payment_receipt',
    PAYMENT_FAILED: 'payment_failed',
  },

  // Emotions for voice/avatar
  EMOTIONS: {
    NEUTRAL: 'neutral',
    HAPPY: 'happy',
    SAD: 'sad',
    ANGRY: 'angry',
    EXCITED: 'excited',
    CALM: 'calm',
    DISAPPOINTED: 'disappointed',
  },

  // Socket events
  SOCKET_EVENTS: {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    ERROR: 'error',

    // Messaging
    MESSAGE_SEND: 'message:send',
    MESSAGE_RECEIVED: 'message:received',
    MESSAGE_EDITED: 'message:edited',
    MESSAGE_DELETED: 'message:deleted',
    MESSAGE_READ: 'message:read',
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',

    // Presence
    USER_ONLINE: 'user:online',
    USER_OFFLINE: 'user:offline',
    PRESENCE_UPDATE: 'presence:update',

    // Calls
    CALL_INITIATE: 'call:initiate',
    CALL_RING: 'call:ring',
    CALL_ANSWER: 'call:answer',
    CALL_REJECT: 'call:reject',
    CALL_END: 'call:end',
    CALL_OFFER: 'call:offer',
    CALL_ANSWER_SIGNAL: 'call:answer_signal',
    ICE_CANDIDATE: 'call:ice_candidate',

    // Notifications
    NOTIFICATION_SEND: 'notification:send',
    NOTIFICATION_READ: 'notification:read',
  },
};

export default CONSTANTS;

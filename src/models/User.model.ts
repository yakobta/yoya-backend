import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { CONSTANTS } from '@config/constants';

export interface IUser extends Document {
  // Basic info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  avatar?: string;

  // Profile
  bio?: string;
  dateOfBirth?: Date;
  location?: string;
  timezone?: string;
  language?: string;

  // Subscription
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    startDate: Date;
    endDate?: Date;
    features: string[];
    renewalDate?: Date;
  };

  // Usage
  usage: {
    messageCount: number;
    voiceMinutes: number;
    videoMinutes: number;
    storageUsed: number;
    apiCallsCount: number;
  };

  // Preferences
  preferences: {
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      inApp: boolean;
    };
    privacy: 'public' | 'friends' | 'private';
    twoFactorEnabled: boolean;
    emailNotifications: boolean;
  };

  // Security
  security: {
    twoFactorSecret?: string;
    twoFactorBackupCodes?: string[];
    devices: Array<{
      id: string;
      name: string;
      type: string;
      lastUsed: Date;
    }>;
    lastLogin?: Date;
    ipHistory: Array<{
      ip: string;
      timestamp: Date;
    }>;
    passwordChangedAt?: Date;
  };

  // AI Models
  aiModels: {
    voiceModels: string[];
    avatarModels: string[];
    defaultVoice?: string;
    defaultAvatar?: string;
  };

  // Verification
  verification: {
    isVerified: boolean;
    verificationToken?: string;
    verificationTokenExpiry?: Date;
    resetToken?: string;
    resetTokenExpiry?: Date;
  };

  // Role & status
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  isDeleted: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Methods
  comparePassword(password: string): Promise<boolean>;
  generateAuthTokens(): Promise<{ accessToken: string; refreshToken: string }>;
  toJSON(): Partial<IUser>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name must not exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name must not exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio must not exceed 500 characters'],
    },
    dateOfBirth: Date,
    location: String,
    timezone: {
      type: String,
      default: 'UTC',
    },
    language: {
      type: String,
      default: 'en',
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled'],
        default: 'active',
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: Date,
      features: {
        type: [String],
        default: [],
      },
      renewalDate: Date,
    },
    usage: {
      messageCount: { type: Number, default: 0 },
      voiceMinutes: { type: Number, default: 0 },
      videoMinutes: { type: Number, default: 0 },
      storageUsed: { type: Number, default: 0 },
      apiCallsCount: { type: Number, default: 0 },
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'dark',
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        inApp: { type: Boolean, default: true },
      },
      privacy: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends',
      },
      twoFactorEnabled: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
    },
    security: {
      twoFactorSecret: String,
      twoFactorBackupCodes: [String],
      devices: [
        {
          id: String,
          name: String,
          type: String,
          lastUsed: Date,
        },
      ],
      lastLogin: Date,
      ipHistory: [
        {
          ip: String,
          timestamp: Date,
        },
      ],
      passwordChangedAt: Date,
    },
    aiModels: {
      voiceModels: { type: [String], default: [] },
      avatarModels: { type: [String], default: [] },
      defaultVoice: String,
      defaultAvatar: String,
    },
    verification: {
      isVerified: { type: Boolean, default: false },
      verificationToken: String,
      verificationTokenExpiry: Date,
      resetToken: String,
      resetTokenExpiry: Date,
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'banned'],
      default: 'active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ status: 1 });
userSchema.index({ isDeleted: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.security.passwordChangedAt = new Date();
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Generate auth tokens method
userSchema.methods.generateAuthTokens = async function (): Promise<{ accessToken: string; refreshToken: string }> {
  const jwt = require('jsonwebtoken');
  const config = require('@config/env').default;

  const accessToken = jwt.sign({ userId: this._id, email: this.email }, config.jwt_secret, {
    expiresIn: config.jwt_expiry,
  });

  const refreshToken = jwt.sign({ userId: this._id }, config.jwt_refresh_secret, {
    expiresIn: config.jwt_refresh_expiry,
  });

  return { accessToken, refreshToken };
};

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.security.twoFactorSecret;
  delete user.verification.resetToken;
  delete user.verification.verificationToken;
  return user;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;

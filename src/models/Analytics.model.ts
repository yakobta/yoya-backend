import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  metrics: {
    messagesCount: number;
    voiceCallsCount: number;
    voiceCallsDuration: number;
    videoCallsCount: number;
    videoCallsDuration: number;
    filesShared: number;
    storageUsed: number;
  };
  features: {
    voiceCloningUsed: boolean;
    avatarGenerated: boolean;
    videoSynthesized: boolean;
    translationUsed: boolean;
  };
  engagement: {
    activeMinutes: number;
    conversationsInitiated: number;
    conversationsResponded: number;
    averageResponseTime: number;
  };
  deviceInfo: {
    type: string;
    os: string;
    browser?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    metrics: {
      messagesCount: { type: Number, default: 0 },
      voiceCallsCount: { type: Number, default: 0 },
      voiceCallsDuration: { type: Number, default: 0 },
      videoCallsCount: { type: Number, default: 0 },
      videoCallsDuration: { type: Number, default: 0 },
      filesShared: { type: Number, default: 0 },
      storageUsed: { type: Number, default: 0 },
    },
    features: {
      voiceCloningUsed: { type: Boolean, default: false },
      avatarGenerated: { type: Boolean, default: false },
      videoSynthesized: { type: Boolean, default: false },
      translationUsed: { type: Boolean, default: false },
    },
    engagement: {
      activeMinutes: { type: Number, default: 0 },
      conversationsInitiated: { type: Number, default: 0 },
      conversationsResponded: { type: Number, default: 0 },
      averageResponseTime: { type: Number, default: 0 },
    },
    deviceInfo: {
      type: { type: String },
      os: { type: String },
      browser: String,
    },
  },
  { timestamps: true }
);

// Indexes
analyticsSchema.index({ userId: 1, date: -1 });
analyticsSchema.index({ date: -1 });

const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);

export default Analytics;

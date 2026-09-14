import mongoose, { Schema, Document } from 'mongoose';
import { CONSTANTS } from '@config/constants';

export interface IVoiceModel extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  voiceId: string; // ElevenLabs voice ID
  status: 'training' | 'ready' | 'failed' | 'deprecated';
  quality: number; // 0-100
  emotions: string[];
  sampleUrl?: string;
  sampleDuration?: number;
  processingProgress: number;
  errorMessage?: string;
  presets: Array<{
    name: string;
    emotion: string;
    stability: number;
    similarity: number;
  }>;
  usage: {
    totalCharacters: number;
    totalDuration: number;
    requestCount: number;
  };
  isPublic: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const voiceModelSchema = new Schema<IVoiceModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    voiceId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['training', 'ready', 'failed', 'deprecated'],
      default: 'training',
    },
    quality: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    emotions: [String],
    sampleUrl: String,
    sampleDuration: Number,
    processingProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    errorMessage: String,
    presets: [
      {
        name: String,
        emotion: String,
        stability: Number,
        similarity: Number,
      },
    ],
    usage: {
      totalCharacters: { type: Number, default: 0 },
      totalDuration: { type: Number, default: 0 },
      requestCount: { type: Number, default: 0 },
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
voiceModelSchema.index({ userId: 1 });
voiceModelSchema.index({ status: 1 });
voiceModelSchema.index({ isDefault: 1 });

const VoiceModel = mongoose.model<IVoiceModel>('VoiceModel', voiceModelSchema);

export default VoiceModel;

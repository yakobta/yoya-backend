import mongoose, { Schema, Document } from 'mongoose';

export interface IAvatarModel extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  avatarId: string; // HeyGen avatar ID
  status: 'processing' | 'ready' | 'failed';
  type: string; // 'realistic', 'cartoon', 'animated'
  previewUrl?: string;
  videoUrl?: string;
  processingProgress: number;
  errorMessage?: string;
  settings: {
    background?: string;
    lighting?: string;
    pose?: string;
    resolution: 'hd' | 'fhd' | '4k';
  };
  voiceModelId?: mongoose.Types.ObjectId;
  usage: {
    videoCount: number;
    totalDuration: number;
  };
  isPublic: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const avatarModelSchema = new Schema<IAvatarModel>(
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
    avatarId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },
    type: {
      type: String,
      default: 'realistic',
    },
    previewUrl: String,
    videoUrl: String,
    processingProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    errorMessage: String,
    settings: {
      background: String,
      lighting: String,
      pose: String,
      resolution: {
        type: String,
        enum: ['hd', 'fhd', '4k'],
        default: 'fhd',
      },
    },
    voiceModelId: Schema.Types.ObjectId,
    usage: {
      videoCount: { type: Number, default: 0 },
      totalDuration: { type: Number, default: 0 },
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
avatarModelSchema.index({ userId: 1 });
avatarModelSchema.index({ status: 1 });
avatarModelSchema.index({ isDefault: 1 });

const AvatarModel = mongoose.model<IAvatarModel>('AvatarModel', avatarModelSchema);

export default AvatarModel;

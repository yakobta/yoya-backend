import mongoose, { Schema, Document } from 'mongoose';

export interface ICall extends Document {
  initiatorId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  type: 'voice' | 'video' | 'screen_share';
  status: 'initiated' | 'ringing' | 'accepted' | 'ongoing' | 'ended' | 'missed' | 'rejected';
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in seconds
  recording?: {
    url: string;
    duration: number;
  };
  quality: {
    audio: 'poor' | 'fair' | 'good' | 'excellent';
    video: 'poor' | 'fair' | 'good' | 'excellent';
  };
  statistics: {
    packetsLost: number;
    latency: number;
    jitter: number;
    bandwidth: number;
  };
  participants?: mongoose.Types.ObjectId[];
  conversationId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const callSchema = new Schema<ICall>(
  {
    initiatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['voice', 'video', 'screen_share'],
      default: 'voice',
    },
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'accepted', 'ongoing', 'ended', 'missed', 'rejected'],
      default: 'initiated',
    },
    startTime: Date,
    endTime: Date,
    duration: Number,
    recording: {
      url: String,
      duration: Number,
    },
    quality: {
      audio: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent'],
        default: 'good',
      },
      video: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent'],
        default: 'good',
      },
    },
    statistics: {
      packetsLost: { type: Number, default: 0 },
      latency: { type: Number, default: 0 },
      jitter: { type: Number, default: 0 },
      bandwidth: { type: Number, default: 0 },
    },
    participants: [Schema.Types.ObjectId],
    conversationId: Schema.Types.ObjectId,
  },
  { timestamps: true }
);

// Indexes
callSchema.index({ initiatorId: 1, createdAt: -1 });
callSchema.index({ recipientId: 1, createdAt: -1 });
callSchema.index({ status: 1 });

const Call = mongoose.model<ICall>('Call', callSchema);

export default Call;

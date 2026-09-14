import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'message' | 'call' | 'friend_request' | 'payment' | 'system' | 'reminder';
  title: string;
  content: string;
  icon?: string;
  actionUrl?: string;
  read: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: ('email' | 'push' | 'sms' | 'inApp')[];
  relatedId?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['message', 'call', 'friend_request', 'payment', 'system', 'reminder'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    icon: String,
    actionUrl: String,
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    channels: {
      type: [String],
      enum: ['email', 'push', 'sms', 'inApp'],
      default: ['inApp'],
    },
    relatedId: Schema.Types.ObjectId,
    metadata: Schema.Types.Mixed,
    expiresAt: Date,
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;

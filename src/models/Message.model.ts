import mongoose, { Schema, Document } from 'mongoose';
import { CONSTANTS } from '@config/constants';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId?: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'voice' | 'video' | 'image' | 'file' | 'location' | 'contact';
  media?: {
    url: string;
    duration?: number;
    size?: number;
    mimeType?: string;
    thumbnail?: string;
    width?: number;
    height?: number;
  };
  metadata?: Record<string, any>;
  reactions: Array<{
    userId: mongoose.Types.ObjectId;
    emoji: string;
  }>;
  replyTo?: mongoose.Types.ObjectId;
  editHistory: Array<{
    content: string;
    editedAt: Date;
  }>;
  status: 'pending' | 'delivered' | 'read' | 'deleted' | 'failed';
  readBy: Array<{
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }>;
  deliveredTo: Array<{
    userId: mongoose.Types.ObjectId;
    deliveredAt: Date;
  }>;
  deletedFor?: mongoose.Types.ObjectId[];
  expiresAt?: Date;
  isEncrypted: boolean;
  encryptionKey?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
      maxlength: [5000, 'Message content must not exceed 5000 characters'],
    },
    type: {
      type: String,
      enum: ['text', 'voice', 'video', 'image', 'file', 'location', 'contact'],
      default: 'text',
    },
    media: {
      url: String,
      duration: Number,
      size: Number,
      mimeType: String,
      thumbnail: String,
      width: Number,
      height: Number,
    },
    metadata: Schema.Types.Mixed,
    reactions: [
      {
        userId: Schema.Types.ObjectId,
        emoji: String,
      },
    ],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    editHistory: [
      {
        content: String,
        editedAt: Date,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'delivered', 'read', 'deleted', 'failed'],
      default: 'pending',
    },
    readBy: [
      {
        userId: Schema.Types.ObjectId,
        readAt: Date,
      },
    ],
    deliveredTo: [
      {
        userId: Schema.Types.ObjectId,
        deliveredAt: Date,
      },
    ],
    deletedFor: [Schema.Types.ObjectId],
    expiresAt: Date,
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    encryptionKey: String,
    deletedAt: Date,
  },
  { timestamps: true }
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// TTL index for messages with expiration
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;

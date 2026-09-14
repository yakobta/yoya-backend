import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  type: 'private' | 'group';
  name?: string;
  description?: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    senderId: mongoose.Types.ObjectId;
    timestamp: Date;
  };
  unreadCount: Map<string, number>;
  settings: {
    muteNotifications: boolean;
    archiveChat: boolean;
    blockUser: boolean;
  };
  createdBy: mongoose.Types.ObjectId;
  admins?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['private', 'group'],
      default: 'private',
    },
    name: String,
    description: String,
    avatar: String,
    lastMessage: {
      content: String,
      senderId: Schema.Types.ObjectId,
      timestamp: Date,
    },
    unreadCount: Map,
    settings: {
      muteNotifications: { type: Boolean, default: false },
      archiveChat: { type: Boolean, default: false },
      blockUser: { type: Boolean, default: false },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    admins: [Schema.Types.ObjectId],
  },
  { timestamps: true }
);

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation;

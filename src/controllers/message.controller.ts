import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import Message from '@models/Message.model';
import Conversation from '@models/Conversation.model';
import { NotFoundError, ValidationError, ForbiddenError } from '@middleware/errorHandler.middleware';
import logger from '@utils/logger';
import { CONSTANTS } from '@config/constants';

export class MessageController {
  async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { conversationId, content, type = 'text', receiverId, mediaUrl } = req.body;

      if (!conversationId || !content) {
        throw new ValidationError('Conversation ID and content are required');
      }

      // Verify user is participant in conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.includes(req.userId!)) {
        throw new ForbiddenError('You are not a participant in this conversation');
      }

      const message = new Message({
        conversationId,
        senderId: req.userId,
        receiverId,
        content,
        type,
        media: mediaUrl
          ? {
              url: mediaUrl,
            }
          : undefined,
        status: 'delivered',
      });

      await message.save();

      // Update conversation last message
      conversation.lastMessage = {
        content,
        senderId: req.userId!,
        timestamp: new Date(),
      };
      await conversation.save();

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConversationMessages(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Verify user is participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.includes(req.userId!)) {
        throw new ForbiddenError('You are not a participant in this conversation');
      }

      const skip = (Number(page) - 1) * Number(limit);

      const messages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('senderId', 'firstName lastName avatar');

      const total = await Message.countDocuments({ conversationId });

      res.json({
        success: true,
        data: messages.reverse(),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async editMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messageId } = req.params;
      const { content } = req.body;

      if (!content) {
        throw new ValidationError('Content is required');
      }

      const message = await Message.findById(messageId);
      if (!message) {
        throw new NotFoundError('Message');
      }

      if (message.senderId.toString() !== req.userId) {
        throw new ForbiddenError('You can only edit your own messages');
      }

      message.editHistory.push({
        content: message.content,
        editedAt: new Date(),
      });
      message.content = content;
      await message.save();

      res.json({
        success: true,
        message: 'Message updated successfully',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messageId } = req.params;
      const { forEveryone = false } = req.body;

      const message = await Message.findById(messageId);
      if (!message) {
        throw new NotFoundError('Message');
      }

      if (message.senderId.toString() !== req.userId) {
        throw new ForbiddenError('You can only delete your own messages');
      }

      if (forEveryone) {
        message.status = 'deleted';
        message.content = '[Deleted]';
        message.media = undefined;
      } else {
        message.deletedFor = message.deletedFor || [];
        message.deletedFor.push(req.userId!);
      }

      await message.save();

      res.json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { conversationId } = req.params;

      await Message.updateMany(
        {
          conversationId,
          status: { $in: ['delivered', 'pending'] },
        },
        {
          $push: {
            readBy: {
              userId: req.userId,
              readAt: new Date(),
            },
          },
          $set: { status: 'read' },
        }
      );

      res.json({
        success: true,
        message: 'Messages marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();

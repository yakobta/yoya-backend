import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import Call from '@models/Call.model';
import Conversation from '@models/Conversation.model';
import User from '@models/User.model';
import { NotFoundError, ValidationError, ForbiddenError } from '@middleware/errorHandler.middleware';
import logger from '@utils/logger';

export class CallController {
  async initiateCall(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recipientId, type = 'voice', conversationId } = req.body;

      if (!recipientId || !type) {
        throw new ValidationError('Recipient ID and call type are required');
      }

      const recipient = await User.findById(recipientId);
      if (!recipient) {
        throw new NotFoundError('Recipient');
      }

      if (recipient.status === 'banned') {
        throw new ValidationError('This user is not available');
      }

      const call = new Call({
        initiatorId: req.userId,
        recipientId,
        type,
        status: 'initiated',
        conversationId,
      });

      await call.save();

      res.status(201).json({
        success: true,
        message: 'Call initiated',
        data: call,
      });
    } catch (error) {
      next(error);
    }
  }

  async answerCall(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { callId } = req.params;

      const call = await Call.findById(callId);
      if (!call) {
        throw new NotFoundError('Call');
      }

      if (call.recipientId.toString() !== req.userId) {
        throw new ForbiddenError('You are not the recipient of this call');
      }

      call.status = 'accepted';
      call.startTime = new Date();
      await call.save();

      res.json({
        success: true,
        message: 'Call answered',
        data: call,
      });
    } catch (error) {
      next(error);
    }
  }

  async endCall(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { callId } = req.params;

      const call = await Call.findById(callId);
      if (!call) {
        throw new NotFoundError('Call');
      }

      if (
        call.initiatorId.toString() !== req.userId &&
        call.recipientId.toString() !== req.userId
      ) {
        throw new ForbiddenError('You are not part of this call');
      }

      call.status = 'ended';
      call.endTime = new Date();
      if (call.startTime) {
        call.duration = Math.floor(
          (call.endTime.getTime() - call.startTime.getTime()) / 1000
        );
      }
      await call.save();

      res.json({
        success: true,
        message: 'Call ended',
        data: call,
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectCall(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { callId } = req.params;

      const call = await Call.findById(callId);
      if (!call) {
        throw new NotFoundError('Call');
      }

      if (call.recipientId.toString() !== req.userId) {
        throw new ForbiddenError('You are not the recipient of this call');
      }

      call.status = 'rejected';
      await call.save();

      res.json({
        success: true,
        message: 'Call rejected',
      });
    } catch (error) {
      next(error);
    }
  }

  async getCallHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const calls = await Call.find({
        $or: [{ initiatorId: req.userId }, { recipientId: req.userId }],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('initiatorId', 'firstName lastName avatar')
        .populate('recipientId', 'firstName lastName avatar');

      const total = await Call.countDocuments({
        $or: [{ initiatorId: req.userId }, { recipientId: req.userId }],
      });

      res.json({
        success: true,
        data: calls,
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
}

export default new CallController();

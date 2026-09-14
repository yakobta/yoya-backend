import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import Notification from '@models/Notification.model';
import { NotFoundError } from '@middleware/errorHandler.middleware';

export class NotificationController {
  async getNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1, limit = 20, read } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const query: any = { userId: req.userId };
      if (read !== undefined) {
        query.read = read === 'true';
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Notification.countDocuments(query);

      res.json({
        success: true,
        data: notifications,
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

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { notificationId } = req.params;

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new NotFoundError('Notification');
      }

      notification.read = true;
      notification.readAt = new Date();
      await notification.save();

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await Notification.updateMany(
        { userId: req.userId, read: false },
        { read: true, readAt: new Date() }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { notificationId } = req.params;

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new NotFoundError('Notification');
      }

      await Notification.findByIdAndDelete(notificationId);

      res.json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();

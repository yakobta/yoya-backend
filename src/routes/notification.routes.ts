import { Router } from 'express';
import notificationController from '@controllers/notification.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, notificationController.getNotifications.bind(notificationController));
router.post('/:notificationId/read', authMiddleware, notificationController.markAsRead.bind(notificationController));
router.post('/read-all', authMiddleware, notificationController.markAllAsRead.bind(notificationController));
router.delete('/:notificationId', authMiddleware, notificationController.deleteNotification.bind(notificationController));

export default router;

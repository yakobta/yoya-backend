import { Router } from 'express';
import messageController from '@controllers/message.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, messageController.sendMessage.bind(messageController));
router.get('/:conversationId', authMiddleware, messageController.getConversationMessages.bind(messageController));
router.put('/:messageId', authMiddleware, messageController.editMessage.bind(messageController));
router.delete('/:messageId', authMiddleware, messageController.deleteMessage.bind(messageController));
router.post('/:conversationId/mark-read', authMiddleware, messageController.markAsRead.bind(messageController));

export default router;

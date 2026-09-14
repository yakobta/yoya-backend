import { Router } from 'express';
import callController from '@controllers/call.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

router.post('/initiate', authMiddleware, callController.initiateCall.bind(callController));
router.post('/:callId/answer', authMiddleware, callController.answerCall.bind(callController));
router.post('/:callId/end', authMiddleware, callController.endCall.bind(callController));
router.post('/:callId/reject', authMiddleware, callController.rejectCall.bind(callController));
router.get('/history', authMiddleware, callController.getCallHistory.bind(callController));

export default router;

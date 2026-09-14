import { Router } from 'express';
import paymentController from '@controllers/payment.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

router.post('/payment-intent', authMiddleware, paymentController.createPaymentIntent.bind(paymentController));
router.post('/confirm', authMiddleware, paymentController.confirmPayment.bind(paymentController));
router.get('/history', authMiddleware, paymentController.getPaymentHistory.bind(paymentController));
router.get('/subscription', authMiddleware, paymentController.getSubscription.bind(paymentController));
router.post('/subscription/cancel', authMiddleware, paymentController.cancelSubscription.bind(paymentController));

export default router;

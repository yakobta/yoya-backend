import { Router } from 'express';
import authController from '@controllers/auth.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/verify-email', authController.verifyEmail.bind(authController));
router.post('/request-password-reset', authController.requestPasswordReset.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
router.post('/logout', authMiddleware, authController.logout.bind(authController));

export default router;

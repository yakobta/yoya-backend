import { Router } from 'express';
import userController from '@controllers/user.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/profile', authMiddleware, userController.getProfile.bind(userController));
router.put('/profile', authMiddleware, userController.updateProfile.bind(userController));
router.post('/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar.bind(userController));
router.post('/change-password', authMiddleware, userController.changePassword.bind(userController));
router.delete('/account', authMiddleware, userController.deleteAccount.bind(userController));

export default router;

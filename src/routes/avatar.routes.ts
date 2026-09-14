import { Router } from 'express';
import avatarController from '@controllers/avatar.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post(
  '/',
  authMiddleware,
  upload.array('photos', 10),
  avatarController.createAvatar.bind(avatarController)
);
router.get('/', authMiddleware, avatarController.getAvatars.bind(avatarController));
router.get('/:avatarId', authMiddleware, avatarController.getAvatar.bind(avatarController));
router.post('/synthesize-video', authMiddleware, avatarController.synthesizeVideo.bind(avatarController));
router.delete('/:avatarId', authMiddleware, avatarController.deleteAvatar.bind(avatarController));

export default router;

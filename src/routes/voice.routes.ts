import { Router } from 'express';
import voiceController from '@controllers/voice.controller';
import { authMiddleware } from '@middleware/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post(
  '/models',
  authMiddleware,
  upload.array('audio', 10),
  voiceController.createVoiceModel.bind(voiceController)
);
router.get('/models', authMiddleware, voiceController.getVoiceModels.bind(voiceController));
router.get('/models/:voiceModelId', authMiddleware, voiceController.getVoiceModel.bind(voiceController));
router.post('/synthesize', authMiddleware, voiceController.synthesizeText.bind(voiceController));
router.delete('/models/:voiceModelId', authMiddleware, voiceController.deleteVoiceModel.bind(voiceController));

export default router;

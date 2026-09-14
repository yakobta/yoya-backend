import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import VoiceModel from '@models/VoiceModel.model';
import User from '@models/User.model';
import voiceCloneService from '@services/ai/voiceClone.service';
import storageService from '@services/storage.service';
import { NotFoundError, ValidationError, ForbiddenError } from '@middleware/errorHandler.middleware';
import logger from '@utils/logger';

export class VoiceController {
  async createVoiceModel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name } = req.body;

      if (!name) {
        throw new ValidationError('Voice name is required');
      }

      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        throw new ValidationError('At least one audio file is required');
      }

      const audioFiles = Array.isArray(req.files) ? req.files : [req.files];
      if (audioFiles.length < 3) {
        throw new ValidationError('Minimum 3 audio samples required');
      }

      // Create voice model record
      const voiceModel = new VoiceModel({
        userId: req.userId,
        name: name.trim(),
        status: 'training',
        processingProgress: 0,
      });

      await voiceModel.save();

      // Clone voice in background
      setImmediate(async () => {
        try {
          const buffers = audioFiles.map((f: any) => f.buffer);
          const result = await voiceCloneService.cloneVoice(name, buffers);

          voiceModel.voiceId = result.voice_id;
          voiceModel.status = 'ready';
          voiceModel.processingProgress = 100;
          voiceModel.quality = result.quality_score || 85;
          await voiceModel.save();

          // Update user default voice if this is their first
          const user = await User.findById(req.userId);
          if (user && !user.aiModels.defaultVoice) {
            user.aiModels.defaultVoice = voiceModel._id.toString();
            user.aiModels.voiceModels.push(voiceModel._id.toString());
            await user.save();
          }
        } catch (error) {
          logger.error('Voice cloning failed:', error);
          voiceModel.status = 'failed';
          voiceModel.errorMessage = (error as Error).message;
          await voiceModel.save();
        }
      });

      res.status(201).json({
        success: true,
        message: 'Voice model training started',
        data: voiceModel,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVoiceModels(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const voiceModels = await VoiceModel.find({ userId: req.userId }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: voiceModels,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVoiceModel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { voiceModelId } = req.params;

      const voiceModel = await VoiceModel.findById(voiceModelId);
      if (!voiceModel) {
        throw new NotFoundError('Voice model');
      }

      if (voiceModel.userId.toString() !== req.userId && !voiceModel.isPublic) {
        throw new ForbiddenError('You do not have access to this voice model');
      }

      res.json({
        success: true,
        data: voiceModel,
      });
    } catch (error) {
      next(error);
    }
  }

  async synthesizeText(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text, voiceModelId, emotion = 'neutral' } = req.body;

      if (!text || !voiceModelId) {
        throw new ValidationError('Text and voice model ID are required');
      }

      const voiceModel = await VoiceModel.findById(voiceModelId);
      if (!voiceModel) {
        throw new NotFoundError('Voice model');
      }

      if (voiceModel.status !== 'ready') {
        throw new ValidationError('Voice model is not ready for synthesis');
      }

      if (voiceModel.userId.toString() !== req.userId && !voiceModel.isPublic) {
        throw new ForbiddenError('You do not have access to this voice model');
      }

      const result = await voiceCloneService.synthesizeText(text, voiceModel.voiceId, emotion);

      // Update usage
      voiceModel.usage.totalCharacters += text.length;
      voiceModel.usage.requestCount += 1;
      await voiceModel.save();

      res.json({
        success: true,
        message: 'Text synthesized successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteVoiceModel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { voiceModelId } = req.params;

      const voiceModel = await VoiceModel.findById(voiceModelId);
      if (!voiceModel) {
        throw new NotFoundError('Voice model');
      }

      if (voiceModel.userId.toString() !== req.userId) {
        throw new ForbiddenError('You can only delete your own voice models');
      }

      // Delete from ElevenLabs
      await voiceCloneService.deleteVoice(voiceModel.voiceId);

      // Delete from database
      await VoiceModel.findByIdAndDelete(voiceModelId);

      // Update user
      const user = await User.findById(req.userId);
      if (user) {
        user.aiModels.voiceModels = user.aiModels.voiceModels.filter(
          (id) => id !== voiceModelId
        );
        if (user.aiModels.defaultVoice === voiceModelId) {
          user.aiModels.defaultVoice = undefined;
        }
        await user.save();
      }

      res.json({
        success: true,
        message: 'Voice model deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new VoiceController();

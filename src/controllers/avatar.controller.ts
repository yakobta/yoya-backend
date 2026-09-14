import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import AvatarModel from '@models/AvatarModel.model';
import User from '@models/User.model';
import avatarService from '@services/ai/avatarGen.service';
import voiceCloneService from '@services/ai/voiceClone.service';
import storageService from '@services/storage.service';
import { NotFoundError, ValidationError, ForbiddenError } from '@middleware/errorHandler.middleware';
import logger from '@utils/logger';

export class AvatarController {
  async createAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, type = 'realistic', voiceModelId } = req.body;

      if (!name) {
        throw new ValidationError('Avatar name is required');
      }

      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        throw new ValidationError('At least one photo is required');
      }

      const photos = Array.isArray(req.files) ? req.files : [req.files];
      if (photos.length < 2) {
        throw new ValidationError('Minimum 2 photos required for 3D reconstruction');
      }

      // Create avatar record
      const avatar = new AvatarModel({
        userId: req.userId,
        name: name.trim(),
        type,
        voiceModelId,
        status: 'processing',
        processingProgress: 0,
        settings: {
          resolution: 'fhd',
        },
      });

      await avatar.save();

      // Process avatar in background
      setImmediate(async () => {
        try {
          const photoUrls: string[] = [];
          for (let i = 0; i < photos.length; i++) {
            const url = await storageService.uploadImage(
              (photos[i] as any).buffer,
              `avatar_photo_${avatar._id}_${i}`
            );
            photoUrls.push(url);
          }

          const result = await avatarService.generateAvatar(name, type, photoUrls);

          avatar.avatarId = result.avatar_id;
          avatar.status = 'ready';
          avatar.processingProgress = 100;
          avatar.previewUrl = result.preview_url;
          avatar.videoUrl = result.video_url;
          await avatar.save();

          // Update user default avatar if this is their first
          const user = await User.findById(req.userId);
          if (user && !user.aiModels.defaultAvatar) {
            user.aiModels.defaultAvatar = avatar._id.toString();
            user.aiModels.avatarModels.push(avatar._id.toString());
            await user.save();
          }
        } catch (error) {
          logger.error('Avatar generation failed:', error);
          avatar.status = 'failed';
          avatar.errorMessage = (error as Error).message;
          await avatar.save();
        }
      });

      res.status(201).json({
        success: true,
        message: 'Avatar generation started',
        data: avatar,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvatars(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const avatars = await AvatarModel.find({ userId: req.userId }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: avatars,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { avatarId } = req.params;

      const avatar = await AvatarModel.findById(avatarId);
      if (!avatar) {
        throw new NotFoundError('Avatar');
      }

      if (avatar.userId.toString() !== req.userId && !avatar.isPublic) {
        throw new ForbiddenError('You do not have access to this avatar');
      }

      res.json({
        success: true,
        data: avatar,
      });
    } catch (error) {
      next(error);
    }
  }

  async synthesizeVideo(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { text, avatarId, voiceModelId, emotion = 'neutral' } = req.body;

      if (!text || !avatarId || !voiceModelId) {
        throw new ValidationError('Text, avatar ID, and voice model ID are required');
      }

      const avatar = await AvatarModel.findById(avatarId);
      if (!avatar) {
        throw new NotFoundError('Avatar');
      }

      if (avatar.status !== 'ready') {
        throw new ValidationError('Avatar is not ready for video synthesis');
      }

      if (avatar.userId.toString() !== req.userId && !avatar.isPublic) {
        throw new ForbiddenError('You do not have access to this avatar');
      }

      const result = await avatarService.synthesizeVideo(text, avatar.avatarId, voiceModelId, emotion);

      // Update usage
      avatar.usage.videoCount += 1;
      await avatar.save();

      res.json({
        success: true,
        message: 'Video synthesized successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { avatarId } = req.params;

      const avatar = await AvatarModel.findById(avatarId);
      if (!avatar) {
        throw new NotFoundError('Avatar');
      }

      if (avatar.userId.toString() !== req.userId) {
        throw new ForbiddenError('You can only delete your own avatars');
      }

      // Delete from database
      await AvatarModel.findByIdAndDelete(avatarId);

      // Update user
      const user = await User.findById(req.userId);
      if (user) {
        user.aiModels.avatarModels = user.aiModels.avatarModels.filter(
          (id) => id !== avatarId
        );
        if (user.aiModels.defaultAvatar === avatarId) {
          user.aiModels.defaultAvatar = undefined;
        }
        await user.save();
      }

      res.json({
        success: true,
        message: 'Avatar deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AvatarController();

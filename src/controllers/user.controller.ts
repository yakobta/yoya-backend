import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import User from '@models/User.model';
import logger from '@utils/logger';
import { NotFoundError, ValidationError } from '@middleware/errorHandler.middleware';
import storageService from '@services/storage.service';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        throw new NotFoundError('User');
      }

      res.json({
        success: true,
        data: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firstName, lastName, bio, location, timezone, language, theme } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Update allowed fields
      if (firstName) user.firstName = firstName.trim();
      if (lastName) user.lastName = lastName.trim();
      if (bio) user.bio = bio.substring(0, 500);
      if (location) user.location = location;
      if (timezone) user.timezone = timezone;
      if (language) user.language = language;
      if (theme) user.preferences.theme = theme;

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new ValidationError('No file provided');
      }

      const user = await User.findById(req.userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Delete old avatar if exists
      if (user.avatar) {
        const publicId = user.avatar.split('/').pop()?.split('.')[0];
        if (publicId) {
          await storageService.deleteFile(`yoya/avatars/${publicId}`);
        }
      }

      // Upload new avatar
      const url = await storageService.uploadImage(req.file.buffer, `avatar_${user._id}`);
      user.avatar = url;
      await user.save();

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: { avatar: user.avatar },
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ValidationError('All fields are required');
      }

      if (newPassword !== confirmPassword) {
        throw new ValidationError('Passwords do not match');
      }

      if (newPassword.length < 8) {
        throw new ValidationError('Password must be at least 8 characters');
      }

      const user = await User.findById(req.userId).select('+password');
      if (!user) {
        throw new NotFoundError('User');
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new ValidationError('Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password } = req.body;

      if (!password) {
        throw new ValidationError('Password is required');
      }

      const user = await User.findById(req.userId).select('+password');
      if (!user) {
        throw new NotFoundError('User');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new ValidationError('Password is incorrect');
      }

      // Soft delete
      user.isDeleted = true;
      user.deletedAt = new Date();
      user.status = 'inactive';
      await user.save();

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

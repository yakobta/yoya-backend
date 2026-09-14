import { Request, Response, NextFunction } from 'express';
import User from '@models/User.model';
import { generateTokens } from '@utils/jwt';
import { generateVerificationToken, generateResetToken } from '@utils/helpers';
import emailService from '@services/email.service';
import bcrypt from 'bcryptjs';
import logger from '@utils/logger';
import { ValidationError, UnauthorizedError } from '@middleware/errorHandler.middleware';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firstName, lastName, email, password, passwordConfirm } = req.body;

      // Validation
      if (!firstName || !lastName || !email || !password || !passwordConfirm) {
        throw new ValidationError('All fields are required');
      }

      if (password !== passwordConfirm) {
        throw new ValidationError('Passwords do not match');
      }

      if (password.length < 8) {
        throw new ValidationError('Password must be at least 8 characters');
      }

      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new ValidationError('Email already registered');
      }

      // Create user
      const verificationToken = generateVerificationToken();
      const user = new User({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase(),
        password,
        verification: {
          isVerified: false,
          verificationToken,
          verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      await user.save();

      // Send verification email
      await emailService.sendVerificationEmail(user.email, verificationToken);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        data: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user || !(await user.comparePassword(password))) {
        throw new UnauthorizedError('Invalid email or password');
      }

      if (user.status === 'banned') {
        throw new UnauthorizedError('Your account has been banned');
      }

      if (!user.verification.isVerified) {
        throw new UnauthorizedError('Please verify your email first');
      }

      // Generate tokens
      const { accessToken, refreshToken } = await user.generateAuthTokens();

      // Update last login
      user.security.lastLogin = new Date();
      user.security.ipHistory.push({
        ip: req.ip || 'unknown',
        timestamp: new Date(),
      });
      await user.save();

      res.json({
        success: true,
        message: 'Logged in successfully',
        data: {
          accessToken,
          refreshToken,
          user: user.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ValidationError('Verification token is required');
      }

      const user = await User.findOne({
        'verification.verificationToken': token,
        'verification.verificationTokenExpiry': { $gt: new Date() },
      });

      if (!user) {
        throw new UnauthorizedError('Invalid or expired verification token');
      }

      user.verification.isVerified = true;
      user.verification.verificationToken = undefined;
      user.verification.verificationTokenExpiry = undefined;
      await user.save();

      await emailService.sendWelcomeEmail(user.email, user.firstName);

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ValidationError('Email is required');
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Don't reveal if email exists (security best practice)
        res.json({
          success: true,
          message: 'If an account exists with this email, a password reset link will be sent',
        });
        return;
      }

      const resetToken = generateResetToken();
      user.verification.resetToken = resetToken;
      user.verification.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      await emailService.sendPasswordResetEmail(user.email, resetToken);

      res.json({
        success: true,
        message: 'Password reset link sent to your email',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password, passwordConfirm } = req.body;

      if (!token || !password || !passwordConfirm) {
        throw new ValidationError('Token and new password are required');
      }

      if (password !== passwordConfirm) {
        throw new ValidationError('Passwords do not match');
      }

      if (password.length < 8) {
        throw new ValidationError('Password must be at least 8 characters');
      }

      const user = await User.findOne({
        'verification.resetToken': token,
        'verification.resetTokenExpiry': { $gt: new Date() },
      }).select('+password');

      if (!user) {
        throw new UnauthorizedError('Invalid or expired reset token');
      }

      user.password = password;
      user.verification.resetToken = undefined;
      user.verification.resetTokenExpiry = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@middleware/auth.middleware';
import Payment from '@models/Payment.model';
import Subscription from '@models/Subscription.model';
import User from '@models/User.model';
import paymentService from '@services/payment.service';
import emailService from '@services/email.service';
import { NotFoundError, ValidationError } from '@middleware/errorHandler.middleware';
import logger from '@utils/logger';

const PLANS = {
  basic: { priceId: 'price_basic_monthly', amount: 9.99, features: ['HD voice', 'Unlimited messages'] },
  pro: { priceId: 'price_pro_monthly', amount: 19.99, features: ['Premium voice', 'Video synthesis', '4K avatar'] },
  enterprise: { priceId: 'price_enterprise_monthly', amount: 49.99, features: ['All features', 'Priority support', 'Custom integrations'] },
};

export class PaymentController {
  async createPaymentIntent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId, currency = 'usd' } = req.body;

      if (!planId || !PLANS[planId as keyof typeof PLANS]) {
        throw new ValidationError('Invalid plan ID');
      }

      const plan = PLANS[planId as keyof typeof PLANS];
      const paymentIntent = await paymentService.createPaymentIntent(plan.amount, currency);

      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentIntentId, planId } = req.body;

      if (!paymentIntentId || !planId) {
        throw new ValidationError('Payment intent ID and plan ID are required');
      }

      const paymentIntent = await paymentService.confirmPayment(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new ValidationError('Payment was not successful');
      }

      const plan = PLANS[planId as keyof typeof PLANS];

      // Create payment record
      const payment = new Payment({
        userId: req.userId,
        amount: plan.amount,
        currency: 'usd',
        status: 'completed',
        paymentMethod: 'card',
        stripePaymentId: paymentIntentId,
        description: `${planId} plan subscription`,
      });

      await payment.save();

      // Create or update subscription
      const now = new Date();
      const renewalDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      let subscription = await Subscription.findOne({ userId: req.userId });

      if (!subscription) {
        subscription = new Subscription({
          userId: req.userId,
          planId,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: renewalDate,
          nextBillingDate: renewalDate,
          autoRenew: true,
          features: plan.features,
          pricing: {
            amount: plan.amount,
            currency: 'usd',
            billingCycle: 'monthly',
          },
        });
      } else {
        subscription.planId = planId;
        subscription.status = 'active';
        subscription.currentPeriodStart = now;
        subscription.currentPeriodEnd = renewalDate;
        subscription.nextBillingDate = renewalDate;
        subscription.features = plan.features;
        subscription.pricing.amount = plan.amount;
      }

      await subscription.save();

      // Update user subscription
      const user = await User.findById(req.userId);
      if (user) {
        user.subscription = {
          plan: planId as 'free' | 'basic' | 'pro' | 'enterprise',
          status: 'active',
          startDate: now,
          endDate: renewalDate,
          features: plan.features,
          renewalDate,
        };
        await user.save();
      }

      // Send receipt email
      await emailService.sendPaymentReceiptEmail(
        user?.email || '',
        plan.amount,
        planId,
        payment._id.toString()
      );

      res.json({
        success: true,
        message: 'Payment successful',
        data: {
          payment: payment._id,
          subscription: subscription._id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const payments = await Payment.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Payment.countDocuments({ userId: req.userId });

      res.json({
        success: true,
        data: payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscription = await Subscription.findOne({ userId: req.userId });

      if (!subscription) {
        res.json({
          success: true,
          data: null,
          message: 'No active subscription',
        });
        return;
      }

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscription = await Subscription.findOne({ userId: req.userId });

      if (!subscription) {
        throw new NotFoundError('Subscription');
      }

      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      subscription.autoRenew = false;
      await subscription.save();

      // Update user
      const user = await User.findById(req.userId);
      if (user) {
        user.subscription.status = 'cancelled';
        await user.save();
      }

      res.json({
        success: true,
        message: 'Subscription cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();

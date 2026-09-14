import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  planId: string;
  status: 'active' | 'cancelled' | 'suspended' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  autoRenew: boolean;
  features: string[];
  limits: {
    monthlyMessages: number;
    voiceMinutesPerMonth: number;
    videoMinutesPerMonth: number;
    storageGB: number;
    apiCallsPerDay: number;
  };
  pricing: {
    amount: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly';
  };
  paymentMethodId?: string;
  nextBillingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    planId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'suspended', 'expired'],
      default: 'active',
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelledAt: Date,
    cancelReason: String,
    autoRenew: {
      type: Boolean,
      default: true,
    },
    features: [String],
    limits: {
      monthlyMessages: Number,
      voiceMinutesPerMonth: Number,
      videoMinutesPerMonth: Number,
      storageGB: Number,
      apiCallsPerDay: Number,
    },
    pricing: {
      amount: Number,
      currency: { type: String, default: 'USD' },
      billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
      },
    },
    paymentMethodId: String,
    nextBillingDate: Date,
  },
  { timestamps: true }
);

// Indexes
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);

export default Subscription;

import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: 'card' | 'bank_transfer' | 'paypal' | 'crypto';
  stripePaymentId?: string;
  invoiceNumber?: string;
  description: string;
  subscriptionId?: mongoose.Types.ObjectId;
  refundId?: string;
  refundReason?: string;
  refundedAmount?: number;
  refundedAt?: Date;
  metadata?: Record<string, any>;
  failureReason?: string;
  retryCount: number;
  nextRetryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank_transfer', 'paypal', 'crypto'],
      required: true,
    },
    stripePaymentId: String,
    invoiceNumber: String,
    description: String,
    subscriptionId: Schema.Types.ObjectId,
    refundId: String,
    refundReason: String,
    refundedAmount: Number,
    refundedAt: Date,
    metadata: Schema.Types.Mixed,
    failureReason: String,
    retryCount: { type: Number, default: 0 },
    nextRetryAt: Date,
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ stripePaymentId: 1 });

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;

import mongoose, { Document, Schema } from 'mongoose';
import { SubscriptionTier } from './User';

// Subscription status enum
export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending'
}

// Payment method enum
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CASH = 'cash'
}

// Subscription interface
export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  autoRenew: boolean;
  lastRenewalDate?: Date;
  nextRenewalDate?: Date;
  cancellationDate?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription schema
const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    plan: {
      type: String,
      enum: Object.values(SubscriptionTier),
      required: [true, 'Subscription plan is required']
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.PENDING
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD'
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: [true, 'Payment method is required']
    },
    paymentReference: {
      type: String
    },
    autoRenew: {
      type: Boolean,
      default: false
    },
    lastRenewalDate: {
      type: Date
    },
    nextRenewalDate: {
      type: Date
    },
    cancellationDate: {
      type: Date
    },
    cancellationReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ plan: 1 });

// Create and export the Subscription model
const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
export default Subscription; 
import mongoose, { Document, Schema } from 'mongoose';

// Transaction status enum
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

// Transaction interface
export interface ITransaction extends Document {
  minerId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  date: Date;
  mineralType: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  currency: string;
  receiptNumber: string;
  receiptImage?: string;
  status: TransactionStatus;
  location: string;
  notes?: string;
  flaggedReason?: string;
  flaggedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction schema
const transactionSchema = new Schema<ITransaction>(
  {
    minerId: {
      type: Schema.Types.ObjectId,
      ref: 'MinerProfile',
      required: [true, 'Miner ID is required']
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer ID is required']
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now
    },
    mineralType: {
      type: String,
      required: [true, 'Mineral type is required'],
      enum: ['gold', 'diamond', 'chrome', 'platinum', 'other']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['grams', 'ounces', 'kilograms', 'tons', 'carats']
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: 0
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD'
    },
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true
    },
    receiptImage: {
      type: String
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING
    },
    location: {
      type: String,
      required: [true, 'Transaction location is required']
    },
    notes: {
      type: String
    },
    flaggedReason: {
      type: String
    },
    flaggedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
transactionSchema.index({ minerId: 1, date: -1 });
transactionSchema.index({ buyerId: 1, date: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ receiptNumber: 1 }, { unique: true });

// Create and export the Transaction model
const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction; 
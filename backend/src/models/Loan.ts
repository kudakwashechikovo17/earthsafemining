import mongoose, { Document, Schema } from 'mongoose';

export enum LoanStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  PAID = 'paid',
  DEFAULTED = 'defaulted'
}

export enum LoanType {
  EQUIPMENT = 'Equipment',
  WORKING_CAPITAL = 'Working Capital',
  SITE_DEVELOPMENT = 'Site Development',
  INPUTS = 'Inputs',
  PROCESSING = 'Processing',
  OTHER = 'Other'
}

export interface ILoan extends Document {
  orgId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  amount: number;
  purpose: string;
  termMonths: number;
  collateral?: string;
  institution?: string;
  status: LoanStatus;
  interestRate?: number;
  monthlyPayment?: number;
  approvedAt?: Date;
  rejectedReason?: string;
  documents: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    purpose: {
      type: String,
      required: true,
    },
    termMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    collateral: String,
    institution: {
      type: String,
      default: 'EarthSafe Microfinance',
    },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.PENDING,
    },
    interestRate: Number,
    monthlyPayment: Number,
    approvedAt: Date,
    rejectedReason: String,
    documents: [String],
    notes: String,
  },
  {
    timestamps: true,
  }
);

loanSchema.index({ orgId: 1, status: 1 });

export const Loan = mongoose.model<ILoan>('Loan', loanSchema);
export default Loan;
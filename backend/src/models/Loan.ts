import mongoose, { Document, Schema } from 'mongoose';

// Loan status enum
export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISBURSED = 'disbursed',
  REPAYING = 'repaying',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted'
}

// Loan type enum
export enum LoanType {
  INDIVIDUAL = 'individual',
  GROUP = 'group'
}

// Loan interface
export interface ILoan extends Document {
  applicantId: mongoose.Types.ObjectId;
  applicantType: string;
  financialInstitutionId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  interestRate: number;
  term: number;
  termUnit: string;
  purpose: string;
  status: LoanStatus;
  type: LoanType;
  applicationDate: Date;
  approvalDate?: Date;
  disbursementDate?: Date;
  repaymentStartDate?: Date;
  repaymentEndDate?: Date;
  collateral?: string;
  guarantors?: mongoose.Types.ObjectId[];
  documents?: string[];
  notes?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Loan schema
const loanSchema = new Schema<ILoan>(
  {
    applicantId: {
      type: Schema.Types.ObjectId,
      refPath: 'applicantType',
      required: [true, 'Applicant ID is required']
    },
    applicantType: {
      type: String,
      required: [true, 'Applicant type is required'],
      enum: ['MinerProfile', 'Cooperative']
    },
    financialInstitutionId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Financial institution ID is required']
    },
    amount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: 0
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD'
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: 0
    },
    term: {
      type: Number,
      required: [true, 'Loan term is required'],
      min: 1
    },
    termUnit: {
      type: String,
      required: [true, 'Term unit is required'],
      enum: ['days', 'weeks', 'months', 'years']
    },
    purpose: {
      type: String,
      required: [true, 'Loan purpose is required']
    },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.PENDING
    },
    type: {
      type: String,
      enum: Object.values(LoanType),
      required: [true, 'Loan type is required']
    },
    applicationDate: {
      type: Date,
      required: [true, 'Application date is required'],
      default: Date.now
    },
    approvalDate: {
      type: Date
    },
    disbursementDate: {
      type: Date
    },
    repaymentStartDate: {
      type: Date
    },
    repaymentEndDate: {
      type: Date
    },
    collateral: {
      type: String
    },
    guarantors: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    documents: {
      type: [String]
    },
    notes: {
      type: String
    },
    rejectionReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
loanSchema.index({ applicantId: 1, status: 1 });
loanSchema.index({ financialInstitutionId: 1, status: 1 });
loanSchema.index({ applicationDate: -1 });
loanSchema.index({ status: 1 });

// Create and export the Loan model
const Loan = mongoose.model<ILoan>('Loan', loanSchema);
export default Loan; 
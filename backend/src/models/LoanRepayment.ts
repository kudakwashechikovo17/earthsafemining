import mongoose, { Document, Schema } from 'mongoose';

export interface ILoanRepayment extends Document {
    loanId: mongoose.Types.ObjectId;
    orgId: mongoose.Types.ObjectId;
    paymentDate: Date;
    amount: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
    paymentMethod: string;
    transactionRef?: string;
    status: 'pending' | 'completed' | 'failed';
    notes?: string;
    recordedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const loanRepaymentSchema = new Schema<ILoanRepayment>(
    {
        loanId: {
            type: Schema.Types.ObjectId,
            ref: 'Loan',
            required: true,
            index: true,
        },
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
            index: true,
        },
        paymentDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        principalPaid: {
            type: Number,
            required: true,
            min: 0,
        },
        interestPaid: {
            type: Number,
            required: true,
            min: 0,
        },
        remainingBalance: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        transactionRef: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'completed',
        },
        notes: String,
        recordedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

loanRepaymentSchema.index({ loanId: 1, paymentDate: -1 });

export const LoanRepayment = mongoose.model<ILoanRepayment>('LoanRepayment', loanRepaymentSchema);
export default LoanRepayment;

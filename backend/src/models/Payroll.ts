import mongoose, { Document, Schema } from 'mongoose';

export interface IPayroll extends Document {
    orgId: mongoose.Types.ObjectId;
    employeeName: string;
    employeeId?: string;
    paymentDate: Date;
    amount: number;
    currency: string;
    paymentMethod: string;
    payPeriodStart: Date;
    payPeriodEnd: Date;
    hoursWorked?: number;
    hourlyRate?: number;
    deductions?: number;
    bonuses?: number;
    netPay: number;
    receiptUrl?: string;
    transactionRef?: string;
    notes?: string;
    paidBy: mongoose.Types.ObjectId;
    status: 'pending' | 'paid' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const payrollSchema = new Schema<IPayroll>(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
            index: true,
        },
        employeeName: {
            type: String,
            required: true,
        },
        employeeId: String,
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
        currency: {
            type: String,
            default: 'USD',
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        payPeriodStart: {
            type: Date,
            required: true,
        },
        payPeriodEnd: {
            type: Date,
            required: true,
        },
        hoursWorked: {
            type: Number,
            min: 0,
        },
        hourlyRate: {
            type: Number,
            min: 0,
        },
        deductions: {
            type: Number,
            default: 0,
            min: 0,
        },
        bonuses: {
            type: Number,
            default: 0,
            min: 0,
        },
        netPay: {
            type: Number,
            required: true,
            min: 0,
        },
        receiptUrl: String,
        transactionRef: String,
        notes: String,
        paidBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'cancelled'],
            default: 'paid',
        },
    },
    {
        timestamps: true,
    }
);

payrollSchema.index({ orgId: 1, paymentDate: -1 });
payrollSchema.index({ orgId: 1, employeeName: 1 });

export const Payroll = mongoose.model<IPayroll>('Payroll', payrollSchema);
export default Payroll;

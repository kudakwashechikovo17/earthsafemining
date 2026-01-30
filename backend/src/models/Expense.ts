import mongoose, { Document, Schema } from 'mongoose';

export enum ExpenseCategory {
    FUEL = 'fuel',
    LABOR = 'labor',
    EQUIPMENT = 'equipment',
    MAINTENANCE = 'maintenance',
    CONSUMABLES = 'consumables', // e.g., chemicals, explosives
    TRANSPORT = 'transport',
    OTHER = 'other'
}

export interface IExpense extends Document {
    orgId: mongoose.Types.ObjectId;
    date: Date;
    category: ExpenseCategory;
    description: string;
    amount: number;
    currency: string; // 'USD', 'ZWG'
    supplier?: string;
    receiptId?: mongoose.Types.ObjectId;
    paymentMethod?: string; // 'cash', 'ecocash', 'bank'
    enteredBy: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        category: {
            type: String,
            enum: Object.values(ExpenseCategory),
            required: true,
        },
        description: {
            type: String,
            required: true,
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
        supplier: String,
        receiptId: {
            type: Schema.Types.ObjectId,
            ref: 'Receipt',
        },
        paymentMethod: String,
        enteredBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        notes: String,
    },
    {
        timestamps: true,
    }
);

expenseSchema.index({ orgId: 1, date: -1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
export default Expense;

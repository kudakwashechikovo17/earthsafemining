import mongoose, { Document, Schema } from 'mongoose';

export enum SaleSource {
    FIDELITY = 'fidelity', // Verified via API or direct official receipt
    PRIVATE = 'private',
    OTHER = 'other'
}

export enum SaleStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    RECONCILED = 'reconciled', // Matched with production records
    FLAGGED = 'flagged'
}

export interface ISalesTransaction extends Document {
    orgId: mongoose.Types.ObjectId;
    date: Date;
    source: SaleSource;
    referenceId: string; // Receipt number or API transaction ID
    mineralType: string; // 'gold'
    grams: number;
    pricePerGram?: number;
    totalValue: number;
    currency: string;
    buyerName: string; // 'Fidelity Printers', etc.
    receiptUrl?: string;
    status: SaleStatus;
    reconciledWithShiftId?: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const salesTransactionSchema = new Schema<ISalesTransaction>(
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
        source: {
            type: String,
            enum: Object.values(SaleSource),
            required: true,
            default: SaleSource.FIDELITY,
        },
        referenceId: {
            type: String,
            required: true,
            trim: true,
        },
        mineralType: {
            type: String,
            default: 'gold',
        },
        grams: {
            type: Number,
            required: true,
            min: 0,
        },
        pricePerGram: Number,
        totalValue: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: 'USD',
        },
        buyerName: {
            type: String,
            default: 'Fidelity Printers & Refiners',
        },
        receiptUrl: String,
        status: {
            type: String,
            enum: Object.values(SaleStatus),
            default: SaleStatus.PENDING,
        },
        reconciledWithShiftId: {
            type: Schema.Types.ObjectId,
            ref: 'Shift',
        },
        notes: String,
    },
    {
        timestamps: true,
    }
);

salesTransactionSchema.index({ orgId: 1, date: -1 });
salesTransactionSchema.index({ referenceId: 1 }, { unique: true });

export const SalesTransaction = mongoose.model<ISalesTransaction>('SalesTransaction', salesTransactionSchema);
export default SalesTransaction;

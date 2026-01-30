import mongoose, { Document, Schema } from 'mongoose';

export interface IReceipt extends Document {
    orgId: mongoose.Types.ObjectId;
    date: Date;
    fileUrl: string;
    vendor?: string;
    total?: number;
    currency?: string;
    extractedText?: string;
    confidenceScore?: number; // OCR confidence
    status: 'pending' | 'processed' | 'failed';
    uploadedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const receiptSchema = new Schema<IReceipt>(
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
        fileUrl: {
            type: String,
            required: true,
        },
        vendor: String,
        total: Number,
        currency: String,
        extractedText: String,
        confidenceScore: Number,
        status: {
            type: String,
            enum: ['pending', 'processed', 'failed'],
            default: 'pending',
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

receiptSchema.index({ orgId: 1, date: -1 });

export const Receipt = mongoose.model<IReceipt>('Receipt', receiptSchema);
export default Receipt;

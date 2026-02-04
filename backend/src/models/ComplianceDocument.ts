import mongoose, { Document, Schema } from 'mongoose';

export interface IComplianceDocument extends Document {
    orgId: mongoose.Types.ObjectId;
    type: string;
    number: string;
    issuedDate: Date;
    expiryDate: Date;
    status: 'active' | 'expiring' | 'expired';
    issuer: string;
    fileUrl?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const complianceDocumentSchema = new Schema<IComplianceDocument>(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                'Mining License',
                'Prospecting License',
                'Environmental Impact Assessment Certificate',
                'Health and Safety Certification',
                'Local Permit',
            ],
        },
        number: {
            type: String,
            required: true,
        },
        issuedDate: {
            type: Date,
            required: true,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'expiring', 'expired'],
            default: 'active',
        },
        issuer: {
            type: String,
            required: true,
        },
        fileUrl: {
            type: String,
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
complianceDocumentSchema.index({ orgId: 1, type: 1 });

export const ComplianceDocument = mongoose.model<IComplianceDocument>(
    'ComplianceDocument',
    complianceDocumentSchema
);

export default ComplianceDocument;

import mongoose, { Document, Schema } from 'mongoose';

export interface IScoreFactor {
    name: string; // e.g. "Revenue Consistency"
    score: number; // 0-100
    weight: number; // e.g. 0.3 for 30%
    impact: string; // "Positive" or "Negative"
    explanation: string;
}

export interface ICreditScore extends Document {
    orgId: mongoose.Types.ObjectId;
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D';
    factors: IScoreFactor[];
    calculatedAt: Date;
    modelVersion: string;
    createdAt: Date;
    updatedAt: Date;
}

const creditScoreSchema = new Schema<ICreditScore>(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        grade: {
            type: String,
            enum: ['A', 'B', 'C', 'D'],
            required: true,
        },
        factors: [
            {
                name: String,
                score: Number,
                weight: Number,
                impact: String,
                explanation: String,
            },
        ],
        calculatedAt: {
            type: Date,
            default: Date.now,
        },
        modelVersion: {
            type: String,
            default: 'v1.0',
        },
    },
    {
        timestamps: true,
    }
);

creditScoreSchema.index({ orgId: 1, calculatedAt: -1 });

export const CreditScore = mongoose.model<ICreditScore>('CreditScore', creditScoreSchema);
export default CreditScore;

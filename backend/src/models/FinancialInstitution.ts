import mongoose, { Document, Schema } from 'mongoose';

export interface IFinancialInstitution extends Document {
    name: string;
    logoUrl?: string;
    description: string;
    minCreditScore: number;
    maxLoanAmount: number;
    interestRateRange: string; // e.g. "5% - 12%"
    supportedLoanTypes: string[]; // ["Equipment", "Working Capital"]
    requirements: string[]; // ["ID", "Production History > 3mo"]
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const financialInstitutionSchema = new Schema<IFinancialInstitution>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        logoUrl: String,
        description: {
            type: String,
            required: true,
        },
        minCreditScore: {
            type: Number,
            default: 0,
        },
        maxLoanAmount: {
            type: Number,
            required: true,
        },
        interestRateRange: {
            type: String,
            required: true,
        },
        supportedLoanTypes: [String],
        requirements: [String],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export const FinancialInstitution = mongoose.model<IFinancialInstitution>('FinancialInstitution', financialInstitutionSchema);
export default FinancialInstitution;

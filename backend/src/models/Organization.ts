import mongoose, { Document, Schema } from 'mongoose';

// Organization Interface
export interface IOrganization extends Document {
    name: string;
    type: string; // 'mine', 'cooperative', 'buyer', 'partner'
    country: string;
    commodity: string[]; // ['gold', 'chrome', etc]
    location: {
        address?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        }
    };
    contactEmail?: string;
    contactPhone?: string;
    miningLicenseNumber?: string;
    status: 'active' | 'suspended' | 'pending';
    createdAt: Date;
    updatedAt: Date;
}

// Organization Schema
const organizationSchema = new Schema<IOrganization>(
    {
        name: {
            type: String,
            required: [true, 'Organization name is required'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['mine', 'cooperative', 'buyer', 'partner'],
            default: 'mine',
            required: true,
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            default: 'Zimbabwe',
        },
        commodity: {
            type: [String],
            default: ['gold'],
        },
        location: {
            address: String,
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },
        contactEmail: String,
        contactPhone: String,
        miningLicenseNumber: String,
        status: {
            type: String,
            enum: ['active', 'suspended', 'pending'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
organizationSchema.index({ name: 1 });
organizationSchema.index({ 'location.coordinates': '2dsphere' });

export const Organization = mongoose.model<IOrganization>('Organization', organizationSchema);
export default Organization;

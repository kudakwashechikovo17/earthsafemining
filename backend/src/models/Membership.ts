import mongoose, { Document, Schema } from 'mongoose';

// Roles within an Organization
export enum OrgRole {
    OWNER = 'owner',              // Full access to everything
    ADMIN = 'admin',              // Can manage members, settings
    MINER = 'miner',              // Can log shifts, expenses
    VIEWER = 'viewer',            // Read-only (e.g., lenders)
    SUPERVISOR = 'supervisor',    // Can approve shifts
}

// Membership Interface
export interface IMembership extends Document {
    userId: mongoose.Types.ObjectId;
    orgId: mongoose.Types.ObjectId;
    role: OrgRole;
    permissions?: string[]; // Custom granular permissions if needed
    status: 'active' | 'invited' | 'disabled';
    createdAt: Date;
    updatedAt: Date;
}

// Membership Schema
const membershipSchema = new Schema<IMembership>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
        role: {
            type: String,
            enum: Object.values(OrgRole),
            required: true,
            default: OrgRole.MINER,
        },
        permissions: [String],
        status: {
            type: String,
            enum: ['active', 'invited', 'disabled'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
// Ensure a user is only a member of an org once
membershipSchema.index({ userId: 1, orgId: 1 }, { unique: true });
membershipSchema.index({ userId: 1 });
membershipSchema.index({ orgId: 1 });

export const Membership = mongoose.model<IMembership>('Membership', membershipSchema);
export default Membership;

import mongoose, { Document, Schema } from 'mongoose';

export interface IEquipment extends Document {
    orgId: mongoose.Types.ObjectId;
    name: string;
    type: 'heavy_machinery' | 'tools' | 'vehicles' | 'processing_equipment';
    serialNumber?: string;
    purchaseDate: Date;
    purchasePrice: number;
    currentValue: number;
    status: 'operational' | 'maintenance' | 'broken' | 'retired';
    maintenanceSchedule?: string;
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const equipmentSchema = new Schema<IEquipment>(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['heavy_machinery', 'tools', 'vehicles', 'processing_equipment'],
            required: true,
        },
        serialNumber: {
            type: String,
        },
        purchaseDate: {
            type: Date,
            required: true,
        },
        purchasePrice: {
            type: Number,
            required: true,
        },
        currentValue: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['operational', 'maintenance', 'broken', 'retired'],
            default: 'operational',
        },
        maintenanceSchedule: {
            type: String,
        },
        lastMaintenanceDate: {
            type: Date,
        },
        nextMaintenanceDate: {
            type: Date,
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
equipmentSchema.index({ orgId: 1, status: 1 });
equipmentSchema.index({ orgId: 1, type: 1 });

export const Equipment = mongoose.model<IEquipment>('Equipment', equipmentSchema);
export default Equipment;

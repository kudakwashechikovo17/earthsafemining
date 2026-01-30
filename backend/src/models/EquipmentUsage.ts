import mongoose, { Document, Schema } from 'mongoose';

export interface IEquipmentUsage extends Document {
    shiftId: mongoose.Types.ObjectId;
    orgId: mongoose.Types.ObjectId;
    equipmentId?: mongoose.Types.ObjectId; // Ref to asset table (future)
    equipmentName: string; // Fallback text
    hoursStart?: number;
    hoursEnd?: number;
    hoursUsed: number;
    fuelConsumedLiters?: number;
    operatorName?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const equipmentUsageSchema = new Schema<IEquipmentUsage>(
    {
        shiftId: {
            type: Schema.Types.ObjectId,
            ref: 'Shift',
            required: true,
        },
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
        equipmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Equipment', // Future model
        },
        equipmentName: {
            type: String,
            required: true,
        },
        hoursStart: Number,
        hoursEnd: Number,
        hoursUsed: {
            type: Number,
            required: true,
            min: 0,
        },
        fuelConsumedLiters: Number,
        operatorName: String,
        notes: String,
    },
    {
        timestamps: true,
    }
);

equipmentUsageSchema.index({ shiftId: 1 });
equipmentUsageSchema.index({ orgId: 1 });

export const EquipmentUsage = mongoose.model<IEquipmentUsage>('EquipmentUsage', equipmentUsageSchema);
export default EquipmentUsage;

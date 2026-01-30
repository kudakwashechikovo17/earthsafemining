import mongoose, { Document, Schema } from 'mongoose';

export enum ShiftType {
    DAY = 'day',
    NIGHT = 'night',
    OTHER = 'other',
}

export enum ShiftStatus {
    OPEN = 'open',
    SUBMITTED = 'submitted',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface IShift extends Document {
    orgId: mongoose.Types.ObjectId;
    date: Date;
    type: ShiftType;
    supervisorId: mongoose.Types.ObjectId;
    createdById: mongoose.Types.ObjectId;
    status: ShiftStatus;
    notes?: string;
    weatherCondition?: string;
    startTime?: Date;
    endTime?: Date;
    approvedBy?: mongoose.Types.ObjectId;
    approvalDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const shiftSchema = new Schema<IShift>(
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
        type: {
            type: String,
            enum: Object.values(ShiftType),
            required: true,
            default: ShiftType.DAY,
        },
        supervisorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        createdById: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(ShiftStatus),
            default: ShiftStatus.OPEN,
        },
        notes: String,
        weatherCondition: String,
        startTime: Date,
        endTime: Date,
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        approvalDate: Date,
    },
    {
        timestamps: true,
    }
);

shiftSchema.index({ orgId: 1, date: -1 });
shiftSchema.index({ supervisorId: 1 });

export const Shift = mongoose.model<IShift>('Shift', shiftSchema);
export default Shift;

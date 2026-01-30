import mongoose, { Document, Schema } from 'mongoose';

export interface ITimesheet extends Document {
    shiftId: mongoose.Types.ObjectId;
    orgId: mongoose.Types.ObjectId;
    workerName: string; // Can be a string if workers aren't full system users yet
    workerId?: mongoose.Types.ObjectId; // Optional link if they become users
    role: string; // 'driller', 'hauler', 'helper'
    hoursWorked: number;
    ratePerShift?: number;
    totalPay?: number; // Calculated field
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const timesheetSchema = new Schema<ITimesheet>(
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
        workerName: {
            type: String,
            required: true,
        },
        workerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        role: {
            type: String,
            required: true,
        },
        hoursWorked: {
            type: Number,
            required: true,
            min: 0,
            max: 24,
        },
        ratePerShift: Number,
        totalPay: Number,
        notes: String,
    },
    {
        timestamps: true,
    }
);

timesheetSchema.index({ shiftId: 1 });
timesheetSchema.index({ orgId: 1 });

export const Timesheet = mongoose.model<ITimesheet>('Timesheet', timesheetSchema);
export default Timesheet;

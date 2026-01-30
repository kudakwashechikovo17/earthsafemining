import mongoose, { Document, Schema } from 'mongoose';

export enum MaterialType {
    ORE = 'ore',
    WASTE = 'waste',
    TAILINGS = 'tailings',
    CONCENTRATE = 'concentrate',
    WATER = 'water'
}

export interface IMaterialMovement extends Document {
    shiftId: mongoose.Types.ObjectId;
    orgId: mongoose.Types.ObjectId;
    type: MaterialType;
    quantity: number;
    unit: string; // 'tons', 'kg', 'buckets'
    source: string; // 'Pit A', 'Stockpile 1'
    destination: string; // 'Crusher', 'Waste Dump'
    gradeEstimate?: number; // g/t
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const materialMovementSchema = new Schema<IMaterialMovement>(
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
        type: {
            type: String,
            enum: Object.values(MaterialType),
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        unit: {
            type: String,
            required: true,
            default: 'tons',
        },
        source: {
            type: String,
            required: true,
        },
        destination: {
            type: String,
            required: true,
        },
        gradeEstimate: Number,
        notes: String,
    },
    {
        timestamps: true,
    }
);

materialMovementSchema.index({ shiftId: 1 });

export const MaterialMovement = mongoose.model<IMaterialMovement>('MaterialMovement', materialMovementSchema);
export default MaterialMovement;

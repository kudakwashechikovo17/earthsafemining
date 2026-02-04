import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
    orgId: mongoose.Types.ObjectId;
    itemType: 'gold' | 'ore' | 'equipment' | 'consumable';
    name: string;
    quantity: number;
    unit: string; // 'kg', 'grams', 'tons', 'pieces'
    valuePerUnit?: number;
    totalValue?: number;
    location?: string;
    lastUpdated: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
            index: true,
        },
        itemType: {
            type: String,
            enum: ['gold', 'ore', 'equipment', 'consumable'],
            required: true,
        },
        name: {
            type: String,
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
        },
        valuePerUnit: {
            type: Number,
            min: 0,
        },
        totalValue: {
            type: Number,
            min: 0,
        },
        location: String,
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
        notes: String,
    },
    {
        timestamps: true,
    }
);

inventorySchema.index({ orgId: 1, itemType: 1 });

export const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);
export default Inventory;

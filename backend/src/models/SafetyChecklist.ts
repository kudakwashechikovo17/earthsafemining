import mongoose, { Document, Schema } from 'mongoose';

export interface IChecklistItem {
    id: string;
    label: string;
    checked: boolean;
    notes?: string;
}

export interface ISafetyChecklist extends Document {
    orgId: mongoose.Types.ObjectId;
    inspectorId: mongoose.Types.ObjectId;
    date: Date;
    items: IChecklistItem[];
    status: 'submitted' | 'verified' | 'flagged';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const checklistItemSchema = new Schema({
    id: String,
    label: String,
    checked: Boolean,
    notes: String
}, { _id: false });

const safetyChecklistSchema = new Schema<ISafetyChecklist>(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
        inspectorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        items: [checklistItemSchema],
        status: {
            type: String,
            enum: ['submitted', 'verified', 'flagged'],
            default: 'submitted',
        },
        notes: String,
    },
    {
        timestamps: true,
    }
);

safetyChecklistSchema.index({ orgId: 1, date: -1 });

export const SafetyChecklist = mongoose.model<ISafetyChecklist>('SafetyChecklist', safetyChecklistSchema);
export default SafetyChecklist;

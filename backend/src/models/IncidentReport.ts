import mongoose, { Document, Schema } from 'mongoose';

export enum IncidentType {
    ACCIDENT = 'accident',
    INJURY = 'injury',
    NEAR_MISS = 'near_miss',
    HAZARD = 'hazard',
    EQUIPMENT_FAILURE = 'equipment_failure'
}

export enum IncidentSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum IncidentStatus {
    OPEN = 'open',
    INVESTIGATING = 'investigating',
    RESOLVED = 'resolved',
    CLOSED = 'closed'
}

export interface IIncidentReport extends Document {
    orgId: mongoose.Types.ObjectId;
    reporterId: mongoose.Types.ObjectId;
    date: Date;
    type: IncidentType;
    severity: IncidentSeverity;
    description: string;
    location: string;
    photos?: string[];
    status: IncidentStatus;
    resolutionNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const incidentReportSchema = new Schema<IIncidentReport>(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
        reporterId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        type: {
            type: String,
            enum: Object.values(IncidentType),
            required: true,
        },
        severity: {
            type: String,
            enum: Object.values(IncidentSeverity),
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        photos: [String],
        status: {
            type: String,
            enum: Object.values(IncidentStatus),
            default: IncidentStatus.OPEN,
        },
        resolutionNotes: String,
    },
    {
        timestamps: true,
    }
);

incidentReportSchema.index({ orgId: 1, date: -1 });
incidentReportSchema.index({ status: 1 });

export const IncidentReport = mongoose.model<IIncidentReport>('IncidentReport', incidentReportSchema);
export default IncidentReport;

import mongoose, { Document, Schema } from 'mongoose';

// Compliance status enum
export enum ComplianceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// Compliance type enum
export enum ComplianceType {
  MINING_PERMIT = 'mining_permit',
  ENVIRONMENTAL_PERMIT = 'environmental_permit',
  TAX_CLEARANCE = 'tax_clearance',
  BUSINESS_REGISTRATION = 'business_registration',
  SAFETY_CERTIFICATION = 'safety_certification',
  OTHER = 'other'
}

// Compliance interface
export interface ICompliance extends Document {
  entityId: mongoose.Types.ObjectId;
  entityType: string;
  type: ComplianceType;
  documentNumber: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  status: ComplianceStatus;
  documentUrl?: string;
  notes?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verificationDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Compliance schema
const complianceSchema = new Schema<ICompliance>(
  {
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: 'entityType',
      required: [true, 'Entity ID is required']
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      enum: ['MinerProfile', 'Cooperative']
    },
    type: {
      type: String,
      enum: Object.values(ComplianceType),
      required: [true, 'Compliance type is required']
    },
    documentNumber: {
      type: String,
      required: [true, 'Document number is required'],
      trim: true
    },
    issuedBy: {
      type: String,
      required: [true, 'Issuing authority is required'],
      trim: true
    },
    issuedDate: {
      type: Date,
      required: [true, 'Issue date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    status: {
      type: String,
      enum: Object.values(ComplianceStatus),
      default: ComplianceStatus.PENDING
    },
    documentUrl: {
      type: String
    },
    notes: {
      type: String
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationDate: {
      type: Date
    },
    rejectionReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
complianceSchema.index({ entityId: 1, type: 1 });
complianceSchema.index({ status: 1 });
complianceSchema.index({ expiryDate: 1 });
complianceSchema.index({ type: 1, issuedBy: 1 });

// Create and export the Compliance model
const Compliance = mongoose.model<ICompliance>('Compliance', complianceSchema);
export default Compliance; 
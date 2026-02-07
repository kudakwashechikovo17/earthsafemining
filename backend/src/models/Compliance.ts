import mongoose, { Document, Schema } from 'mongoose';

// Compliance status enum
export enum ComplianceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  MISSING = 'missing'
}

// Compliance type enum
export enum ComplianceType {
  MINING_LICENSE = 'mining_license',
  ENVIRONMENTAL_PERMIT = 'environmental_permit',
  EMA_CERTIFICATE = 'ema_certificate',
  TAX_CLEARANCE = 'tax_clearance',
  SITE_PLAN = 'site_plan',
  SAFETY_POLICY = 'safety_policy',
  OTHER = 'other',
  // Frontend Compatibility
  MINING_LICENSE_TITLE = 'Mining License',
  PROSPECTING_LICENSE = 'Prospecting License',
  ENVIRONMENTAL_IMPACT_ASSESSMENT = 'Environmental Impact Assessment Certificate',
  HEALTH_SAFETY = 'Health and Safety Certification',
  LOCAL_PERMIT = 'Local Permit'
}

// Compliance interface
export interface ICompliance extends Document {
  orgId: mongoose.Types.ObjectId;
  type: ComplianceType;
  title: string;
  documentNumber?: string;
  issuedBy?: string;
  issuedDate?: Date;
  expiryDate?: Date;
  status: ComplianceStatus;
  fileUrl?: string; // S3 or local path
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
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ComplianceType),
      required: true,
    },
    title: {
      type: String,
      required: true, // e.g., "2024 Mining License"
    },
    documentNumber: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: Object.values(ComplianceStatus),
      default: ComplianceStatus.PENDING,
    },
    fileUrl: String,
    notes: String,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationDate: Date,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

complianceSchema.index({ orgId: 1, type: 1 });
complianceSchema.index({ expiryDate: 1 });

export const Compliance = mongoose.model<ICompliance>('Compliance', complianceSchema);
export default Compliance;

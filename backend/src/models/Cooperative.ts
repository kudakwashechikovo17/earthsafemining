import mongoose, { Document, Schema } from 'mongoose';

// Cooperative interface
export interface ICooperative extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  registrationNumber: string;
  registrationDate: Date;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  contactPerson: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  memberCount: number;
  operatingRegions: string[];
  mineralTypes: string[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
  };
  documents?: string[];
  verified: boolean;
  verificationDate?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Cooperative schema
const cooperativeSchema = new Schema<ICooperative>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    name: {
      type: String,
      required: [true, 'Cooperative name is required'],
      trim: true
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true
    },
    registrationDate: {
      type: Date,
      required: [true, 'Registration date is required']
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required']
      },
      city: {
        type: String,
        required: [true, 'City is required']
      },
      province: {
        type: String,
        required: [true, 'Province is required']
      },
      postalCode: {
        type: String
      }
    },
    contactPerson: {
      name: {
        type: String,
        required: [true, 'Contact person name is required']
      },
      position: {
        type: String,
        required: [true, 'Contact person position is required']
      },
      phone: {
        type: String,
        required: [true, 'Contact person phone is required']
      },
      email: {
        type: String,
        required: [true, 'Contact person email is required'],
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
      }
    },
    memberCount: {
      type: Number,
      required: [true, 'Member count is required'],
      min: 0
    },
    operatingRegions: {
      type: [String],
      required: [true, 'Operating regions are required']
    },
    mineralTypes: {
      type: [String],
      required: [true, 'Mineral types are required'],
      enum: ['gold', 'diamond', 'chrome', 'platinum', 'other']
    },
    bankDetails: {
      bankName: {
        type: String
      },
      accountNumber: {
        type: String
      },
      branchCode: {
        type: String
      }
    },
    documents: {
      type: [String]
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationDate: {
      type: Date
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
cooperativeSchema.index({ name: 1 });
cooperativeSchema.index({ registrationNumber: 1 }, { unique: true });
cooperativeSchema.index({ 'address.province': 1 });
cooperativeSchema.index({ mineralTypes: 1 });

// Create and export the Cooperative model
const Cooperative = mongoose.model<ICooperative>('Cooperative', cooperativeSchema);
export default Cooperative; 
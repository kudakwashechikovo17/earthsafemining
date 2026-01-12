import mongoose, { Document, Schema } from 'mongoose';

// Miner profile interface
export interface IMinerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  nationalId: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  miningLocation: {
    name: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    province: string;
    district: string;
  };
  permitNumber?: string;
  permitExpiryDate?: Date;
  taxNumber?: string;
  creditScore: number;
  miningType: string[];
  yearsOfExperience: number;
  employeeCount: number;
  cooperativeId?: mongoose.Types.ObjectId;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Miner profile schema
const minerProfileSchema = new Schema<IMinerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    nationalId: {
      type: String,
      required: [true, 'National ID is required'],
      unique: true,
      trim: true
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
    miningLocation: {
      name: {
        type: String,
        required: [true, 'Mining location name is required']
      },
      coordinates: {
        latitude: {
          type: Number
        },
        longitude: {
          type: Number
        }
      },
      province: {
        type: String,
        required: [true, 'Province is required']
      },
      district: {
        type: String,
        required: [true, 'District is required']
      }
    },
    permitNumber: {
      type: String
    },
    permitExpiryDate: {
      type: Date
    },
    taxNumber: {
      type: String
    },
    creditScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000
    },
    miningType: {
      type: [String],
      required: [true, 'Mining type is required'],
      enum: ['gold', 'diamond', 'chrome', 'platinum', 'other']
    },
    yearsOfExperience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: 0
    },
    employeeCount: {
      type: Number,
      required: [true, 'Employee count is required'],
      min: 0
    },
    cooperativeId: {
      type: Schema.Types.ObjectId,
      ref: 'Cooperative'
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
    }
  },
  {
    timestamps: true
  }
);

// Create and export the MinerProfile model
const MinerProfile = mongoose.model<IMinerProfile>('MinerProfile', minerProfileSchema);
export default MinerProfile; 
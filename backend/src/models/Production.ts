import mongoose, { Document, Schema } from 'mongoose';

// Production interface
export interface IProduction extends Document {
  minerId: mongoose.Types.ObjectId;
  date: Date;
  mineralType: string;
  quantity: number;
  unit: string;
  location: {
    name: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  purity?: number;
  notes?: string;
  images?: string[];
  verified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verificationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Production schema
const productionSchema = new Schema<IProduction>(
  {
    minerId: {
      type: Schema.Types.ObjectId,
      ref: 'MinerProfile',
      required: [true, 'Miner ID is required']
    },
    date: {
      type: Date,
      required: [true, 'Production date is required'],
      default: Date.now
    },
    mineralType: {
      type: String,
      required: [true, 'Mineral type is required'],
      enum: ['gold', 'diamond', 'chrome', 'platinum', 'other']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['grams', 'ounces', 'kilograms', 'tons', 'carats']
    },
    location: {
      name: {
        type: String,
        required: [true, 'Location name is required']
      },
      coordinates: {
        latitude: {
          type: Number
        },
        longitude: {
          type: Number
        }
      }
    },
    purity: {
      type: Number,
      min: 0,
      max: 100
    },
    notes: {
      type: String
    },
    images: {
      type: [String]
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
productionSchema.index({ minerId: 1, date: -1 });
productionSchema.index({ mineralType: 1 });
productionSchema.index({ 'location.name': 1 });

// Create and export the Production model
const Production = mongoose.model<IProduction>('Production', productionSchema);
export default Production; 
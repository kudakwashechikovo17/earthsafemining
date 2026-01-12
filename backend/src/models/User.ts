import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Define user roles
export enum UserRole {
  MINER = 'miner',
  BUYER = 'buyer',
  COOPERATIVE = 'cooperative',
  GOVERNMENT = 'government',
  FINANCIAL_INSTITUTION = 'financial_institution',
  ADMIN = 'admin'
}

// Define subscription tiers
export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  PREMIUM = 'premium'
}

// User interface
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry?: Date;
  miningLicenseNumber?: string;
  phone: string;
  isActive: boolean;
  refreshToken?: string;
  location?: {
    coordinates: [number, number];
    address: string;
  };
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

// User schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    subscriptionTier: {
      type: String,
      default: SubscriptionTier.FREE,
    },
    subscriptionExpiry: {
      type: Date,
    },
    miningLicenseNumber: {
      type: String,
      sparse: true,
    },
    phone: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
    },
    location: {
      coordinates: {
        type: [Number],
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate auth token
userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    { id: this._id, role: this.role },
    (process.env.JWT_SECRET as string) || 'default_access_secret',
    { expiresIn: (process.env.JWT_EXPIRES_IN as string) || '15m' } as any
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    { id: this._id },
    (process.env.JWT_REFRESH_SECRET as string) || 'default_refresh_secret',
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as string) || '7d' } as any
  );
};

// Create and export the User model
export const User = mongoose.model<IUser>('User', userSchema); 
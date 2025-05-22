import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  email: string;
  password: string;
  isVerified: boolean;
  bankDetails?: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
    recipientCode: string;
    bankName: string;
  };
  linkedWallets: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    bankDetails: {
      accountNumber: String,
      bankCode: String,
      accountName: String,
      recipientCode: String,
      bankName: String,
    },
    linkedWallets: [{
      type: String,
      required: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
UserProfileSchema.index({ email: 1 });
UserProfileSchema.index({ linkedWallets: 1 });
UserProfileSchema.index({ createdAt: 1 });

export const UserProfile = mongoose.models.UserProfile || 
  mongoose.model<IUserProfile>('UserProfile', UserProfileSchema); 
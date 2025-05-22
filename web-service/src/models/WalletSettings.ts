import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletSettings extends Document {
  walletAddress: string;
  swapSlippage: number;
  bridgeAddresses: {
    [chain: string]: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WalletSettingsSchema = new Schema<IWalletSettings>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    swapSlippage: {
      type: Number,
      required: true,
      default: 1, // 1% default slippage
    },
    bridgeAddresses: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
WalletSettingsSchema.index({ createdAt: 1 });

export const WalletSettings = mongoose.models.WalletSettings || 
  mongoose.model<IWalletSettings>('WalletSettings', WalletSettingsSchema); 
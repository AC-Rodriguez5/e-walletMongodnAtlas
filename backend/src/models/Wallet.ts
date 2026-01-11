import mongoose from 'mongoose';

interface IWallet {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new mongoose.Schema<IWallet>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);

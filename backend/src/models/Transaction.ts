import mongoose from 'mongoose';

interface ITransaction {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'send';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  recipientEmail?: string;
  senderEmail?: string;
  fromCard?: mongoose.Types.ObjectId;
  toCard?: mongoose.Types.ObjectId;
  recipientType?: string;
  recipient?: string;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['deposit', 'withdrawal', 'transfer', 'payment', 'send'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    description: {
      type: String,
      default: '',
    },
    recipientEmail: {
      type: String,
      default: '',
    },
    senderEmail: {
      type: String,
      default: '',
    },
    fromCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
    },
    toCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
    },
    recipientType: {
      type: String,
      default: '',
    },
    recipient: {
      type: String,
      default: '',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

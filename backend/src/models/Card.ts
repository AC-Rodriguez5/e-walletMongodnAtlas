import mongoose from 'mongoose';

interface ICard {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  cardNumber: string; // Encrypted
  cardHolder: string;
  expiryDate: string;
  cvv: string; // Encrypted
  cardType: string;
  balance: number;
  isDefault: boolean;
  isActive: boolean;
  bank: string;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new mongoose.Schema<ICard>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardNumber: {
      type: String,
      required: true,
    },
    cardHolder: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: String,
      required: true,
    },
    cvv: {
      type: String,
      required: true,
    },
    cardType: {
      type: String,
      default: 'debit',
    },
    balance: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bank: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Card = mongoose.model<ICard>('Card', cardSchema);

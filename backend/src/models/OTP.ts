import mongoose from 'mongoose';

interface IOTP {
  _id?: string;
  userId: string;
  code: string;
  email: string;
  expiresAt: Date;
  isUsed: boolean;
  purpose: 'signup' | 'login' | 'password-reset';
  createdAt: Date;
}

const otpSchema = new mongoose.Schema<IOTP>(
  {
    userId: {
      type: String,
      default: '',
    },
    code: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete after expiry
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    purpose: {
      type: String,
      enum: ['signup', 'login', 'password-reset'],
      required: true,
    },
  },
  { timestamps: true }
);

export const OTP = mongoose.model<IOTP>('OTP', otpSchema);

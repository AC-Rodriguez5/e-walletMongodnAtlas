import mongoose from 'mongoose';

interface ITrustedDevice {
  deviceId: string;
  createdAt: Date;
  expiresAt: Date;
}

interface IUser {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  accountStatus: 'active' | 'inactive' | 'suspended';
  twoFactorEnabled: boolean;
  twoFactorMethod: 'email' | 'sms';
  trustedDevices?: ITrustedDevice[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    twoFactorEnabled: {
      type: Boolean,
      default: true,
    },
    twoFactorMethod: {
      type: String,
      enum: ['email', 'sms'],
      default: 'email',
    },
    trustedDevices: {
      type: [
        {
          deviceId: { type: String, required: true },
          createdAt: { type: Date, required: true },
          expiresAt: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);

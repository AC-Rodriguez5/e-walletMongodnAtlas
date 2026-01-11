import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { OTP } from '../models/OTP.js';
import { Wallet } from '../models/Wallet.js';
import { hashPassword, comparePassword, generateToken } from '../services/authService.js';
import { generatePreAuthToken } from '../services/authService.js';
import { generateOTPCode, sendOTPEmail } from '../services/emailService.js';

/**
 * Sign Up - Create new user account and send OTP
 */
export async function signup(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate OTP
    const otpCode = generateOTPCode();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await OTP.create({
      code: otpCode,
      email: email.toLowerCase(),
      expiresAt: otpExpiresAt,
      purpose: 'signup',
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otpCode, 'signup');

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    // Store user data temporarily (user not yet verified)
    // In production, you might want to store this in a temporary collection
    res.status(200).json({
      message: 'OTP sent to your email',
      email: email.toLowerCase(),
      requiresVerification: true,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Verify OTP for signup
 */
export async function verifySignupOTP(req: Request, res: Response) {
  try {
    const { email, code, firstName, lastName, password } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      code,
      purpose: 'signup',
      isUsed: false,
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // Check if OTP expired
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Create user account
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      twoFactorEnabled: true,
      twoFactorMethod: 'email',
    });

    // Create wallet for user
    await Wallet.create({
      userId: newUser._id,
      balance: 0,
      currency: 'USD',
    });

    // Generate token
    const token = generateToken(newUser._id.toString(), newUser.email);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (error) {
    console.error('Verify signup OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Login - Send OTP for verification
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password, deviceId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // If 2FA is enabled, check for trusted device before generating OTP
    if (user.twoFactorEnabled && deviceId && Array.isArray(user.trustedDevices)) {
      const now = new Date();
      const matched = user.trustedDevices.find(d => d.deviceId === deviceId && d.expiresAt > now);
      if (matched) {
        const token = generateToken(user._id.toString(), user.email);
        return res.status(200).json({
          message: 'Login successful (trusted device)',
          token,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        });
      }
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate OTP
      const otpCode = generateOTPCode();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Save OTP to database
      await OTP.create({
        userId: user._id,
        code: otpCode,
        email: user.email,
        expiresAt: otpExpiresAt,
        purpose: 'login',
      });

      // Send OTP via email
      const emailSent = await sendOTPEmail(user.email, otpCode, 'login');

      if (!emailSent) {
        return res.status(500).json({ message: 'Failed to send OTP email' });
      }

      // Generate a short-lived pre-auth token to help the frontend maintain
      // session state during OTP verification without granting full API access.
      const preAuthToken = generatePreAuthToken(user._id.toString(), user.email);

      return res.status(200).json({
        message: 'OTP sent to your email',
        email: user.email,
        requiresOTP: true,
        userId: user._id,
        preAuthToken,
      });
    }

    // If 2FA is disabled, generate token directly
    const token = generateToken(user._id.toString(), user.email);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Verify OTP for login
 */
export async function verifyLoginOTP(req: Request, res: Response) {
  try {
    const { email, code, deviceId, rememberDevice } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      code,
      purpose: 'login',
      isUsed: false,
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // Check if OTP expired
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Find user
    const user = await User.findById(otpRecord.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // If user requested to remember this device, register it
    if (rememberDevice && deviceId) {
      try {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        user.trustedDevices = user.trustedDevices || [];
        // Avoid duplicates
        const exists = user.trustedDevices.some(d => d.deviceId === deviceId);
        if (!exists) {
          user.trustedDevices.push({ deviceId, createdAt: new Date(), expiresAt });
          await user.save();
        }
      } catch (e) {
        console.error('Failed to register trusted device:', e);
      }
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Verify login OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Get user profile
 */
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        twoFactorEnabled: user.twoFactorEnabled,
        twoFactorMethod: user.twoFactorMethod,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { firstName, lastName, phoneNumber, twoFactorEnabled, twoFactorMethod } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phoneNumber && { phoneNumber }),
        ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
        ...(twoFactorMethod && { twoFactorMethod }),
      },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        twoFactorEnabled: user.twoFactorEnabled,
        twoFactorMethod: user.twoFactorMethod,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

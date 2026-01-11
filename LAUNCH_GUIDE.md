# E-Wallet Application - Setup & Launch Guide

## Overview
This is a complete E-Wallet application with:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: Email-based 2FA with Gmail integration

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)
- Gmail account with 2FA enabled

## Step 1: MongoDB Setup

### Install MongoDB Community Edition
Windows: Download from https://www.mongodb.com/try/download/community

### Start MongoDB Service
```bash
# Windows: MongoDB should auto-start, or run:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

Verify connection:
```bash
mongo mongodb://localhost:27017
```

## Step 2: Backend Setup

### Install Dependencies
```bash
cd backend
npm install
```

### Configure Environment Variables
Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/ewallet
JWT_SECRET=ewallet_jwt_secret_key_2024_change_in_production
JWT_EXPIRE=7d

# Gmail Configuration (IMPORTANT)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Get Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows" 
3. Copy the 16-character app password
4. Paste it in `.env` as `GMAIL_APP_PASSWORD`

### Start Backend Server
```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB at mongodb://localhost:27017/ewallet
🚀 Server is running on http://localhost:5000
```

## Step 3: Frontend Setup

### Install Dependencies
```bash
npm install
```

### Start Frontend Dev Server
```bash
npm run dev
```

You should see:
```
  VITE v6.3.5  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

## Step 4: Test the Application

### Access the Application
Open your browser and go to: **http://localhost:5173**

### Test Sign Up
1. Click "Sign up"
2. Enter:
   - First Name: John
   - Last Name: Doe
   - Email: test@gmail.com (use your Gmail account)
   - Password: Test12345
   - Confirm Password: Test12345
   - Accept terms
3. You'll receive an OTP code in your Gmail inbox
4. Enter the 6-digit code
5. Account created successfully!

### Test Login
1. Click "Sign In"
2. Enter your email and password
3. You'll receive an OTP code via email
4. Enter the code to verify
5. Logged in successfully!

### Test Security Settings
1. Go to Dashboard → Security Settings
2. Toggle 2FA on/off
3. Change authentication method (Email/SMS)
4. Update phone number (for SMS)
5. Click "Save Changes"

### Test Wallet Functions
1. **Add Money**: Click "Add Money" and enter amount
2. **Add Card**: Click "Add Card" and enter card details
3. **Transactions**: View transaction history
4. **Send Money**: (Feature available in dashboard)

## Database Collections

The application automatically creates these MongoDB collections:

### Users
- email, password (hashed), firstName, lastName
- phoneNumber, accountStatus, twoFactorEnabled, twoFactorMethod
- timestamps

### OTP
- userId, code, email, expiresAt
- isUsed, purpose (signup/login/password-reset)
- Auto-deletes after 10 minutes

### Wallets
- userId, balance, currency
- Automatically created on signup

### Cards
- userId, cardNumber, cardHolder, expiryDate, cvv
- cardType, isDefault, isActive, bank
- timestamps

### Transactions
- userId, transactionType, amount, currency, status
- description, dates, card references
- timestamps

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/verify-signup` - Verify signup OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-login` - Verify login OTP
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Cards
- `POST /api/cards/add` - Add new card
- `GET /api/cards` - Get all cards
- `DELETE /api/cards/:cardId` - Remove card
- `PUT /api/cards/:cardId/default` - Set default card

### Transactions
- `POST /api/transactions/create` - Create transaction
- `GET /api/transactions` - Get transactions
- `GET /api/transactions/balance` - Get wallet balance
- `POST /api/transactions/add-money` - Add money to wallet

## Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB service is running
- Check if MongoDB is on `localhost:27017`
- Verify: `mongo mongodb://localhost:27017`

### "Gmail SMTP Error"
- Enable 2FA on your Google account
- Generate App Password at https://myaccount.google.com/apppasswords
- Use 16-character app password, NOT your Gmail password
- Ensure GMAIL_USER is set in `.env`

### "CORS Error"
- Backend's FRONTEND_URL should match frontend URL (http://localhost:5173)
- Clear browser cache and restart both servers

### "OTP not received"
- Check Gmail Spam folder
- Verify Gmail credentials in `.env`
- Check backend logs for email errors

### "Token Expired"
- Clear `authToken` from localStorage
- Log out and log back in
- Default token expiry: 7 days

## Production Checklist

Before deployment:
- [ ] Change JWT_SECRET to strong random string
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS
- [ ] Set proper MONGODB_URI with authentication
- [ ] Use environment variables, not hardcoded values
- [ ] Enable rate limiting on API
- [ ] Encrypt sensitive data in database
- [ ] Set up proper error logging
- [ ] Configure backup strategy for MongoDB
- [ ] Test all 2FA flows

## Support
For issues, check:
1. Backend logs in terminal
2. Browser console (F12)
3. Network tab in DevTools
4. MongoDB logs: `mongod.log`

## Architecture

```
E-Wallet Application
├── Frontend (Vite + React)
│   ├── src/
│   │   ├── api/ (API client)
│   │   ├── app/components/ (UI components)
│   │   ├── styles/ (CSS)
│   │   └── main.tsx
│   └── index.html
│
└── Backend (Express + MongoDB)
    ├── src/
    │   ├── models/ (Mongoose schemas)
    │   ├── controllers/ (Business logic)
    │   ├── routes/ (API endpoints)
    │   ├── services/ (Auth, Email)
    │   ├── middleware/ (Auth verification)
    │   └── server.ts (Main server file)
    └── package.json
```

## Features Implemented

✅ User Registration with Email OTP Verification
✅ Two-Factor Authentication (2FA) via Email
✅ User Profile Management
✅ Security Settings (Change 2FA method)
✅ Card Management (Add, Remove, Set Default)
✅ Wallet Balance Management
✅ Transaction History
✅ Add Money to Wallet
✅ JWT-based Authentication
✅ MongoDB Integration
✅ Responsive UI
✅ Email Notifications

Ready to present! 🎉

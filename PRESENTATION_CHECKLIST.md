# E-Wallet Presentation Checklist

## ✅ Pre-Presentation Setup (Do this before your presentation)

### Day Before (Tonight)

- [ ] **Install Dependencies**
  - Run `setup.bat` in project root
  - Verify both frontend and backend `node_modules` exist

- [ ] **MongoDB Setup**
  - Install MongoDB from https://www.mongodb.com/try/download/community
  - Test connection: `mongosh mongodb://localhost:27017`
  - Verify connection works

- [ ] **Gmail 2FA Configuration** ⚠️ IMPORTANT
  - [ ] Enable 2-Factor Authentication: https://myaccount.google.com/security
  - [ ] Go to App Passwords: https://myaccount.google.com/apppasswords
  - [ ] Select "Mail" and "Windows"
  - [ ] Copy the 16-character password
  - [ ] Edit `backend/.env`:
    ```
    GMAIL_USER=your_email@gmail.com
    GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
    ```
  - [ ] Test: Send yourself an email from the app

- [ ] **Environment Variables**
  - [ ] Frontend `.env` exists: `VITE_API_URL=http://localhost:5000/api`
  - [ ] Backend `.env` configured with Gmail credentials
  - [ ] Backend `.env` has: `MONGODB_URI=mongodb://localhost:27017/ewallet`

- [ ] **Test Run (Full Dry Run)**
  - [ ] Start MongoDB service
  - [ ] Run `start.bat`
  - [ ] Test sign up with real Gmail
  - [ ] Verify OTP email received
  - [ ] Test login with 2FA
  - [ ] Check security settings
  - [ ] Test add money
  - [ ] Check database in MongoDB

### Day Of Presentation (Morning)

- [ ] **Final Checks**
  - [ ] MongoDB is installed and tested
  - [ ] Both servers start without errors
  - [ ] Frontend loads at http://localhost:5173
  - [ ] Backend health check: http://localhost:5000/api/health
  - [ ] Gmail notifications are working

- [ ] **Have Ready**
  - [ ] Test Gmail account with 2FA enabled
  - [ ] Gmail App Password saved
  - [ ] Gmail notifications tab open in separate window
  - [ ] MongoDB compass open (optional, for showing database)

- [ ] **Clean Up**
  - [ ] Clear browser cache (optional)
  - [ ] Close unnecessary applications
  - [ ] Have documentation ready to reference
  - [ ] Screenshot guides if needed

---

## 📋 Presentation Demo Script

### Opening (2 minutes)
```
"This is our E-Wallet application - a modern financial wallet system with 
secure 2FA authentication. Let me show you how it works."
```

### Demo Part 1: Sign Up Flow (3 minutes)

1. **Show Frontend**
   - Open http://localhost:5173
   - Show the clean login/signup interface

2. **Sign Up**
   - Click "Sign up"
   - Fill in form:
     - First Name: Demo
     - Last Name: User
     - Email: [your Gmail]
     - Password: DemoPass123
   - Click "Create Account"
   
3. **OTP Verification**
   - Show "Check your email" message
   - Check Gmail inbox (have it open)
   - Show the OTP email
   - Copy 6-digit code
   - Enter code and verify
   - Show "Success" page

### Demo Part 2: Login with 2FA (2 minutes)

1. **Logout**
   - Go to Dashboard
   - Security Settings
   - Click Logout

2. **Login**
   - Enter email and password
   - Show OTP sent message
   - Check Gmail for code
   - Verify and log in

### Demo Part 3: Security Settings (2 minutes)

1. **Open Settings**
   - Dashboard → Security Settings

2. **Show 2FA Features**
   - Toggle 2FA on/off
   - Show Email option selected
   - Explain SMS alternative
   - Show trusted devices

3. **Update Settings**
   - Toggle something
   - Click "Save Changes"
   - Show success message

### Demo Part 4: Wallet Features (2 minutes)

1. **Add Money**
   - Click "Add Money"
   - Enter amount: 1000
   - Confirm transaction
   - Show success

2. **Add Card**
   - Click "Add Card"
   - Enter test card details:
     ```
     4532 1234 5678 9010
     Demo User
     12/25
     123
     ```
   - Save card

3. **View Transactions**
   - Show transaction history
   - Show wallet balance

### Demo Part 5: Backend & Database (2 minutes)

1. **Show API Working**
   - Open new tab: http://localhost:5000/api/health
   - Show JSON response

2. **Show MongoDB** (optional)
   - Open MongoDB Compass
   - Connect to localhost:27017
   - Show 'ewallet' database
   - Show Users collection
   - Show OTP collection
   - Show Transactions collection

### Closing (1 minute)
```
"As you can see, we have a fully functional E-wallet application with:
- Secure 2FA authentication via email
- MongoDB integration for data persistence
- Full backend API connected to frontend
- Real-time OTP verification
- Transaction management and wallet features
- Professional UI with responsive design"
```

---

## 🎯 Key Points to Mention

### Security
- [ ] Password hashing with bcryptjs
- [ ] JWT token-based authentication
- [ ] Email OTP for 2FA verification
- [ ] Auto-expiring codes (10 minutes)

### Backend Features
- [ ] Express.js REST API
- [ ] MongoDB integration
- [ ] Nodemailer for email
- [ ] 14 API endpoints
- [ ] User authentication flow

### Frontend Features
- [ ] React with TypeScript
- [ ] Modern UI design
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states

### Database
- [ ] MongoDB collections
- [ ] User management
- [ ] Transaction history
- [ ] Card management
- [ ] Wallet balances

---

## 🚨 Troubleshooting During Demo

### If OTP email doesn't arrive:
- Check Gmail spam folder
- Verify Gmail credentials in backend/.env
- Check backend console for errors
- Restart backend server

### If frontend won't load:
- Clear browser cache (Ctrl+Shift+Delete)
- Check if npm run dev is still running
- Verify port 5173 is available

### If backend crashes:
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Check if Gmail credentials are correct
- Restart backend server

### If database isn't showing data:
- Verify MongoDB is connected
- Check database name: 'ewallet'
- Verify collections exist
- Check user ID matches in queries

---

## 📱 Live Demo URLs

```
Frontend:  http://localhost:5173
Backend:   http://localhost:5000
API Health: http://localhost:5000/api/health
MongoDB:   localhost:27017 (Compass)
```

---

## 💡 Pro Tips for Demo

1. **Have Gmail open** in separate tab/window
   - Makes OTP verification visible
   - Shows real-time email delivery

2. **Keep MongoDB Compass open** (optional)
   - Shows data persistence in real-time
   - Impressive for technical audience

3. **Test everything beforehand**
   - Do a complete dry run the night before
   - Know where to click
   - Have fallback screenshots

4. **Talk while clicking**
   - Explain what you're doing
   - Mention the technology stack
   - Point out security features

5. **Be ready to answer questions**
   - Why JWT tokens?
   - Why OTP via email?
   - How is data encrypted?
   - How does 2FA work?

6. **Have documentation ready**
   - Point to QUICK_START.md
   - Reference API_DOCUMENTATION.md
   - Show PRESENTATION_SUMMARY.md

---

## ✅ Day-Of Checklist (30 min before)

- [ ] MongoDB running
- [ ] `start.bat` executed
- [ ] Both servers are running
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend responds at http://localhost:5000/api/health
- [ ] Gmail account open with 2FA enabled
- [ ] Test account created and working
- [ ] One practice run completed
- [ ] All windows positioned nicely
- [ ] Projector/screen connected (if in-person)
- [ ] Microphone working (if remote)

---

## 🎬 Contingency Plan

### If something breaks 5 min before:
1. Restart MongoDB: `mongod.exe`
2. Kill node processes and restart `start.bat`
3. Clear browser cache
4. Have screenshots ready as backup

### If demo fails completely:
1. Use pre-recorded demo video (if available)
2. Show source code and architecture
3. Walk through API documentation
4. Discuss implementation details

---

## 📊 Demo Timeline

- **0:00** - Opening statement (1 min)
- **1:00** - Frontend tour (1 min)
- **2:00** - Sign up demo (2 min)
- **4:00** - OTP verification (1 min)
- **5:00** - Login with 2FA (1 min)
- **6:00** - Security settings (1 min)
- **7:00** - Wallet features (2 min)
- **9:00** - Backend/Database (1 min)
- **10:00** - Q&A and closing (2 min)

**Total: ~12 minutes presentation**

---

## 🎓 Questions You Might Get Asked

### Technical Questions
- **Q: How does 2FA work?**
  A: Users receive a 6-digit OTP via Gmail that expires in 10 minutes.

- **Q: What if the email doesn't arrive?**
  A: The user can resend the code after 60 seconds. We have error handling.

- **Q: Is the data secure?**
  A: Yes - passwords are hashed, OTP codes are auto-deleted, JWT has expiry.

- **Q: How does the database work?**
  A: MongoDB stores users, cards, transactions, and wallets with proper indexing.

- **Q: Can it scale?**
  A: Yes - we can add load balancing, caching, and database replication.

### Business Questions
- **Q: What's the revenue model?**
  A: Transaction fees, subscription tiers, or premium features.

- **Q: Who are your competitors?**
  A: PayPal, Stripe, Square, etc.

- **Q: What's next?**
  A: Mobile app, SMS 2FA, biometric auth, cryptocurrency support.

---

## 📞 Quick Reference

**Important Files:**
- Backend code: `backend/src/`
- Frontend code: `src/app/components/`
- Database: `backend/.env` (MONGODB_URI)
- Email: `backend/.env` (GMAIL_USER, GMAIL_APP_PASSWORD)

**Quick Commands:**
```bash
# Setup
setup.bat

# Start servers
start.bat

# Kill all node processes (if needed)
taskkill /F /IM node.exe

# Check MongoDB
mongosh mongodb://localhost:27017
```

---

**YOU'RE READY! Good luck with your presentation! 🚀**

# E-Wallet API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require:
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Public Endpoints

### 1. Sign Up
Create a new user account and send OTP verification code

**Request:**
```
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (200):**
```json
{
  "message": "OTP sent to your email",
  "email": "user@example.com",
  "requiresVerification": true
}
```

**Errors:**
- 400: Email already registered
- 400: Missing required fields
- 500: Failed to send OTP email

---

### 2. Verify Sign Up OTP
Verify the OTP code sent to email during signup

**Request:**
```
POST /auth/verify-signup
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49c1234567890abcde",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Errors:**
- 400: Invalid OTP code
- 400: OTP has expired (10 minutes)
- 500: Internal server error

---

### 3. Login
Authenticate user and request OTP for 2FA

**Request:**
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200) - 2FA Enabled:**
```json
{
  "message": "OTP sent to your email",
  "email": "user@example.com",
  "requiresOTP": true,
  "userId": "60d5ec49c1234567890abcde"
}
```

**Response (200) - 2FA Disabled:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49c1234567890abcde",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Errors:**
- 400: Invalid email or password
- 500: Failed to send OTP email

---

### 4. Verify Login OTP
Verify OTP code for 2FA login

**Request:**
```
POST /auth/verify-login
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49c1234567890abcde",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Errors:**
- 400: Invalid OTP code
- 400: OTP has expired
- 500: Internal server error

---

## Protected Endpoints

### 5. Get User Profile
Retrieve current user profile information

**Request:**
```
GET /auth/profile
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": "60d5ec49c1234567890abcde",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "twoFactorEnabled": true,
    "twoFactorMethod": "email"
  }
}
```

**Errors:**
- 401: Unauthorized (no token)
- 401: Invalid token
- 404: User not found

---

### 6. Update User Profile
Update user profile and security settings

**Request:**
```
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "twoFactorEnabled": true,
  "twoFactorMethod": "email"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "60d5ec49c1234567890abcde",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "twoFactorEnabled": true,
    "twoFactorMethod": "email"
  }
}
```

**Errors:**
- 401: Unauthorized
- 500: Internal server error

---

## Card Endpoints

### 7. Add Card
Add a new payment card to user's wallet

**Request:**
```
POST /cards/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "cardNumber": "4532123456789010",
  "cardHolder": "John Doe",
  "expiryDate": "12/25",
  "cvv": "123",
  "cardType": "debit",
  "bank": "Chase Bank"
}
```

**Response (201):**
```json
{
  "message": "Card added successfully",
  "card": {
    "id": "60d5ec49c1234567890abcde",
    "cardNumber": "9010",
    "cardHolder": "John Doe",
    "cardType": "debit",
    "bank": "Chase Bank"
  }
}
```

---

### 8. Get All Cards
Retrieve all cards for the user

**Request:**
```
GET /cards
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "cards": [
    {
      "id": "60d5ec49c1234567890abcde",
      "cardNumber": "9010",
      "cardHolder": "John Doe",
      "expiryDate": "12/25",
      "cardType": "debit",
      "bank": "Chase Bank",
      "isDefault": true
    }
  ]
}
```

---

### 9. Remove Card
Deactivate a card (soft delete)

**Request:**
```
DELETE /cards/{cardId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Card removed successfully"
}
```

---

### 10. Set Default Card
Set a card as default for transactions

**Request:**
```
PUT /cards/{cardId}/default
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Default card updated successfully"
}
```

---

## Transaction Endpoints

### 11. Create Transaction
Create a new transaction (deposit, withdrawal, transfer)

**Request:**
```
POST /transactions/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "transactionType": "deposit",
  "amount": 100,
  "description": "Added funds",
  "recipientEmail": "recipient@example.com"
}
```

**Response (201):**
```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "id": "60d5ec49c1234567890abcde",
    "type": "deposit",
    "amount": 100,
    "status": "completed",
    "date": "2024-01-11T10:30:00.000Z"
  }
}
```

---

### 12. Get Transactions
Retrieve transaction history (last 50)

**Request:**
```
GET /transactions
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "60d5ec49c1234567890abcde",
      "type": "deposit",
      "amount": 100,
      "status": "completed",
      "description": "Added funds",
      "date": "2024-01-11T10:30:00.000Z"
    }
  ]
}
```

---

### 13. Get Wallet Balance
Retrieve current wallet balance

**Request:**
```
GET /transactions/balance
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "balance": 500.00,
  "currency": "USD"
}
```

---

### 14. Add Money to Wallet
Add money to wallet (deposit)

**Request:**
```
POST /transactions/add-money
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100,
  "description": "Deposit from bank account"
}
```

**Response (200):**
```json
{
  "message": "Money added successfully",
  "balance": 600.00,
  "transaction": {
    "id": "60d5ec49c1234567890abcde",
    "amount": 100
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **404**: Not Found
- **500**: Internal Server Error

---

## Authentication Flow

### Sign Up & Login with 2FA
```
1. POST /auth/signup
   ↓
2. User receives OTP email
   ↓
3. POST /auth/verify-signup
   ↓
4. Returns JWT token
   ↓
5. Store token in localStorage
   ↓
6. Send token in Authorization header for all protected requests
```

---

## Data Models

### User
```json
{
  "email": "string (unique)",
  "password": "string (hashed)",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "accountStatus": "active|inactive|suspended",
  "twoFactorEnabled": "boolean",
  "twoFactorMethod": "email|sms",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### OTP
```json
{
  "userId": "ObjectId",
  "code": "string (6 digits)",
  "email": "string",
  "expiresAt": "timestamp",
  "isUsed": "boolean",
  "purpose": "signup|login|password-reset"
}
```

### Card
```json
{
  "userId": "ObjectId",
  "cardNumber": "string (encrypted)",
  "cardHolder": "string",
  "expiryDate": "string",
  "cvv": "string (encrypted)",
  "cardType": "credit|debit",
  "isDefault": "boolean",
  "isActive": "boolean",
  "bank": "string"
}
```

### Wallet
```json
{
  "userId": "ObjectId",
  "balance": "number",
  "currency": "string"
}
```

### Transaction
```json
{
  "userId": "ObjectId",
  "transactionType": "deposit|withdrawal|transfer|payment",
  "amount": "number",
  "currency": "string",
  "status": "pending|completed|failed|cancelled",
  "description": "string",
  "recipientEmail": "string",
  "senderEmail": "string",
  "fromCard": "ObjectId",
  "toCard": "ObjectId",
  "transactionDate": "timestamp"
}
```

---

## Rate Limiting

Not yet implemented. Recommended for production:
- 100 requests per 15 minutes per IP
- 5 sign-up attempts per 24 hours per email
- 10 login attempts per 5 minutes per account

---

## CORS Configuration

**Allowed Origins:**
- http://localhost:5173 (development)

**Methods:**
- GET, POST, PUT, DELETE, OPTIONS

**Headers:**
- Content-Type, Authorization

---

## Deployment Considerations

Before production:
- [ ] Change JWT_SECRET to strong random value
- [ ] Use HTTPS
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Add logging/monitoring
- [ ] Backup MongoDB regularly
- [ ] Use environment-specific .env files
- [ ] Encrypt sensitive data
- [ ] Add API versioning
- [ ] Implement request/response compression

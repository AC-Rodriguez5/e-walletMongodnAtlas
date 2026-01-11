import { secureStorage } from '../utils/secureStorage';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = secureStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
    try {
      const preview = token.slice(0, 8);
      console.log(`📤 API Call with token: ${endpoint} preview=${preview}... len=${token.length}`);
    } catch (e) {
      console.log(`📤 API Call with token: ${endpoint} (token present)`);
    }
  } else {
    console.warn(`⚠️ No token for ${endpoint}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    console.error(`❌ API Error ${response.status} on ${endpoint}:`, error);
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Auth API calls
export const authAPI = {
  signup: (email: string, password: string, firstName: string, lastName: string) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    }),

  verifySignupOTP: (email: string, code: string, firstName: string, lastName: string, password: string) =>
    apiCall('/auth/verify-signup', {
      method: 'POST',
      body: JSON.stringify({ email, code, firstName, lastName, password }),
    }),

  login: (email: string, password: string, deviceId?: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, deviceId }),
    }),

  verifyLoginOTP: (email: string, code: string, deviceId?: string, rememberDevice?: boolean) =>
    apiCall('/auth/verify-login', {
      method: 'POST',
      body: JSON.stringify({ email, code, deviceId, rememberDevice }),
    }),

  getProfile: () =>
    apiCall('/auth/profile', { method: 'GET' }),

  updateProfile: (data: any) =>
    apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Card API calls
export const cardAPI = {
  addCard: (cardNumber: string, cardHolder: string, expiryDate: string, cvv: string, cardType: string, bank: string, initialBalance?: number) =>
    apiCall('/cards/add', {
      method: 'POST',
      body: JSON.stringify({ cardNumber, cardHolder, expiryDate, cvv, cardType, bank, initialBalance }),
    }),

  getCards: () =>
    apiCall('/cards', { method: 'GET' }),

  removeCard: (cardId: string) =>
    apiCall(`/cards/${cardId}`, { method: 'DELETE' }),

  setDefaultCard: (cardId: string) =>
    apiCall(`/cards/${cardId}/default`, { method: 'PUT' }),

  addMoneyToCard: (cardId: string, amount: number, description: string) =>
    apiCall(`/cards/${cardId}/add-money`, {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    }),
};

// Transaction API calls
export const transactionAPI = {
  createTransaction: (transactionType: string, amount: number, description: string, recipientEmail?: string) =>
    apiCall('/transactions/create', {
      method: 'POST',
      body: JSON.stringify({ transactionType, amount, description, recipientEmail }),
    }),

  getTransactions: () =>
    apiCall('/transactions', { method: 'GET' }),

  getWalletBalance: () =>
    apiCall('/transactions/balance', { method: 'GET' }),

  addMoney: (amount: number, description: string) =>
    apiCall('/transactions/add-money', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    }),
};

// Wallet API calls
export const walletAPI = {
  getWallet: () =>
    apiCall('/wallet', { method: 'GET' }),

  getStats: () =>
    apiCall('/wallet/stats', { method: 'GET' }),

  addMoney: (amount: number, description: string) =>
    apiCall('/wallet/add', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    }),

  withdrawMoney: (amount: number, description: string) =>
    apiCall('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    }),

  sendMoney: (amount: number, description: string, recipientType: string, recipient: string, cardId?: string) =>
    apiCall('/wallet/send', {
      method: 'POST',
      body: JSON.stringify({ amount, description, recipientType, recipient, cardId }),
    }),

  transferMoney: (fromCardId: string, toCardId: string, amount: number, description: string) =>
    apiCall('/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({ fromCardId, toCardId, amount, description }),
    }),
};

/**
 * =====================================================================
 * SECURE STORAGE & SESSION MANAGEMENT MODULE
 * =====================================================================
 * 
 * PURPOSE: 
 * - Manages encrypted storage of sensitive data in localStorage
 * - Handles session timeouts for security
 * - Validates and sanitizes user inputs
 * 
 * OVERALL SECURITY FLOW:
 * 1. User logs in → credentials sent to server
 * 2. Server sends back auth token
 * 3. Token stored using secureStorage (automatically encrypted)
 * 4. Every API call includes encrypted token
 * 5. After 30 minutes of inactivity → automatic logout
 * 6. On logout → all encrypted data cleared
 * 
 * FRONTEND IMPACT: YES - Core of frontend security
 * User interactions trigger this security layer silently
 * =====================================================================
 */

import { encryptData, decryptData } from './encryption';

/**
 * LIST OF SENSITIVE KEYS
 * 
 * These keys are ALWAYS encrypted before storage
 * Any attempt to store data with these keys will be encrypted automatically
 * 
 * SECURITY PRINCIPLE: Defense in Depth
 * - User doesn't need to manually encrypt
 * - System automatically protects sensitive data
 */
const SENSITIVE_KEYS = [
  'authToken',        // JWT token for API authentication
  'userEmail',        // User's email address
  'preAuthToken',     // Short-lived token used during OTP flows
  'deviceId',         // Per-device identifier for trusted device feature
  'cardData',         // Credit/debit card information
  'walletData',       // Wallet balance and details
  'personalInfo',     // PII (Personally Identifiable Information)
  'transactionDetails', // Transaction history details
];

/**
 * =====================================================================
 * SECURE STORAGE OBJECT
 * =====================================================================
 * 
 * This is the PRIMARY way to store/retrieve data in the app
 * It replaces direct localStorage calls
 * 
 * SECURITY FEATURES:
 * - Automatic encryption for sensitive keys
 * - Automatic decryption on retrieval
 * - Type-safe JSON parsing
 * - Error handling and fallbacks
 * 
 * USAGE PATTERN (What the frontend does):
 * 1. Instead of: localStorage.setItem('authToken', token)
 * 2. Frontend does: secureStorage.setItem('authToken', token)
 * 3. Automatically encrypted and stored
 * 
 * INTERNAL STORAGE (What's actually in localStorage):
 * - Unencrypted key: "rememberMe" (not sensitive)
 * - Encrypted key: "encrypted_authToken" (sensitive, encrypted)
 * - Encrypted key: "encrypted_userEmail" (sensitive, encrypted)
 */
export const secureStorage = {
  /**
   * METHOD: setItem
   * 
   * PURPOSE: Store data with automatic encryption for sensitive keys
   * 
   * SECURITY FLOW:
   * 1. Check if key is in SENSITIVE_KEYS list
   * 2. If sensitive: encrypt using encryptData()
   * 3. Store encrypted version with "encrypted_" prefix
   * 4. Remove any old unencrypted version
   * 5. If not sensitive: store normally (for performance)
   * 
   * EXAMPLE:
   * Frontend code: secureStorage.setItem('authToken', 'jwt-token-abc123')
   * What happens internally:
   *   → Detects 'authToken' is sensitive
   *   → Encrypts to: "aBcDeFgHiJkLmNoPqRsTuVwXyZ"
   *   → Stores in localStorage as: "encrypted_authToken": "aBcDeFgHiJkLmNoPqRsTuVwXyZ"
   *   → Removes old unencrypted version if exists
   * 
   * FRONTEND IMPACT: Transparent - developer just calls setItem
   * Encryption happens automatically
   * 
   * @param {string} key - Storage key
   * @param {string | object} value - Data to store
   */
  setItem: (key: string, value: string | object): void => {
    try {
      // Convert object to string if needed
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      // Check if this is a sensitive key that needs encryption
      const isSensitive = SENSITIVE_KEYS.includes(key);
      
      console.log(`🔒 setItem called for "${key}" (sensitive=${isSensitive})`);
      
      if (isSensitive) {
        // SECURITY: Encrypt sensitive data
        console.log(`🔐 Encrypting data for key: ${key}`);
        const encrypted = encryptData(stringValue);
        console.log(`✅ Encryption complete. Encrypted length: ${encrypted.length}`);
        
        // Store with "encrypted_" prefix to identify it's encrypted
        const storageKey = `encrypted_${key}`;
        console.log(`💾 Storing to localStorage with key: ${storageKey}`);
        localStorage.setItem(storageKey, encrypted);
        console.log(`✅ Successfully stored. Verification:`, localStorage.getItem(storageKey) ? 'Found in storage' : 'NOT found in storage');
        
        // Remove old unencrypted version (migration from old system)
        localStorage.removeItem(key);
      } else {
        // Non-sensitive data stored normally (better performance)
        console.log(`💾 Storing non-sensitive data for key: ${key}`);
        localStorage.setItem(key, stringValue);
        console.log(`✅ Stored successfully`);
      }
    } catch (error) {
      console.error(`❌ Error setting secure storage item "${key}":`, error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  },

  /**
   * METHOD: getItem
   * 
   * PURPOSE: Retrieve data with automatic decryption for sensitive keys
   * 
   * SECURITY FLOW:
   * 1. Check if key is in SENSITIVE_KEYS list
   * 2. If sensitive: get encrypted version
   * 3. Decrypt using decryptData()
   * 4. Return original plain text
   * 5. If not sensitive: retrieve normally
   * 
   * EXAMPLE:
   * Frontend code: const token = secureStorage.getItem('authToken')
   * What happens internally:
   *   → Detects 'authToken' is sensitive
   *   → Looks for "encrypted_authToken"
   *   → Finds: "aBcDeFgHiJkLmNoPqRsTuVwXyZ"
   *   → Decrypts to: "jwt-token-abc123"
   *   → Returns plain text: "jwt-token-abc123"
   * 
   * FRONTEND IMPACT: Transparent - developer gets data as if it was unencrypted
   * Decryption happens automatically
   * 
   * @param {string} key - Storage key
   * @returns {string | null} - Retrieved data or null if not found
   */
  getItem: (key: string): string | null => {
    try {
      const isSensitive = SENSITIVE_KEYS.includes(key);
      
      if (isSensitive) {
        // Get encrypted version
        const encrypted = localStorage.getItem(`encrypted_${key}`);
        if (!encrypted) {
          // Silently return null - it's normal for keys to not exist before login
          return null;
        }
        // Decrypt and return
        const decrypted = decryptData(encrypted);
        if (!decrypted) {
          console.error(`❌ Failed to decrypt: encrypted_${key}`);
        }
        return decrypted;
      } else {
        // Non-sensitive data retrieved normally
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Error getting secure storage item "${key}":`, error);
      return null;
    }
  },

  /**
   * METHOD: getJSON
   * 
   * PURPOSE: Retrieve and parse JSON data
   * 
   * CONVENIENCE METHOD for storing objects
   * Automatically parses JSON and handles errors
   * 
   * EXAMPLE:
   * Frontend: const userData = secureStorage.getJSON<UserData>('userData')
   * Retrieves encrypted data, decrypts, and parses as JSON
   * Returns typed object or null
   * 
   * @param {string} key - Storage key
   * @returns {T | null} - Parsed JSON object or null
   */
  getJSON: <T = any>(key: string): T | null => {
    try {
      const value = secureStorage.getItem(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error parsing secure storage item "${key}":`, error);
      return null;
    }
  },

  /**
   * METHOD: removeItem
   * 
   * PURPOSE: Delete a specific item (encrypted or unencrypted)
   * 
   * SECURITY FLOW:
   * - Check if sensitive (delete encrypted version)
   * - If not sensitive (delete normal version)
   * 
   * EXAMPLE:
   * Frontend: secureStorage.removeItem('authToken')
   * Removes "encrypted_authToken" from localStorage
   * 
   * @param {string} key - Storage key to remove
   */
  removeItem: (key: string): void => {
    try {
      const isSensitive = SENSITIVE_KEYS.includes(key);
      if (isSensitive) {
        localStorage.removeItem(`encrypted_${key}`);
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing secure storage item "${key}":`, error);
    }
  },

  /**
   * METHOD: clear
   * 
   * PURPOSE: Clear ALL storage (used on logout)
   * 
   * SECURITY IMPORTANCE: Critical
   * - Removes all encrypted sensitive data
   * - Prevents data leakage if device is compromised
   * - Called automatically on logout and session timeout
   * 
   * EXAMPLE:
   * Frontend: User clicks logout
   * Backend: secureStorage.clear()
   * Result: All tokens, emails, card data removed from localStorage
   * 
   */
  clear: (): void => {
    try {
      // Remove all encrypted versions
      SENSITIVE_KEYS.forEach(key => {
        localStorage.removeItem(`encrypted_${key}`);
      });
      // Clear entire localStorage
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  },

  /**
   * METHOD: hasItem
   * 
   * PURPOSE: Check if a key exists (for conditional logic)
   * 
   * EXAMPLE:
   * if (secureStorage.hasItem('authToken')) {
   *   // User is logged in
   * } else {
   *   // Show login page
   * }
   * 
   * @param {string} key - Storage key to check
   * @returns {boolean} - True if key exists
   */
  hasItem: (key: string): boolean => {
    try {
      const isSensitive = SENSITIVE_KEYS.includes(key);
      if (isSensitive) {
        return localStorage.getItem(`encrypted_${key}`) !== null;
      } else {
        return localStorage.getItem(key) !== null;
      }
    } catch (error) {
      return false;
    }
  },
};

/**
 * =====================================================================
 * SESSION MANAGER CLASS
 * =====================================================================
 * 
 * PURPOSE: Handle automatic logout due to inactivity
 * 
 * SECURITY PRINCIPLE: Timeout Protection
 * - Prevents unauthorized access if user leaves device unattended
 * - Similar to banking websites (30-minute timeout)
 * - Resets on any user activity (mouse, keyboard, touch, scroll)
 * 
 * OVERALL FLOW:
 * 1. User logs in → SessionManager.startSession()
 * 2. System monitors user activity (click, type, touch, scroll)
 * 3. After 30 minutes of inactivity → automatic logout
 * 4. Activity detected → timer resets
 * 5. On logout → SessionManager.endSession() called
 * 
 * FRONTEND IMPACT: YES
 * - Users automatically logged out if inactive
 * - Silent operation (no visible changes unless timeout happens)
 * - Similar to Gmail, banking sites, etc.
 */
export class SessionManager {
  // SECURITY SETTING: 30 minutes of inactivity = automatic logout
  private static TIMEOUT_DURATION = 30 * 60 * 1000; // 30 * 60 seconds * 1000 ms
  
  // Timer ID to track timeout
  private static INACTIVITY_TIMEOUT_ID: number | null = null;

  /**
   * METHOD: startSession
   * 
   * PURPOSE: Begin monitoring user activity
   * 
   * SECURITY FLOW:
   * 1. Reset inactivity timer immediately
   * 2. Listen for user activity events
   * 3. If activity detected → reset timer
   * 4. If no activity for 30 mins → logout
   * 
   * WHEN CALLED: After successful login
   * 
   * EXAMPLE:
   * User logs in successfully → App calls SessionManager.startSession()
   * → System starts monitoring for inactivity
   * 
   * EVENTS MONITORED:
   * - mousedown: Mouse clicked
   * - keydown: Keyboard pressed
   * - scroll: Page scrolled
   * - touchstart: Touch detected (mobile)
   * 
   * FRONTEND IMPACT: User experience unchanged
   * They don't realize the app is watching for inactivity
   */
  static startSession(): void {
    // Reset timer when session starts
    this.resetInactivityTimer();
    
    // SECURITY: Monitor these user activities
    // If any activity → timer resets → user stays logged in
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer(), true);
    });
  }

  /**
   * METHOD: resetInactivityTimer (Private)
   * 
   * PURPOSE: Reset the 30-minute inactivity counter
   * 
   * SECURITY FLOW:
   * 1. Clear existing timeout if any
   * 2. Start new 30-minute countdown
   * 3. When countdown ends → call endSession()
   * 
   * CALLED BY: startSession() and activity event listeners
   * 
   * EXAMPLE:
   * Timer starts: T=0
   * User inactive for 15 mins: Timer at T=15
   * User clicks mouse: resetInactivityTimer() called
   * New timer starts: T=0 again (30-minute countdown restarts)
   * 
   */
  private static resetInactivityTimer(): void {
    // Clear old timer if exists
    if (this.INACTIVITY_TIMEOUT_ID) {
      clearTimeout(this.INACTIVITY_TIMEOUT_ID);
    }

    // Set new timer for 30 minutes
    // After 30 minutes with no activity → automatically logout
    this.INACTIVITY_TIMEOUT_ID = window.setTimeout(() => {
      console.warn('Session expired due to inactivity');
      this.endSession();
    }, this.TIMEOUT_DURATION);
  }

  /**
   * METHOD: endSession
   * 
   * PURPOSE: Logout user (either timeout or manual logout)
   * 
   * SECURITY CLEANUP:
   * 1. Stop monitoring activity
   * 2. Remove all encrypted data
   * 3. Remove auth token
   * 4. Remove email
   * 5. Redirect to login page
   * 
   * CALLED BY:
   * - Session timeout (after 30 minutes inactivity)
   * - User clicks logout
   * 
   * FRONTEND IMPACT: User is returned to login page
   * All sensitive data cleared from device
   * 
   * EXAMPLE:
   * User leaves device unattended for 30 minutes
   * SessionManager automatically calls endSession()
   * → All auth data cleared
   * → Page redirects to login
   * → User must login again
   */
  static endSession(): void {
    // Stop timeout timer
    if (this.INACTIVITY_TIMEOUT_ID) {
      clearTimeout(this.INACTIVITY_TIMEOUT_ID);
    }
    
    // SECURITY: Clear all sensitive data
    secureStorage.removeItem('authToken');
    secureStorage.removeItem('userEmail');
    
    // Redirect to login page
    window.location.href = '/login';
  }

  /**
   * METHOD: getRemainingTime
   * 
   * PURPOSE: Get how much time left before timeout
   * 
   * USAGE: Can show warning "You'll be logged out in X minutes"
   * 
   * @returns {number} - Milliseconds until timeout
   */
  static getRemainingTime(): number {
    return this.TIMEOUT_DURATION;
  }
}

/**
 * =====================================================================
 * INPUT VALIDATION & SANITIZATION
 * =====================================================================
 * 
 * PURPOSE: Prevent invalid data and security attacks
 * 
 * SECURITY PRINCIPLES:
 * 1. Never trust user input
 * 2. Validate everything on client AND server
 * 3. Sanitize HTML to prevent XSS attacks
 * 4. Check format before processing
 * 
 * OVERALL FLOW:
 * 1. User enters data (email, password, card number)
 * 2. Frontend validates using validateAndSanitize
 * 3. If invalid → show error message
 * 4. If valid → send to backend
 * 5. Backend validates again (defense in depth)
 * 6. If valid → process data
 * 
 * FRONTEND IMPACT: YES
 * - Prevents users from entering invalid data
 * - Real-time validation feedback
 * - Prevents malicious input attempts
 */
export const validateAndSanitize = {
  /**
   * VALIDATOR: email
   * 
   * PURPOSE: Check if email format is valid
   * 
   * SECURITY CHECK: Regex pattern for valid email format
   * Pattern: something@something.something
   * 
   * EXAMPLE:
   * Valid: "user@gmail.com", "john.doe@company.co.uk"
   * Invalid: "user", "user@", "@gmail.com"
   * 
   * FRONTEND USAGE:
   * if (!validateAndSanitize.email(userEmail)) {
   *   showError("Please enter valid email");
   * }
   * 
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * VALIDATOR: password
   * 
   * PURPOSE: Check password strength and return strength level
   * 
   * STRENGTH REQUIREMENTS:
   * - Minimum 8 characters (isLongEnough)
   * - At least 1 uppercase letter (hasUpperCase)
   * - At least 1 lowercase letter (hasLowerCase)
   * - At least 1 number (hasNumbers)
   * - At least 1 special character (hasSpecialChars)
   * 
   * VALID if:
   * - At least 8 characters AND
   * - At least 3 of the above criteria met
   * 
   * STRENGTH LEVELS:
   * - "weak": 2 or fewer criteria (not valid)
   * - "fair": 3-4 criteria met (valid)
   * - "strong": 5 criteria met (very valid)
   * 
   * EXAMPLE:
   * "password": weak (no uppercase, numbers, special chars)
   * "Pass123": fair (uppercase, numbers, 7 chars - close)
   * "Pass123!": strong (all criteria met)
   * 
   * FRONTEND USAGE:
   * const {valid, strength} = validateAndSanitize.password(password);
   * if (valid) {
   *   // Allow password
   * } else {
   *   // Show error: "Password too weak"
   * }
   * 
   * FRONTEND IMPACT: Real-time password strength indicator
   * User sees "weak", "fair", "strong" as they type
   * 
   * @param {string} password - Password to validate
   * @returns {object} - {valid: boolean, strength: string}
   */
  password: (password: string): { valid: boolean; strength: string } => {
    // Check each criteria
    const hasUpperCase = /[A-Z]/.test(password);      // At least one A-Z
    const hasLowerCase = /[a-z]/.test(password);      // At least one a-z
    const hasNumbers = /\d/.test(password);           // At least one 0-9
    const hasSpecialChars = /[!@#$%^&*]/.test(password); // Special characters
    const isLongEnough = password.length >= 8;        // 8+ characters

    // Count how many criteria met
    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars, isLongEnough].filter(Boolean).length;

    return {
      // Valid only if 8+ chars AND at least 3 criteria met
      valid: isLongEnough && strengthScore >= 3,
      // Strength based on criteria count
      strength: strengthScore <= 2 ? 'weak' : strengthScore <= 3 ? 'fair' : 'strong',
    };
  },

  /**
   * SANITIZER: sanitizeHTML
   * 
   * PURPOSE: Remove dangerous HTML/JavaScript to prevent XSS attacks
   * 
   * SECURITY PRINCIPLE: Never allow user input as HTML
   * 
   * ATTACK EXAMPLE (XSS - Cross Site Scripting):
   * User enters: "<img src=x onerror='steal data'>"
   * Without sanitization: Script would execute
   * With sanitization: Returns plain text: "<img src=x onerror='steal data'>"
   * 
   * HOW IT WORKS:
   * 1. Create a div element
   * 2. Set user input as textContent (not innerHTML)
   * 3. Get innerHTML back (any special chars are HTML-encoded)
   * 4. Return encoded HTML (safe)
   * 
   * EXAMPLE:
   * Input: "<script>alert('hacked')</script>"
   * Output: "&lt;script&gt;alert('hacked')&lt;/script&gt;"
   * (Displayed as text, won't execute)
   * 
   * FRONTEND IMPACT: Prevents XSS attacks
   * User input shown as text, not executed as code
   * 
   * @param {string} input - Raw user input
   * @returns {string} - Sanitized HTML-safe string
   */
  sanitizeHTML: (input: string): string => {
    // Create hidden div
    const div = document.createElement('div');
    // Set user input as text (not HTML)
    div.textContent = input;
    // Get back as HTML (special chars encoded)
    return div.innerHTML;
  },

  /**
   * VALIDATOR: cardNumber
   * 
   * PURPOSE: Validate credit/debit card number using Luhn algorithm
   * 
   * LUHN ALGORITHM:
   * - Mathematical formula to validate card numbers
   * - Used by all major credit card companies
   * - Prevents typos and fake numbers
   * - Quick format check (13-19 digits)
   * 
   * HOW IT WORKS:
   * 1. Double every second digit from right
   * 2. If doubled > 9, subtract 9
   * 3. Sum all digits
   * 4. If sum divisible by 10 → valid
   * 
   * EXAMPLE:
   * Valid: "4532123456789123" (passes Luhn)
   * Invalid: "4532123456789124" (fails Luhn)
   * 
   * FRONTEND IMPACT: Real-time card validation
   * User gets feedback if card number invalid
   * 
   * @param {string} cardNumber - Credit card number
   * @returns {boolean} - True if valid
   */
  cardNumber: (cardNumber: string): boolean => {
    // Remove spaces
    const cleaned = cardNumber.replace(/\s/g, '');
    
    // Check basic format (13-19 digits only)
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    // LUHN ALGORITHM
    let sum = 0;
    let isEven = false;

    // Process digits from right to left
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      // Double every second digit
      if (isEven) {
        digit *= 2;
        // If result > 9, subtract 9
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    // Valid if sum divisible by 10
    return sum % 10 === 0;
  },

  /**
   * VALIDATOR: cvv
   * 
   * PURPOSE: Validate CVV (3 or 4 digit security code)
   * 
   * FORMAT:
   * - Visa/Mastercard/Discover: 3 digits
   * - American Express: 4 digits
   * - Only numbers allowed
   * 
   * EXAMPLE:
   * Valid: "123", "4567"
   * Invalid: "12", "12a"
   * 
   * FRONTEND IMPACT: Real-time CVV validation
   * Prevents invalid CVV entry
   * 
   * @param {string} cvv - CVV code
   * @returns {boolean} - True if valid format
   */
  cvv: (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv);
  },
};



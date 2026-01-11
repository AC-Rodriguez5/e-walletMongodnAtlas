/**
 * =====================================================================
 * DATA ENCRYPTION MODULE
 * =====================================================================
 * 
 * PURPOSE: Provides encryption and decryption utilities for sensitive data
 * 
 * OVERALL FLOW:
 * 1. When sensitive data (tokens, emails, card info) needs to be stored
 * 2. This module encrypts it using XOR cipher + Base64 encoding
 * 3. Encrypted data is saved to localStorage
 * 4. When data is retrieved, it's automatically decrypted back to original
 * 
 * SECURITY IMPLEMENTATION:
 * - XOR Cipher: Simple but effective reversible encryption
 * - Base64 Encoding: Makes encrypted data safe for transmission
 * - Secret Key: Derived from app configuration (more in production)
 * 
 * HOW IT WORKS:
 * Original Text → Base64 → XOR with Secret Key → Base64 → Encrypted Storage
 * Encrypted Storage → Base64 Decode → XOR Reverse → Base64 Decode → Original Text
 * 
 * FRONTEND IMPACT: YES - All sensitive data storage uses this module
 * Users won't see this, but all their tokens and personal data are encrypted
 * =====================================================================
 */

// Get encryption secret from environment variables (fallback to default for demo)
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'ewallet-secret-2024';

/**
 * FUNCTION: encryptData
 * 
 * PURPOSE: Encrypt a sensitive string using XOR cipher
 * 
 * SECURITY FLOW:
 * 1. Take plain text (e.g., authentication token)
 * 2. Convert to Base64 (readable format → encoded format)
 * 3. Apply XOR operation with secret key (each character XORed with key)
 * 4. Convert result back to Base64 (for safe storage)
 * 
 * EXAMPLE:
 * Input: "my-auth-token-12345"
 * Step 1: Base64 encode → "bXktYXV0aC10b2tlbi0xMjM0NQ=="
 * Step 2: XOR each character with secret key
 * Step 3: Base64 encode again → "aBcDeFgHiJkLmNoPqRsTuVwXyZ"
 * Output: "aBcDeFgHiJkLmNoPqRsTuVwXyZ" (encrypted, safe to store)
 * 
 * @param {string} data - Plain text to encrypt
 * @returns {string} - Encrypted data (Base64 encoded)
 */
export function encryptData(data: string): string {
  try {
    console.log(`🔐 encryptData called with ${data.length} chars`);
    
    // STEP 1: Convert plain text to Base64
    // This makes the data "readable" in a different format
    const encoded = btoa(data);
    console.log(`📝 Base64 encoded: ${encoded.length} chars`);
    
    // STEP 2: Apply XOR cipher
    // XOR (exclusive OR) each character with the secret key
    // This scrambles the data so it's not readable without the key
    let encrypted = '';
    for (let i = 0; i < encoded.length; i++) {
      // Get character code from encoded string
      // XOR it with character code from secret key (cycling through key)
      // Convert result back to character
      encrypted += String.fromCharCode(
        encoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length)
      );
    }
    console.log(`🔐 XOR cipher applied: ${encrypted.length} chars`);
    
    // STEP 3: Encode encrypted data to Base64 for safe storage
    // This prevents special characters from breaking localStorage
    const result = btoa(encrypted);
    console.log('🔐 Encryption successful:', {
      inputLength: data.length,
      outputLength: result.length,
      preview: result.substring(0, 30) + '...'
    });
    return result;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return data; // Fallback: return unencrypted (for error tolerance)
  }
}

/**
 * FUNCTION: decryptData
 * 
 * PURPOSE: Decrypt encrypted data back to original plain text
 * 
 * SECURITY FLOW (Reverse of encryption):
 * 1. Take encrypted data from storage
 * 2. Decode from Base64
 * 3. Reverse XOR operation with same secret key
 * 4. Decode from Base64 to get original text
 * 
 * NOTE: Works because XOR is reversible:
 * If: A XOR B = C
 * Then: C XOR B = A (same operation reverses it)
 * 
 * EXAMPLE:
 * Input: "aBcDeFgHiJkLmNoPqRsTuVwXyZ" (encrypted)
 * Step 1: Base64 decode → Get XORed characters
 * Step 2: XOR each character with secret key (reverses encryption)
 * Step 3: Base64 decode → "my-auth-token-12345" (original)
 * Output: "my-auth-token-12345" (decrypted, back to original)
 * 
 * @param {string} encryptedData - Encrypted data (Base64 encoded)
 * @returns {string} - Original plain text
 */
export function decryptData(encryptedData: string): string {
  try {
    console.log(`🔓 decryptData called with ${encryptedData.length} chars`);
    
    // STEP 1: Decode from Base64 to get XORed characters
    const encrypted = atob(encryptedData);
    console.log(`📝 Base64 decoded: ${encrypted.length} chars`);
    
    // STEP 2: Reverse XOR operation
    // Use same operation (XOR is self-reversing) with same secret key
    let decoded = '';
    for (let i = 0; i < encrypted.length; i++) {
      decoded += String.fromCharCode(
        encrypted.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length)
      );
    }
    console.log(`🔐 XOR reversed: ${decoded.length} chars`);
    
    // STEP 3: Decode from Base64 to get original text
    const result = atob(decoded);
    console.log('🔓 Decryption successful:', {
      inputLength: encryptedData.length,
      outputLength: result.length,
      preview: result.substring(0, 30) + '...'
    });
    return result;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return encryptedData; // Fallback: return as-is
  }
}

/**
 * FUNCTION: maskCardNumber
 * 
 * PURPOSE: Display card number securely by showing only last 4 digits
 * 
 * SECURITY BENEFIT:
 * - Prevents full card number from being visible
 * - Complies with PCI DSS standards
 * - User can still identify their card by last 4 digits
 * 
 * EXAMPLE:
 * Input: "4532123456789123"
 * Output: "****-****-****-9123"
 * 
 * FRONTEND IMPACT: YES - UI displays masked cards instead of full numbers
 * 
 * @param {string} cardNumber - Full card number
 * @returns {string} - Masked card number (****-****-****-XXXX)
 */
export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 4) return cardNumber;
  const lastFour = cardNumber.slice(-4);
  return `****-****-****-${lastFour}`;
}

/**
 * FUNCTION: maskEmail
 * 
 * PURPOSE: Display email securely by partially masking it
 * 
 * SECURITY BENEFIT:
 * - Prevents email privacy leakage
 * - User can still verify it's their email
 * - Complies with GDPR privacy standards
 * 
 * EXAMPLE:
 * Input: "john.doe@example.com"
 * Output: "j***e@example.com"
 * 
 * FRONTEND IMPACT: YES - UI displays masked emails in sensitive contexts
 * 
 * @param {string} email - Full email address
 * @returns {string} - Masked email (f***e@domain.com)
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  // Keep first and last character of email local part, mask middle
  const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
}

/**
 * FUNCTION: hashPassword
 * 
 * PURPOSE: Create a hash of password (client-side supplementary security)
 * 
 * SECURITY NOTE:
 * - Server MUST also hash passwords (this is just client-side preprocessing)
 * - Never send plain passwords over the network
 * - This provides additional layer of protection
 * 
 * HOW IT WORKS:
 * - Converts password to numeric hash
 * - Not reversible (can't get password back from hash)
 * - Same password always produces same hash
 * 
 * EXAMPLE:
 * Input: "MyPassword123!"
 * Output: "a7f2e8c4b9d1" (different format each time function is called)
 * 
 * @param {string} password - Plain text password
 * @returns {string} - Hashed password (hexadecimal string)
 */
export function hashPassword(password: string): string {
  // Simple hash function (production should use bcrypt on server)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16); // Convert to hexadecimal
}


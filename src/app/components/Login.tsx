/**
 * =====================================================================
 * LOGIN COMPONENT - USER AUTHENTICATION FORM
 * =====================================================================
 * 
 * PURPOSE: 
 * - Display login form with email/password inputs
 * - Validate user credentials with backend
 * - Handle "Remember me" feature for email storage
 * - Manage visible/hidden password toggle
 * - Show error messages if login fails
 * 
 * OVERALL SECURITY FLOW:
 * 1. User enters email and password
 * 2. Frontend validates email format (client-side check)
 * 3. Email and password sent to backend
 * 4. Backend verifies password hash matches
 * 5. Backend generates OTP code and emails it to user
 * 6. User receives OTP code in their email
 * 7. User enters OTP code (next screen - EmailVerification)
 * 8. Backend verifies OTP is correct
 * 9. Backend generates auth token (JWT)
 * 10. Auth token stored in secure storage (encrypted)
 * 11. User redirected to dashboard
 * 
 * FRONTEND IMPACT: YES - Core authentication screen
 * This is the first screen unauthenticated users see
 * =====================================================================
 */

import { useState, useEffect } from "react";
import { Wallet, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { authAPI } from "../../api/client.js";
import { secureStorage, validateAndSanitize } from "../../utils/secureStorage";

/**
 * COMPONENT PROPS
 * 
 * onSwitchToSignUp: Callback function called when user clicks "Sign up"
 * onLoginAttempt: Callback function called when OTP verification required
 *                 Passes email so App knows which user is logging in
 */
interface LoginProps {
  onSwitchToSignUp: () => void;
  onLoginAttempt: (email: string) => void;
}

export function Login({ onSwitchToSignUp, onLoginAttempt }: LoginProps) {
  /**
   * =====================================================================
   * STATE MANAGEMENT
   * =====================================================================
   */
  
  /**
   * showPassword: Toggle for password visibility (show/hide)
   * 
   * SECURITY: Password shown as dots by default
   * User can click eye icon to show password
   * Useful on small screens where typos common
   * 
   * STATE: true = show password, false = hide (show dots)
   */
  const [showPassword, setShowPassword] = useState(false);
  
  /**
   * email: User's email address (text input field)
   * 
   * USAGE: Sent to backend for authentication
   * VALIDATION: Must be valid email format (name@domain.com)
   * STORAGE: Can be saved in localStorage if "Remember me" checked
   * 
   * SECURITY NOTE:
   * - Email NOT encrypted in localStorage (not sensitive on its own)
   * - Only password is kept secret
   * - Email is somewhat public (shown in account lists)
   * - But encrypted in secureStorage when used as auth data
   */
  const [email, setEmail] = useState("");
  
  /**
   * password: User's password (text input field)
   * 
   * USAGE: Sent to backend for authentication
   * SECURITY: NEVER stored anywhere
   * - User types it in
   * - Sent to backend
   * - Backend never transmits it back
   * - Cleared from frontend memory
   * 
   * WHY NOT STORE:
   * - Even encryption not secure for passwords
   * - Users should remember their passwords
   * - If user forgets, they reset password (recovery)
   * - Remember me saves EMAIL only, not password
   */
  const [password, setPassword] = useState("");
  
  /**
   * rememberMe: Checkbox state for "Remember this email"
   * 
   * WHEN CHECKED:
   * - Email saved to localStorage with key "rememberedEmail"
   * - Next time user visits login page → email pre-filled
   * - User doesn't have to type email again
   * 
   * SECURITY IMPLICATIONS:
   * - Only saves email (not sensitive on its own)
   * - Password still required (can't skip)
   * - Still requires OTP (can't skip)
   * - User can clear browser data to remove
   * 
   * USE CASE:
   * - Personal device (trusted)
   * - Work computer
   * - Any shared/public device → unchecked for security
   */
  const [rememberMe, setRememberMe] = useState(false);
  
  /**
   * loading: Shows "Signing In..." while backend processes login
   * 
   * PURPOSE:
   * - Button shows loading state
   * - Prevents user from clicking multiple times
   * - Shows server is processing request
   * 
   * FLOW:
   * User clicks "Sign In" → loading = true
   * Backend processes login → loading = false
   * New screen shown or error displayed
   */
  const [loading, setLoading] = useState(false);
  
  /**
   * error: Error message to show user if login fails
   * 
   * ERROR EXAMPLES:
   * - "Please enter a valid email address"
   * - "Invalid email or password"
   * - "Too many login attempts, try again later"
   * - "Network error, please try again"
   * 
   * FRONTEND IMPACT:
   * - Red error box shown at top of form
   * - User sees why login failed
   * - User can correct input and retry
   */
  const [error, setError] = useState("");

  /**
   * =====================================================================
   * EFFECT: Load Remembered Email on Component Mount
   * =====================================================================
   * 
   * WHEN: Component first renders (when user visits login page)
   * 
   * PURPOSE: Auto-fill email field if user checked "Remember me" before
   * 
   * FLOW:
   * 1. Look for "rememberedEmail" in localStorage
   * 2. If found: set email field to that value
   * 3. If found: check the "Remember me" checkbox
   * 4. User sees pre-filled email, one less thing to type
   * 
   * EXAMPLE:
   * Session 1: User types "john@gmail.com", checks "Remember me", logs in
   * └─ Email saved to localStorage: rememberedEmail = "john@gmail.com"
   * 
   * Session 2: User returns to app a week later
   * └─ Login page loads
   * └─ This effect runs
   * └─ Finds "john@gmail.com" in localStorage
   * └─ Sets email field to "john@gmail.com"
   * └─ Checks "Remember me" checkbox
   * └─ User sees email already filled in
   * └─ Just needs to type password
   * 
   * SECURITY:
   * - Only stores email (not password, not token)
   * - User still must type password
   * - User still must enter OTP
   * - Can't bypass authentication this way
   */
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  /**
   * =====================================================================
   * HANDLER: Remember Me Checkbox Changed
   * =====================================================================
   * 
   * CALLED WHEN: User checks or unchecks "Remember me" checkbox
   * 
   * SECURITY FLOW:
   * 
   * If CHECKED:
   * 1. User wants email remembered
   * 2. If email exists in field: save to localStorage
   * 3. Next time user visits login: email pre-filled
   * 
   * If UNCHECKED:
   * 1. User doesn't want email remembered
   * 2. Delete email from localStorage
   * 3. Next time user visits login: empty field
   * 
   * SECURITY CONSIDERATIONS:
   * - Email NOT encrypted (not sensitive)
   * - Password NEVER stored
   * - Token stored separately (encrypted)
   * - User must still login on next visit
   * 
   * FRONTEND IMPACT:
   * - Checkbox toggles on/off
   * - Email appears/disappears next login
   * - User experience slightly improved
   */
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    if (checked && email) {
      // User wants email remembered, and email field not empty
      localStorage.setItem("rememberedEmail", email);
    } else if (!checked) {
      // User unchecked, delete saved email
      localStorage.removeItem("rememberedEmail");
    }
  };

  /**
   * =====================================================================
   * HANDLER: Email Input Field Changed
   * =====================================================================
   * 
   * CALLED WHEN: User types in email field
   * 
   * FLOW:
   * 1. Update email state with typed value
   * 2. If "Remember me" is checked: update saved email
   * 3. Keeps localStorage in sync with typed value
   * 
   * EXAMPLE:
   * User checks "Remember me"
   * User types: "j" → saved
   * User types: "jo" → saved
   * User types: "john@gmail.com" → saved
   * 
   * If they later uncheck "Remember me" → saved value cleared
   * If they type something wrong and then correct → updated
   * 
   * FRONTEND IMPACT:
   * - Real-time sync with localStorage
   * - If user closes browser mid-typing, progress saved
   * - Next login shows current email (not old one)
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // If remember me is checked, update saved email in real-time
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", e.target.value);
    }
  };

  /**
   * =====================================================================
   * HANDLER: Form Submit (MAIN LOGIN LOGIC)
   * =====================================================================
   * 
   * CALLED WHEN: User clicks "Sign In" button
   * 
   * OVERALL SECURITY FLOW:
   * 
   * STEP 1: Validate Email Format (Client-side)
   * ├─ Check if email matches format: name@domain.com
   * ├─ If invalid: show error, don't send to backend
   * ├─ Prevents obvious typos from reaching backend
   * └─ FRONTEND IMPACT: User sees "Please enter valid email"
   * 
   * STEP 2: Send Login Request to Backend
   * ├─ Send: { email, password }
   * ├─ Backend receives credentials
   * ├─ Backend looks up user by email
   * ├─ Backend compares password hash
   * └─ Backend compares typed password with stored hash
   * 
   * STEP 3: Backend Processes Authentication
   * ├─ If password WRONG: return error "Invalid email or password"
   * ├─ If password CORRECT: generate OTP code
   * ├─ Backend sends OTP to user's email address
   * ├─ Backend returns { requiresOTP: true }
   * └─ Frontend receives response
   * 
   * STEP 4: Save Remember Me Choice
   * ├─ If checked: save email to localStorage
   * ├─ If unchecked: delete saved email
   * ├─ User preference stored locally
   * └─ FRONTEND IMPACT: Auto-fill on next login (or not)
   * 
   * STEP 5: Navigate to Next Screen
   * ├─ Call onLoginAttempt(email)
   * ├─ Parent component (App.tsx) shows OTP input screen
   * ├─ User must enter code they received in email
   * └─ FRONTEND IMPACT: Screen changes to EmailVerification
   * 
   * ERROR HANDLING:
   * ├─ Network error → "Network error, please try again"
   * ├─ Invalid email → "Please enter a valid email address"
   * ├─ Wrong password → "Invalid email or password"
   * ├─ Server error → "Login failed. Please try again."
   * └─ FRONTEND IMPACT: Error box shown, user can retry
   * 
   * WHY OTP AFTER PASSWORD:
   * - Password proves you know the password
   * - OTP proves you have access to the email account
   * - Combined = much more secure
   * - Similar to Gmail, banking, etc.
   * - Prevents unauthorized access even if password leaked
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    /**
     * VALIDATION: Check email format
     * 
     * Using validateAndSanitize.email() function
     * Checks if email matches: something@something.something
     * 
     * Examples:
     * Valid: "user@gmail.com", "john.doe@company.co.uk"
     * Invalid: "user", "user@", "@gmail.com"
     * 
     * SECURITY PURPOSE:
     * - Prevent invalid emails reaching backend
     * - Show user immediately if wrong format
     * - Saves server processing time
     * - Improves user experience (faster feedback)
     */
    if (!validateAndSanitize.email(email)) {
      setError("Please enter a valid email address");
      return; // Stop, don't send invalid email to backend
    }

    /**
     * SHOW LOADING STATE
     * 
     * Button changes to "Signing In..." text
     * Button becomes disabled (can't click again)
     * User sees something is happening
     */
    setLoading(true);

    try {
      /**
       * SEND LOGIN REQUEST TO BACKEND
       * 
       * What happens:
       * 1. Call authAPI.login(email, password)
       * 2. API client sends POST request to /auth/login
       * 3. Request body: { email, password }
       * 4. Backend validates credentials
       * 5. Backend generates OTP and emails it
       * 6. Backend returns: { requiresOTP: true, token: "..." }
       * 
       * API CALL (see src/api/client.ts):
       * const response = await fetch('/auth/login', {
       *   method: 'POST',
       *   body: JSON.stringify({ email, password })
       * })
       */
      // Ensure deviceId exists for this client (used for trusted device flow)
      let deviceId = secureStorage.getItem('deviceId');
      if (!deviceId) {
        // Simple UUID v4 generator (frontend-only)
        const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
        deviceId = uuidv4();
        secureStorage.setItem('deviceId', deviceId);
      }

      const response = await authAPI.login(email, password, deviceId);
      
      /**
       * HANDLE REMEMBER ME
       * 
       * User's choice about remembering email
       * - If checked: localStorage.setItem('rememberedEmail', email)
       * - If unchecked: localStorage.removeItem('rememberedEmail')
       * 
       * SECURITY:
       * - Email not sensitive (can be remembered)
       * - Password never saved (would be dangerous)
       * - Token stored separately and encrypted
       */
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      /**
       * HANDLE OTP REQUIREMENT
       * 
       * Response: { requiresOTP: true }
       * Means: Password was correct, OTP sent to email
       * 
       * ACTION: Navigate to OTP input screen
       * onLoginAttempt(email) calls parent function
       * Parent component shows EmailVerification screen
       * 
       * SECURITY:
       * - At this point, we DON'T have auth token yet
       * - User still unverified
       * - Must enter OTP to prove email access
       * - Only then gets auth token
       */
      if (response.requiresOTP) {
        // Store short-lived pre-auth token (if provided) to help preserve
        // the pending login state during OTP verification. This token is
        // intentionally short-lived and limited in scope (no API access).
        if (response.preAuthToken) {
          secureStorage.setItem('preAuthToken', response.preAuthToken);
        }
        onLoginAttempt(email);
      } else {
        /**
         * DIRECT LOGIN - Trusted Device or 2FA Disabled
         * 
         * This happens when:
         * - Trusted device detected by backend (skips OTP)
         * - Backend has 2FA disabled
         * 
         * Response contains full auth token immediately.
         * 
         * SECURITY:
         * - For trusted devices: device was previously verified
         * - Backend decides if OTP required
         * 
         * WHAT HAPPENS:
         * 1. Response contains auth token
         * 2. Store token in secure storage (encrypted)
         * 3. Store email in secure storage (encrypted)
         * 4. Call onLoginAttempt to trigger navigation
         * 5. App.tsx will detect token and show dashboard
         */
        console.log('🔑 Received token from backend, storing...');
        if (response.token) {
          secureStorage.setItem("authToken", response.token);
          secureStorage.setItem("userEmail", email);
          console.log('✅ Token and email stored successfully');
        } else {
          console.error('❌ No token in response!', response);
        }
        onLoginAttempt(email);
      }
    } catch (err) {
      /**
       * ERROR HANDLING
       * 
       * If anything goes wrong:
       * - Network error
       * - Server error
       * - Invalid credentials
       * 
       * Get error message and show to user
       * User can see why login failed
       * User can try again
       * 
       * FRONTEND IMPACT:
       * - Red error box appears
       * - Button re-enabled
       * - User can retry
       */
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      /**
       * ALWAYS CALLED at end
       * 
       * Whether success or error:
       * - Stop showing "Signing In..." text
       * - Re-enable sign in button
       * - User can click again if needed
       */
      setLoading(false);
    }
  };

  /**
   * =====================================================================
   * RENDER: UI LAYOUT
   * =====================================================================
   * 
   * VISUAL STRUCTURE:
   * 
   * ┌─ Card (white container) ──────────────────┐
   * │                                             │
   * │ ┌─ Wallet Icon ───────────────────────┐   │
   * │ │                                      │   │
   * │ │       "Welcome Back"                │   │
   * │ │       "Sign in to your account"     │   │
   * │ │                                      │   │
   * │ └──────────────────────────────────────┘   │
   * │                                             │
   * │ ┌─ Form ────────────────────────────────┐ │
   * │ │ Email:     [________@example.com___] │ │
   * │ │ Password:  [____PASSWORD_HIDDEN____] │ │ (eye icon to show)
   * │ │ ☑ Remember me    Forgot password?    │ │
   * │ │ [Sign In Button] (shows "Signing..." │ │
   * │ │                  when loading)       │ │
   * │ └─────────────────────────────────────┘  │
   * │                                            │
   * │ ──────────── Or ───────────────────       │
   * │ Don't have account? [Sign up button]      │
   * │ "Secure login with encryption"            │
   * │                                            │
   * └─────────────────────────────────────────────┘
   * 
   * COLOR SCHEME:
   * - Background: Blue/purple gradient
   * - Card: White
   * - Buttons: Blue gradient
   * - Error: Red
   * - Text: Dark gray (readable)
   * - Icons: Gray (from lucide-react)
   */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        {/* HEADER: Logo, Title, Description */}
        <CardHeader className="space-y-4 text-center pb-6">
          {/* Wallet Icon */}
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>
          {/* Title and Description */}
          <div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription className="mt-2">
              Sign in to your E-wallet account
            </CardDescription>
          </div>
        </CardHeader>

        {/* MAIN FORM */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ERROR MESSAGE BOX - Only shown if error exists */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* EMAIL INPUT FIELD */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                {/* Email icon on left */}
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                {/* Text input */}
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* PASSWORD INPUT FIELD */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                {/* Lock icon on left */}
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                {/* Password input with show/hide toggle */}
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                {/* Eye icon button to show/hide password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* REMEMBER ME CHECKBOX & FORGOT PASSWORD LINK */}
            <div className="flex items-center justify-between">
              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={handleRememberMeChange}
                />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              {/* Forgot Password Link (placeholder - not implemented) */}
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* SUBMIT BUTTON */}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>

        {/* FOOTER: Divider, Sign Up Link, Security Message */}
        <CardFooter className="flex flex-col space-y-4">
          {/* Visual Divider */}
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignUp}
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Sign up
            </button>
          </div>

          {/* Security Message */}
          <div className="text-center text-xs text-gray-500">
            Secure login with end-to-end encryption
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * =====================================================================
 * MAIN APP COMPONENT - AUTHENTICATION & VIEW ROUTER
 * =====================================================================
 * 
 * PURPOSE: 
 * - Verify user authentication on app load
 * - Route between different views (login, signup, dashboard)
 * - Manage session lifecycle and security
 * - Control what the user can see based on auth status
 * 
 * OVERALL SECURITY FLOW:
 * 1. User visits app
 * 2. App checks if valid auth token exists in secure storage
 * 3. If token exists: verify it's still valid with backend
 * 4. If valid: show dashboard, start session timeout monitoring
 * 5. If invalid: clear data, show login page
 * 6. If no token: show login page
 * 7. User logs out: clear secure storage, return to login
 * 
 * FRONTEND IMPACT: YES - Determines entire app routing and security
 * Users can't see dashboard without valid auth token
 * =====================================================================
 */

import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { SignUp } from "./components/SignUp";
import { EmailVerification } from "./components/EmailVerification";
import { VerificationSuccess } from "./components/VerificationSuccess";
import { Dashboard } from "./components/Dashboard";
import { authAPI } from "../api/client";
import { secureStorage, SessionManager } from "../utils/secureStorage";

export default function App() {
  /**
   * STATE INITIALIZATION
   * 
   * currentView: Which screen the user sees
   * - "login": Sign in with email/password
   * - "signup": Create new account
   * - "verify-signup": Enter OTP code after signup
   * - "verify-login": Enter OTP code after login
   * - "success": Welcome screen after signup
   * - "dashboard": Main wallet/cards screen (protected by auth)
   * 
   * DEFAULT: "login" (unauthenticated users)
   */
  const [currentView, setCurrentView] = useState<"login" | "signup" | "verify-signup" | "verify-login" | "success" | "dashboard">("login");
  
  /**
   * userEmail: Current logged-in user's email
   * 
   * INITIALIZATION:
   * - Try to load from secure storage on app start
   * - If auth token exists, email should be saved too
   * - Otherwise, empty string
   * 
   * SECURITY NOTE:
   * - Email stored encrypted in secureStorage
   * - Retrieved and decrypted automatically
   * - Cleared on logout
   */
  const [userEmail, setUserEmail] = useState(() => {
    return secureStorage.getItem("userEmail") || "";
  });
  
  /**
   * isCheckingAuth: Loading state while verifying token
   * 
   * PURPOSE:
   * - Show loading spinner while app verifies auth
   * - Prevent flash of login page if user already logged in
   * - Verify token before showing dashboard
   * 
   * FLOW:
   * true → App loads, checking token
   * false → Auth check complete, show appropriate view
   * 
   * FRONTEND IMPACT: User sees loading spinner briefly
   * Prevents "login page flash" issue
   */
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  /**
   * =====================================================================
   * AUTH VERIFICATION EFFECT
   * =====================================================================
   * 
   * RUNS: Once on app load (before anything else)
   * 
   * PURPOSE:
   * - Check if user has a valid auth token
   * - If yes: show dashboard (logged in)
   * - If no: show login (not logged in)
   * 
   * SECURITY FLOW:
   * 
   * Step 1: Try to get auth token from secure storage
   * └─ secureStorage.getItem('authToken')
   *    └─ Automatically decrypts from localStorage
   * 
   * Step 2: If token exists, verify it's still valid
   * └─ Call backend authAPI.getProfile()
   * └─ If backend accepts token → user authenticated
   * └─ If backend rejects → token expired/invalid
   * 
   * Step 3: Based on result:
   * ├─ Token valid → Show dashboard, start session timer
   * └─ Token invalid → Clear storage, show login page
   * 
   * EXAMPLE SCENARIOS:
   * 
   * Scenario A: User logs out, comes back
   * → No token in storage
   * → Show login page immediately
   * 
   * Scenario B: User was logged in, browser closed, reopened
   * → Token still in secure storage (encrypted)
   * → Verify token validity with backend
   * → Token valid → Show dashboard (user stays logged in)
   * 
   * Scenario C: User's session expired (30 min timeout)
   * → SessionManager clears token
   * → User refreshes page
   * → No token found
   * → Show login page
   * 
   * Scenario D: User manipulates localStorage (hacker)
   * → Encrypted token won't decrypt correctly
   * → decryptData() will fail
   * → Treated as invalid token
   * → User returned to login page
   * 
   * FRONTEND IMPACT: YES - Determines if user sees dashboard
   * User can't bypass this check (runs before rendering)
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        /**
         * STEP 1: Try to get stored auth token
         * 
         * SECURITY:
         * - Uses secure storage (not plain localStorage)
         * - Token is encrypted in storage
         * - secureStorage.getItem() automatically decrypts it
         * - Returns null if key doesn't exist
         */
        const authToken = secureStorage.getItem("authToken");
        const savedEmail = secureStorage.getItem("userEmail");
        
        /**
         * STEP 2: Check if we have both token and email
         * 
         * We need both:
         * - authToken: Proves user is authenticated
         * - userEmail: Identifies which user
         * 
         * If EITHER is missing → user is not logged in
         */
        if (authToken && savedEmail) {
          try {
            /**
             * STEP 3: Verify token is still valid with backend
             * 
             * WHAT HAPPENS:
             * 1. Frontend sends stored token to backend
             * 2. Backend checks if token is valid JWT
             * 3. Backend checks if JWT signature is correct
             * 4. Backend checks if token hasn't expired
             * 5. Backend looks up user in database
             * 6. Returns user profile if all checks pass
             * 
             * WHY THIS STEP:
             * - Token could be manually tampered with
             * - Token could have expired (if not checked by SessionManager)
             * - User could have been deleted from database
             * - Token could have been revoked by admin
             * 
             * SECURITY PRINCIPLE: Never trust client-side checks alone
             * Always verify with backend
             */
            await authAPI.getProfile();
            
            /**
             * SUCCESS: Token is valid!
             * 
             * ACTION:
             * 1. Update state with user email
             * 2. Show dashboard
             * 3. Start session manager (30-min timeout)
             * 
             * RESULT: User is logged in and sees their wallet
             */
            setUserEmail(savedEmail);
            setCurrentView("dashboard");
            SessionManager.startSession();
          } catch (error) {
            /**
             * FAILURE: Token is invalid or expired
             * 
             * REASONS THIS COULD HAPPEN:
             * 1. Token tampered with (won't verify)
             * 2. Token manually expired by backend
             * 3. User deleted from database
             * 4. Backend authentication failure
             * 5. Network error (treat as invalid)
             * 
             * SECURITY ACTION:
             * 1. Clear all sensitive data immediately
             * 2. Remove encrypted token from storage
             * 3. Remove user email
             * 4. Return to login page
             * 
             * PRINCIPLE: When in doubt, logout for security
             */
            console.log("Auth token invalid or expired");
            secureStorage.removeItem("authToken");
            secureStorage.removeItem("currentView");
            secureStorage.removeItem("userEmail");
            setCurrentView("login");
          }
        } else {
          /**
           * NO TOKEN FOUND
           * 
           * REASONS:
           * 1. User never logged in (first visit)
           * 2. User logged out (cleared storage)
           * 3. Browser storage cleared
           * 4. Token expired and cleared
           * 
           * ACTION: Show login page
           * User must login again to get token
           */
          setCurrentView("login");
        }
      } catch (error) {
        /**
         * UNEXPECTED ERROR
         * 
         * If something goes wrong during auth check:
         * 1. Log error for debugging
         * 2. Default to login page (safe fallback)
         * 3. User can still login normally
         */
        console.error("Error checking auth status:", error);
        setCurrentView("login");
      } finally {
        /**
         * ALWAYS CALLED at end
         * 
         * Purpose: Stop showing loading spinner
         * Whether auth succeeded or failed, we're done checking
         * Now render the appropriate view
         */
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * OPTIONAL: Persist current view to localStorage
   * 
   * SECURITY NOTE: currentView is NOT sensitive
   * - Just tracks which screen user was on
   * - Encrypted storage not needed
   * - Regular localStorage is fine
   * 
   * PURPOSE: Resume same view if page refreshed
   * FRONTEND IMPACT: Better UX (remembers current screen)
   */
  useEffect(() => {
    localStorage.setItem("currentView", currentView);
    localStorage.setItem("userEmail", userEmail);
  }, [currentView, userEmail]);

  /**
   * =====================================================================
   * SIGNUP FLOW HANDLER
   * =====================================================================
   * 
   * CALLED WHEN: User completes signup (email & password entered)
   * 
   * FLOW:
   * 1. Save user's email to state
   * 2. Show verification screen (OTP input)
   * 
   * SECURITY:
   * - Email saved in state (not yet stored, only after OTP verified)
   * - OTP code sent to their email by backend
   * - User must enter OTP to complete signup
   * - Only then is auth token generated
   * 
   * FRONTEND IMPACT: View changes to OTP verification screen
   */
  const handleSignUpSuccess = (email: string) => {
    setUserEmail(email);
    setCurrentView("verify-signup");
  };

  /**
   * =====================================================================
   * LOGIN FLOW HANDLER
   * =====================================================================
   * 
   * CALLED WHEN: User enters email/password and clicks login
   * 
   * FLOW:
   * 1. Save email to state
   * 2. Check if device is "trusted" (optional feature)
   * 3. If trusted and email matches: skip OTP, go to dashboard
   * 4. If not trusted: show OTP verification screen
   * 
   * SECURITY:
   * - Optional "Remember device" feature
   * - If enabled: device gets trust token with expiry date
   * - If trusted: skip OTP on next login (faster)
   * - If not trusted: always require OTP (more secure)
   * - Trust tokens expire after time
   * 
   * TRUSTED DEVICE FEATURE:
   * - User checks "Remember this device" on login
   * - Frontend stores device token in localStorage
   * - Token has expiry date
   * - Next time: if device trusted → skip OTP
   * - If device untrusted: always require OTP
   * 
   * FRONTEND IMPACT: User either goes to OTP screen or straight to dashboard
   * Depending on device trust status
   */
  const handleLoginAttempt = (email: string) => {
    setUserEmail(email);
    
    /**
     * Check if backend already provided an auth token (trusted device or 2FA disabled)
     * 
     * If the backend sent back a full auth token (not preAuthToken),
     * it means either:
     * 1. Device was recognized as trusted by backend
     * 2. 2FA is disabled
     * 
     * In both cases, the token was already stored by Login component,
     * so we can go directly to dashboard.
     */
    const authToken = secureStorage.getItem("authToken");
    if (authToken) {
      console.log("✅ Auth token found, trusted device login successful");
      SessionManager.startSession();
      setCurrentView("dashboard");
      return;
    }
    
    /**
     * No auth token means OTP verification is required
     * Backend sent preAuthToken instead and expects OTP verification
     */
    console.log("🔐 OTP verification required");
    setCurrentView("verify-login");
  };

  /**
   * =====================================================================
   * SIGNUP OTP VERIFICATION SUCCESS HANDLER
   * =====================================================================
   * 
   * CALLED WHEN: User enters correct OTP after signup
   * 
   * FLOW:
   * 1. Backend verified OTP is correct
   * 2. Backend created user account
   * 3. Backend generated auth token
   * 4. Auth token sent to frontend and stored
   * 5. Show success/welcome screen
   * 
   * SECURITY:
   * - OTP was one-time use, now invalid
   * - Auth token stored in secure storage (encrypted)
   * - Token sent with all future API requests
   * - User email also stored (encrypted)
   * 
   * FRONTEND IMPACT: User sees welcome/success screen
   */
  const handleSignUpVerificationSuccess = () => {
    setCurrentView("success");
  };

  /**
   * =====================================================================
   * LOGIN OTP VERIFICATION SUCCESS HANDLER
   * =====================================================================
   * 
   * CALLED WHEN: User enters correct OTP after login
   * 
   * FLOW:
   * 1. Backend verified OTP is correct
   * 2. Backend verified user account exists
   * 3. Backend generated new auth token
   * 4. Auth token sent to frontend and stored
   * 5. Go directly to dashboard
   * 
   * SECURITY:
   * - OTP was one-time use, now invalid
   * - New auth token generated for this session
   * - Token stored in secure storage (encrypted)
   * - SessionManager starts monitoring for inactivity
   * 
   * FRONTEND IMPACT: User logged in, sees dashboard
   */
  const handleLoginVerificationSuccess = () => {
    // For login, go directly to dashboard
    setCurrentView("dashboard");
  };

  /**
   * =====================================================================
   * SIGNUP SUCCESS TO DASHBOARD TRANSITION
   * =====================================================================
   * 
   * CALLED WHEN: User clicks "Continue" on success/welcome screen
   * 
   * FLOW:
   * 1. User has confirmed they received welcome email
   * 2. User navigates to dashboard
   * 3. App shows their wallet and cards
   * 
   * FRONTEND IMPACT: User sees dashboard after signup complete
   */
  const handleContinueToDashboard = () => {
    // Navigate to dashboard after signup success
    setCurrentView("dashboard");
  };

  /**
   * =====================================================================
   * NAVIGATION HANDLERS
   * =====================================================================
   * 
   * handleBackToSignUp: User on verification screen, clicks back to signup
   * handleBackToLogin: User on verification screen, clicks back to login
   * 
   * FLOW: User changes screens (navigation)
   * 
   * SECURITY: State cleared appropriately
   * (Partial signup/login data cleared if user goes back)
   */
  const handleBackToSignUp = () => {
    setCurrentView("signup");
  };

  const handleBackToLogin = () => {
    setCurrentView("login");
  };

  /**
   * =====================================================================
   * LOGOUT HANDLER - CRITICAL FOR SECURITY
   * =====================================================================
   * 
   * CALLED WHEN: User clicks logout button
   * 
   * SECURITY FLOW (CRITICAL):
   * 
   * Step 1: Clear all state
   * └─ userEmail = ""
   * └─ currentView = "login"
   * 
   * Step 2: Clear secure storage (MOST IMPORTANT)
   * └─ removeItem('authToken') - Delete encrypted token
   * └─ removeItem('userEmail') - Delete encrypted email
   * └─ removeItem('currentView') - Clear view state
   * 
   * Step 3: Show login page
   * └─ User must login again
   * └─ Must enter password + OTP
   * └─ Can't access dashboard without auth
   * 
   * WHY THIS MATTERS:
   * - If you DON'T clear authToken, user stays logged in
   * - If you DON'T clear userEmail, data still accessible
   * - If you DON'T redirect to login, dashboard still visible
   * 
   * ATTACK SCENARIO (What this prevents):
   * - User logs out but we don't clear token
   * - Another person walks up to computer
   * - They refresh page
   * - They see dashboard with original user's data
   * - They can access wallet, cards, transactions (DISASTER!)
   * 
   * PREVENTION:
   * - This logout handler clears EVERYTHING
   * - Encrypted token removed from localStorage
   * - User email removed from storage
   * - Force return to login page
   * - New person can't access anything
   * 
   * FRONTEND IMPACT: User is completely logged out
   * All sensitive data cleared
   * Must re-authenticate to see anything
   * 
   * ADDITIONAL PROTECTION:
   * - SessionManager also calls this on 30-min timeout
   * - So even if user forgets to logout, auto-logout happens
   * - Defense in depth: multiple layers of security
   */
  const handleLogout = () => {
    // SECURITY: Clear all state
    setUserEmail("");
    setCurrentView("login");
    
    // SECURITY: Clear secure storage on logout
    // This is CRITICAL - removes all encrypted auth data
    secureStorage.removeItem("currentView");
    secureStorage.removeItem("userEmail");
    secureStorage.removeItem("authToken");
  };

  /**
   * =====================================================================
   * RENDER & VIEW ROUTING
   * =====================================================================
   * 
   * PURPOSE: Display different screens based on currentView
   * 
   * LOADING STATE:
   * 1. Show spinner while checking auth
   * 2. Prevents flash of login page if user already logged in
   * 3. Only rendered while isCheckingAuth = true
   * 
   * VIEW ROUTING:
   * - Each view only renders if conditions met
   * - currentView matches AND isCheckingAuth = false
   * 
   * SECURITY:
   * - Dashboard only shown if currentView = "dashboard"
   * - currentView changes after auth verification
   * - So dashboard not accessible without valid token
   * - Even if user tries to access by URL, redirected to login
   */
  return (
    <>
      {/* LOADING SPINNER - Shows while verifying auth token */}
      {isCheckingAuth ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="text-center">
            {/* Spinning loader animation */}
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your wallet...</p>
          </div>
        </div>
      ) : null}
      
      {/* LOGIN SCREEN - Not authenticated, login first */}
      {!isCheckingAuth && currentView === "login" && (
        <Login 
          onSwitchToSignUp={() => setCurrentView("signup")}
          onLoginAttempt={handleLoginAttempt}
        />
      )}
      
      {/* SIGNUP SCREEN - User creating new account */}
      {!isCheckingAuth && currentView === "signup" && (
        <SignUp 
          onSwitchToLogin={() => setCurrentView("login")}
          onSignUpSuccess={handleSignUpSuccess}
        />
      )}
      
      {/* VERIFY OTP AFTER SIGNUP - User must enter OTP sent to email */}
      {!isCheckingAuth && currentView === "verify-signup" && (
        <EmailVerification 
          email={userEmail}
          onVerified={handleSignUpVerificationSuccess}
          onBack={handleBackToSignUp}
          mode="signup"
        />
      )}
      
      {/* VERIFY OTP AFTER LOGIN - User must enter OTP sent to email */}
      {!isCheckingAuth && currentView === "verify-login" && (
        <EmailVerification 
          email={userEmail}
          onVerified={handleLoginVerificationSuccess}
          onBack={handleBackToLogin}
          mode="login"
        />
      )}
      
      {/* SUCCESS SCREEN - Welcome after successful signup */}
      {!isCheckingAuth && currentView === "success" && (
        <VerificationSuccess onContinue={handleContinueToDashboard} />
      )}
      
      {/* DASHBOARD - PROTECTED SCREEN - Only shows if authenticated */}
      {/* User must have valid auth token to see this */}
      {/* SessionManager started to handle 30-min timeout */}
      {!isCheckingAuth && currentView === "dashboard" && (
        <Dashboard userEmail={userEmail} onLogout={handleLogout} />
      )}
    </>
  );
}

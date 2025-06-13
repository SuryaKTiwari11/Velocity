/**
 * This file re-exports functionality from specific controllers
 * for backward compatibility. You should import directly from
 * the specific controllers for new code.
 */

// Auth controller exports
import { signUp, login, logout, getCurrentUser } from "./auth.controller.js";

// SSO Auth controller exports
import {
  googleAuthCallback,
  githubAuthCallback,
  authSuccess,
} from "./ssoAuth.controller.js";

// Password controller exports
import {
  sendEmailOTP as otp,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "./password.controller.js";
// Re-export all for backward compatibility
export {
  signUp,
  login,
  logout,
  getCurrentUser,
  otp,
  googleAuthCallback,
  githubAuthCallback,
  authSuccess,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};

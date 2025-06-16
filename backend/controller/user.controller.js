import { signUp, login, logout, getCurrentUser } from "./auth.controller.js";
import { handleCallback, authSuccess } from "./ssoAuth.controller.js";
import {
  sendEmailOTP as otp,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "./password.controller.js";

export {
  signUp,
  login,
  logout,
  getCurrentUser,
  otp,
  handleCallback,
  authSuccess,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};

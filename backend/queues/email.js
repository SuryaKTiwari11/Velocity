import { emailQ, JOBS } from "./simple.js";
import { checkEmailIdempotency } from "../utils/idempotency.js";

// Add OTP verification email to queue
export const addOTP = async (email, otp, name = "User") => {
  try {
    // Check if OTP was sent recently
    const idempotencyCheck = await checkEmailIdempotency(email, "otp", 2);

    if (!idempotencyCheck.allowed) {
      return {
        success: false,
        error: "OTP already sent recently. Wait 2 minutes.",
      };
    }

    const job = await emailQ.add(
      JOBS.OTP,
      { email, otp, name },
      { priority: 10 }
    );

    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("Failed to queue OTP:", error);
    return { success: false, error: error.message };
  }
};

// Add password reset email to queue
export const addReset = async (email, otp, name = "User") => {
  try {
    // Check if reset email was sent recently
    const idempotencyCheck = await checkEmailIdempotency(email, "reset", 5);

    if (!idempotencyCheck.allowed) {
      return {
        success: false,
        error: "Reset email already sent recently. Wait 5 minutes.",
      };
    }

    const job = await emailQ.add(
      JOBS.RESET,
      { email, otp, name },
      { priority: 10 }
    );

    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("Failed to queue reset:", error);
    return { success: false, error: error.message };
  }
};

// Add company invitation email to queue
export const addInvite = async (
  email,
  inviteToken,
  companyId,
  name = "User"
) => {
  try {
    // Check if invite was sent recently
    const idempotencyCheck = await checkEmailIdempotency(email, "invite", 10);

    if (!idempotencyCheck.allowed) {
      return {
        success: false,
        error: "Invite email already sent recently. Wait 10 minutes.",
      };
    }

    const job = await emailQ.add(
      JOBS.INVITE,
      { email, inviteToken, companyId, name },
      { priority: 8 }
    );

    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("Failed to queue invite:", error);
    return { success: false, error: error.message };
  }
};

// Get email queue statistics
export const getStats = async () => {
  try {
    const waiting = await emailQ.getWaiting();
    const active = await emailQ.getActive();
    const completed = await emailQ.getCompleted();
    const failed = await emailQ.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  } catch (error) {
    console.error("Failed to get email queue stats:", error);
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      error: error.message,
    };
  }
};

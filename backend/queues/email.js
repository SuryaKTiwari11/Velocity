import { emailQ, JOBS } from "./simple.js";

export const addOTP = async (email, otp, name = "User") => {
  try {
    const job = await emailQ.add(
      JOBS.OTP,
      { email, otp, name },
      { priority: 10 }
    );
    // OTP queued
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("Failed to queue OTP:", error);
    return { success: false, error: error.message };
  }
};

export const addReset = async (email, otp, name = "User") => {
  try {
    const job = await emailQ.add(
      JOBS.RESET,
      { email, otp, name },
      { priority: 10 }
    );
    // Reset queued
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("Failed to queue reset:", error);
    return { success: false, error: error.message };
  }
};

export const addWelcome = async (email, name) => {
  try {
    const job = await emailQ.add(
      JOBS.WELCOME,
      { email, name },
      {
        priority: 5,
        delay: 5000,
      }
    );
    // Welcome queued
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("Failed to queue welcome:", error);
    return { success: false, error: error.message };
  }
};

export const addNotify = async (email, subject, message, name = "User") => {
  try {
    const job = await emailQ.add(
      JOBS.NOTIFY,
      { email, subject, message, name },
      { priority: 3 }
    );
    // Notification queued
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("Failed to queue notification:", error);
    return { success: false, error: error.message };
  }
};

export const addInvite = async (email, inviteToken, companyId) => {
  try {
    const job = await emailQ.add(
      JOBS.INVITE,
      { email, inviteToken, companyId },
      { priority: 1 }
    );
    // Invite queued
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("Failed to queue invite:", error);
    return { success: false, error: error.message };
  }
};
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
    console.error("Failed to get stats:", error);
    return null;
  }
};

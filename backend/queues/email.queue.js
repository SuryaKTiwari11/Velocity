const EMAIL_JOB_TYPE = {
  OTP: "otpEmail",
  PASSWORD_RESET: "passwordReset",
};
const priority = (jobType) => {
  switch (jobType) {
    case EMAIL_JOB_TYPE.OTP:
      return 1;
    case EMAIL_JOB_TYPE.PASSWORD_RESET:
      return 2;
    default:
      return 3;
  }
};

export const sendEmail = async (jobType, data) => {
  try {
    const job = await emailQueue.add(jobType, data, {
      priority: priority(jobType),
      attempts: jobType === EMAIL_JOB_TYPE.OTP ? 5 : 3,
      timeout: 30000,
    });
    return job.id;
  } catch (err) {
    console.error(`Error sending email (${jobType}):`, err);
    throw err;
  }
};

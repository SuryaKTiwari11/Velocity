import sequelize from "../configuration/db.js";
import setupAssociations from "./associations.js";
import createUserModel from "./user.model.js";
import createEmployeeModel from "./employee.model.js";
import createOtpModel from "./otp.model.js";
import createDocumentModel from "./document.model.js";
import createS3DocumentModel from "./s3Document.model.js";
import createAuditLogModel from "./AuditLog.model.js";
import createLoginHistoryModel from "./LoginHistory.model.js";
import createAttendanceModel from "./Attendance.model.js";
import createVideoProgressModel from "./videoProgress.model.js";
import createInvite from "./invite.model.js";
import createCompany from "./company.model.js";
 import createPaymentModel from "./payment.model.js"; // Uncomment if needed
const User = createUserModel(sequelize);
const Employee = createEmployeeModel(sequelize);
const OTP = createOtpModel(sequelize);
const Document = createDocumentModel(sequelize);
const S3Document = createS3DocumentModel(sequelize);
const VideoProgress = createVideoProgressModel(sequelize);
const AuditLog = createAuditLogModel(sequelize);
const LoginHistory = createLoginHistoryModel(sequelize);
const Attendance = createAttendanceModel(sequelize);
const Company = createCompany(sequelize);
const Invite = createInvite(sequelize);
const Payment = createPaymentModel(sequelize); // Uncomment if needed
const models = {
  User,
  Employee,
  OTP,
  Document,
  S3Document,
  AuditLog,
  LoginHistory,
  Attendance,
  VideoProgress,
  Company,
  Invite,
  Payment
};
setupAssociations(models);

export {
  User,
  Employee,
  OTP,
  Document,
  S3Document,
  AuditLog,
  LoginHistory,
  Attendance,
  VideoProgress,
  Company,
  Invite,
  Payment
};

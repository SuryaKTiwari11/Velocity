const setupAssociations = (models) => {
  const {
    User,
    Employee,
    OTP,
    Document,
    AuditLog,
    LoginHistory,
    Attendance,
    S3Document,
    VideoProgress,
    Company,
    Invite,
    Payment,
  } = models;
  // Payment associations
  User.hasMany(Payment, { foreignKey: "userId", as: "payments" });
  Payment.belongsTo(User, { foreignKey: "userId", as: "user" });
  Company.hasMany(Payment, { foreignKey: "companyId", as: "payments" });
  Payment.belongsTo(Company, { foreignKey: "companyId", as: "company" });

  // Company associations
  Company.hasMany(Employee, { foreignKey: "companyId", as: "employees" });
  Employee.belongsTo(Company, { foreignKey: "companyId", as: "company" });
  Company.hasMany(User, { foreignKey: "companyId", as: "users" });
  User.belongsTo(Company, { foreignKey: "companyId", as: "company" });

  // User & Employee associations
  User.hasOne(Employee, { foreignKey: "userId", sourceKey: "id" });
  Employee.belongsTo(User, { foreignKey: "userId", targetKey: "id" });

  // OTP associations
  User.hasMany(OTP, { foreignKey: "email", sourceKey: "email" });
  OTP.belongsTo(User, { foreignKey: "email", targetKey: "email" });

  // Document associations
  User.hasMany(Document, { foreignKey: "userId", as: "documents" });
  Document.belongsTo(User, { foreignKey: "userId", as: "owner" });

  // AuditLog & LoginHistory associations
  User.hasMany(AuditLog, { foreignKey: "userId", as: "auditLogs" });
  AuditLog.belongsTo(User, { foreignKey: "userId", as: "user" });
  User.hasMany(LoginHistory, { foreignKey: "userId", as: "loginHistory" });
  LoginHistory.belongsTo(User, { foreignKey: "userId", as: "user" });

  // Attendance associations
  Employee.hasMany(Attendance, { foreignKey: "employeeId" });
  Attendance.belongsTo(Employee, { foreignKey: "employeeId" });
  User.hasMany(Attendance, { foreignKey: "userId" });
  Attendance.belongsTo(User, { foreignKey: "userId" });

  // S3Document associations
  User.hasMany(S3Document, { foreignKey: "userId" });
  S3Document.belongsTo(User, { foreignKey: "userId" });
  Employee.hasMany(S3Document, { foreignKey: "employeeId" });
  S3Document.belongsTo(Employee, { foreignKey: "employeeId" });

  // VideoProgress associations
  User.hasMany(VideoProgress, { foreignKey: "userId" });
  VideoProgress.belongsTo(User, { foreignKey: "userId" });

  // Invite associations
  Company.hasMany(Invite, { foreignKey: "companyId", as: "invites" });
  Invite.belongsTo(Company, { foreignKey: "companyId", as: "company" });
  Invite.belongsTo(User, { foreignKey: "userId", as: "user" });

  Attendance.belongsTo(Company, { foreignKey: "companyId" });
Company.hasMany(Attendance, { foreignKey: "companyId" });

  return models;
};

export default setupAssociations;

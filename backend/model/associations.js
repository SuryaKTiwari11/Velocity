const setupAssociations = (models) => {
  const { User, Employee, OTP, Document } = models;

  User.hasOne(Employee, {
    foreignKey: "email",
    sourceKey: "email",
  });

  Employee.belongsTo(User, {
    foreignKey: "email",
    targetKey: "email",
  });

  User.hasMany(OTP, {
    foreignKey: "email",
    sourceKey: "email",
  });

  OTP.belongsTo(User, {
    foreignKey: "email",
    targetKey: "email",
  });

  
  User.hasMany(Document, {
    foreignKey: "userId",
    as: "documents",
  });

  Document.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  return models;
};

export default setupAssociations;

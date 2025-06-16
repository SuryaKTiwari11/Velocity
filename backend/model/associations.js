const setupAssociations = (models) => {
  const { User, Employee, OTP } = models;

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

  return models;
};

export default setupAssociations;

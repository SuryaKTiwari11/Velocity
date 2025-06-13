import { Sequelize } from "sequelize";

/**
 * Sets up associations between database models
 * @param {Object} models - Object containing all initialized models
 * @returns {Object} The same models object with associations set up
 */
const setupAssociations = (models) => {
  const { User, Employee, OTP } = models;

  // User-Employee relationship using email as connection
  User.hasOne(Employee, {
    foreignKey: "email",
    sourceKey: "email",
    as: "employeeInfo",
  });

  Employee.belongsTo(User, {
    foreignKey: "email",
    targetKey: "email",
    as: "userAccount",
  });

  // User-OTP relationship (one user can have many OTPs)
  User.hasMany(OTP, {
    foreignKey: "email",
    sourceKey: "email",
    as: "otps",
  });

  OTP.belongsTo(User, {
    foreignKey: "email",
    targetKey: "email",
    as: "user",
  });

  // Return the models with associations set up
  return models;
};

export default setupAssociations;

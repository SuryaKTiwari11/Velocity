import sequelize from "../configuration/db.js";
import setupAssociations from "./associations.js";
import createUserModel from "./user.model.js";
import createEmployeeModel from "./employee.model.js";
import createOtpModel from "./otp.model.js";

/**
 * Initializes all database models with the same sequelize instance
 * @returns {Object} Object containing all initialized models
 */
const initializeModels = () => {
  // Create all models
  const User = createUserModel(sequelize);
  const Employee = createEmployeeModel(sequelize);
  const OTP = createOtpModel(sequelize);

  // Collect models in a single object
  const models = { User, Employee, OTP };
  // Set up associations between models
  setupAssociations(models);

  return models;
};

// Initialize models and export function
export { initializeModels };

// Also export initialized models as default for backward compatibility
const models = initializeModels();
export const { User, Employee, OTP } = models;
export default models;

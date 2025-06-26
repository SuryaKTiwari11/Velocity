import sequelize from "../configuration/db.js";
import setupAssociations from "./associations.js";
import createUserModel from "./user.model.js";
import createEmployeeModel from "./employee.model.js";
import createOtpModel from "./otp.model.js";
import createDocumentModel from "./document.model.js";

const User = createUserModel(sequelize);
const Employee = createEmployeeModel(sequelize);
const OTP = createOtpModel(sequelize);
const Document = createDocumentModel(sequelize);

const models = { User, Employee, OTP, Document };
setupAssociations(models);

export { User, Employee, OTP, Document };

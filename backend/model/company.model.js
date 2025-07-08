import { DataTypes, ENUM } from "sequelize";

const createCompany = (sequelize) => {
  const Company = sequelize.define(
    "company",
    {
      companyId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      companyCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      companyPlan: {
        type: DataTypes.STRING(50),
        ENUM: ["free", "premium", "enterprise"],
        allowNull: false,
        defaultValue: "free",
      },
      maxEmployees: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
    },
    {
      tableName: "companies",
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Company;
};

export default createCompany;

//TODO ADD COMPANY ID TO THE EMPLOYEES TABLE
//TODO ADD FOREIGN KEY CONSTRAINTS TO THE EMPLOYEES TABLE   
//!GIVE ME COMANDS THAT I NEED TO RUN IN THE POSTGRESQL DATABASE
//TODO CONNECT USERS TO COMPANY 
//TODO FK_CONSTRAINTS TO THE USERS TABLE

// SET UP ASSOCIATIONS

//! THESE CAN BE WRONG , CAN HAVE DIFERENT VARIABLES NAME
// models/index.js - Add relationships
// export const setupAssociations = (db) => {
//   // Company has many employees
//   db.Company.hasMany(db.Employee, { foreignKey: "company_id" });
//   db.Employee.belongsTo(db.Company, { foreignKey: "company_id" });

//   // Company has many users
//   db.Company.hasMany(db.User, { foreignKey: "company_id" });
//   db.User.belongsTo(db.Company, { foreignKey: "company_id" });
// };
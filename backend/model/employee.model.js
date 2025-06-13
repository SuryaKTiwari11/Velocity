import { DataTypes } from "sequelize";

/**
 * Creates and initializes the Employee model
 * @param {import('sequelize').Sequelize} sequelize - The Sequelize instance
 * @returns {import('sequelize').Model} The initialized Employee model
 */
const createEmployeeModel = (sequelize) => {
  const Employee = sequelize.define(
    "Employee",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      position: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      salary: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: "employees",
      freezeTableName: true,
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
      ],
    }
  );

  return Employee;
};

export default createEmployeeModel;

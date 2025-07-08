import { DataTypes } from "sequelize";

const createLoginHistoryModel = (sequelize) => {
  const LoginHistory = sequelize.define(
    "LoginHistory",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "users", key: "id" },
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "companies", key: "companyId" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      success: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING(45),
      },
      failure_reason: {
        type: DataTypes.STRING(255),
      },
    },
    {
      tableName: "login_history",
      freezeTableName: true,
      timestamps: true,
      createdAt: "login_time",
      updatedAt: false,
    }
  );

  return LoginHistory;
};

export default createLoginHistoryModel;

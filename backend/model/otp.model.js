import { DataTypes } from "sequelize";

const createOtpModel = (sequelize) => {
  const Otp = sequelize.define(
    "OTP",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => {
          return new Date(Date.now() + 10 * 60 * 1000);
        },
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      purpose: {
        type: DataTypes.STRING,
        defaultValue: "email_verification", // Can be "email_verification" or "password_reset"
        allowNull: false,
      },
    },
    {
      tableName: "otp",
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Otp;
};

export default createOtpModel;

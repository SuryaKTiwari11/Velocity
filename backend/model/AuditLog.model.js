import { DataTypes } from "sequelize";

const createAuditLogModel = (sequelize) => {
  const AuditLog = sequelize.define(
    "AuditLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      tableName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      recordId: {
        type: DataTypes.INTEGER,
      },
      oldData: {
        type: DataTypes.TEXT,
      },
      newData: {
        type: DataTypes.TEXT,
      },
      ipAddress: {
        type: DataTypes.STRING(45),
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "companies",
          key: "id",
        },
      },
    },
    {
      tableName: "audit_logs",
      freezeTableName: true,
      timestamps: true,
      updatedAt: false, // Only need createdAt
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["tableName"],
        },
        {
          fields: ["companyId"],
        },
      ],
    }
  );

  return AuditLog;
};

export default createAuditLogModel;

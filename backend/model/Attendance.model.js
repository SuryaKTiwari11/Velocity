import { DataTypes } from "sequelize";

const createAttendanceModel = (sequelize) => {
  const Attendance = sequelize.define(
    "Attendance",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "employees",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      clockInTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "Automatic login time",
      },
      clockOutTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Automatic logout time",
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      totalHours: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        defaultValue: 0,
        comment: "Calculated hours worked",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "True if user is currently logged in",
      },
      sessionId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Track user session for logout detection",
      },
      status: {
        type: DataTypes.ENUM("present", "absent", "late", "half-day"),
        allowNull: false,
        defaultValue: "present",
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "companies",
          key: "companyId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "attendances",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["userId", "date"],
          name: "unique_user_date_attendance",
        },
        {
          fields: ["employeeId"],
        },
        {
          fields: ["date"],
        },
        {
          fields: ["status"],
        },
      ],
    }
  );

  return Attendance;
};

export default createAttendanceModel;

import { DataTypes } from "sequelize";
const createDocumentModel = (sequelize) => {
  const Document = sequelize.define(
    "Document",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      documentType: {
        type: DataTypes.ENUM("resume", "certificate", "id_proof", "other"),
        allowNull: false,
        defaultValue: "resume",
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("uploaded", "processed", "error"),
        defaultValue: "uploaded",
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
      timestamps: true,
      tableName: "documents",
      freezeTableName: true,
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["originalName"],
        },
      ],
    }
  );

  return Document;
};

export default createDocumentModel;

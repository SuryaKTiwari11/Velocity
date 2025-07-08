import { DataTypes } from "sequelize";

const createS3DocumentModel = (sequelize) => {
  const S3Document = sequelize.define(
    "S3Document",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      type: {
        type: DataTypes.ENUM(
          "resume",
          "certificate",
          "id_proof",
          "address_proof",
          "contract",
          "other"
        ),
        defaultValue: "other",
      },
      s3Key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: "S3 object key for the document",
      },
      s3Bucket: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "S3 bucket name",
      },
      fileSize: {
        type: DataTypes.INTEGER,
        comment: "File size in bytes",
      },
      mimeType: {
        type: DataTypes.STRING,
        comment: "MIME type of the file",
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Original file name",
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Stored file name",
      },
      s3Url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Full S3 URL for the document",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID of the user who owns this document",
      },
      employeeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID of the employee who owns this document",
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      uploadedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID of the admin who approved/rejected",
      },
      reviewNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Admin feedback notes",
      },
      reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: "s3_documents",
      freezeTableName: true,
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["employeeId"],
        },
        {
          fields: ["type"],
        },
        {
          fields: ["status"],
        },
        {
          unique: true,
          fields: ["s3Key"],
        },
      ],
    }
  );

  // Instance methods for working with S3
  S3Document.prototype.getDownloadUrl = async function () {
    const s3Service = (await import("../services/s3Doc.service.js")).default;
    return s3Service.getDownloadUrl(this.s3Key);
  };

  S3Document.prototype.deleteFromS3 = async function () {
    const s3Service = (await import("../services/s3Doc.service.js")).default;
    await s3Service.deleteDocument(this.s3Key);
  };

  // Static methods
  S3Document.findByEmployee = function (employeeId) {
    return this.findAll({
      where: { employeeId },
      order: [["uploadedAt", "DESC"]],
    });
  };

  S3Document.findByType = function (type, employeeId = null) {
    const where = { type };
    if (employeeId) where.employeeId = employeeId;

    return this.findAll({
      where,
      order: [["uploadedAt", "DESC"]],
    });
  };

  return S3Document;
};

export default createS3DocumentModel;

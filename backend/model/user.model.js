import { DataTypes } from "sequelize";
const createUserModel = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      githubId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:
          "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      }, //!https://docs.gravatar.com/sdk/images/
      isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      premiumExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "User city (from predefined list of Indian cities)",
      },
      isTrainingVideoDone: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      videoProgress: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: "JSON (tracks watched videos)",
      },
      isDocumentSubmitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isDocumentsApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      onboardingStatus: {
        type: DataTypes.ENUM(
          'pending',
          'video_training',
          'document_submission',
          'under_review',
          'approved',
          'rejected'
        ),
        defaultValue: 'pending',
      },
    },
    {
      timestamps: true,
      tableName: "users",
      freezeTableName: true,
    }
  );

  return User;
};
export default createUserModel;

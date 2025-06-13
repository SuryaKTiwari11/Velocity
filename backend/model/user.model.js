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

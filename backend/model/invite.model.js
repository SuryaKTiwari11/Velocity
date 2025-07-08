import { DataTypes, ENUM } from "sequelize";

const createInvite = (sequelize) => {
  const Invite = sequelize.define(
    "invite",
    {
      inviteId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      inviteToken: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "invites",
      freezeTableName: true,
      timestamps: true,
    }
  );

  return Invite;
};

export default createInvite;

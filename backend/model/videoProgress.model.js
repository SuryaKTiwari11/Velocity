import { DataTypes } from "sequelize";

const createVideoProgressModel = (sequelize) => {
    const VideoProgress = sequelize.define(
        "VideoProgress",
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
            videoId: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            watchedDuration: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            totalDuration: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            isCompleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            watchedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            timestamps: true,
            tableName: "videoProgress",
            freezeTableName: true,
        }
    );

    return VideoProgress;
};

export default createVideoProgressModel;

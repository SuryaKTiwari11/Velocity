import { Sequelize } from "sequelize";
import { Client } from "pg";
import { configDotenv } from "dotenv";
configDotenv();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const testConn = async () => {
  try {
    await sequelize.authenticate();
    // Database connected
    return true;
  } catch (error) {
    console.error("couldn't connect:", error);
    return false;
  }
};

export const createDB = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres",
  });

  try {
    await client.connect();
    const ans = await client.query(
      `SELECT FROM pg_database WHERE datname = $1;`,
      [process.env.DB_NAME]
    );

    if (ans.rowCount === 0) {
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}";`);
      console.log("db created");
    }
  } catch (err) {
    console.error("Database creation error:", err);
    throw err;
  } finally {
    await client.end();
  }
};

export default sequelize;

import { Sequelize } from "sequelize";
import { Client } from "pg";
import { configDotenv } from "dotenv";
configDotenv();

/**
 * Main database configuration and management file
 * This file consolidates database connection, testing, and utilities
 */

// Create main Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
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

/**
 * Test the database connection
 * @returns {Promise<void>}
 */
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    return false;
  }
};

/**
 * Creates the database if it doesn't exist
 * @returns {Promise<void>}
 */
export const createDatabaseIfNotExists = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres", // Connect to default postgres database
  });

  try {
    await client.connect();

    // Check if database exists
    const checkResult = await client.query(
      `SELECT FROM pg_database WHERE datname = $1;`,
      [process.env.DB_NAME]
    );

    // Create database if it doesn't exist
    if (checkResult.rowCount === 0) {
      console.log(`Creating database ${process.env.DB_NAME}...`);
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}";`);
      console.log(`Database ${process.env.DB_NAME} created successfully`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists`);
    }
  } catch (err) {
    console.error("Error creating database:", err);
    throw err;
  } finally {
    await client.end();
  }
};

/**
 * Initialize the database with models and sync schema
 * @param {Object} models - Models object containing all model definitions
 * @param {boolean} force - Force sync (drops tables if they exist)
 * @returns {Promise<void>}
 */
export const initializeDatabase = async (models, force = false) => {
  try {
    console.log(`Starting database synchronization (force=${force})...`);

    // Sync all models with the database
    await sequelize.sync({ force });

    console.log("✅ Database synchronized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error synchronizing database:", error);
    return false;
  }
};

export default sequelize;

/**
 * Reset the database - drops all tables and recreates them
 * @param {Object} models - Models object containing all model definitions
 * @returns {Promise<boolean>} - Success status
 */
export const resetDatabase = async (models) => {
  try {
    console.log("🔄 Starting database reset...");
    await createDatabaseIfNotExists();
    await initializeDatabase(models, true); // Force sync
    console.log("✅ Database reset completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    return false;
  }
};

/**
 * Update the database schema with new columns without data loss
 * @returns {Promise<boolean>} - Success status
 */
export const updateDatabaseSchema = async () => {
  try {
    console.log("🔄 Updating database schema...");

    // Add the isVerified column if it doesn't exist
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false;
    `);

    // Add SSO-related columns if they don't exist
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "googleId" VARCHAR(255) DEFAULT NULL;
    `);

    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "githubId" VARCHAR(255) DEFAULT NULL;
    `);

    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "profilePicture" TEXT DEFAULT NULL;
    `); // We're using email as the relationship key between User and Employee
    // No need to add employeeInfoId column

    // Create OTP table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS otp (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        expiresAt TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Database schema updated successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error updating database schema:", error);
    return false;
  }
};

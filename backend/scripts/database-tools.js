/**
 * Database Tools Script
 *
 * This script provides command line tools for database operations:
 * - Reset database (drops and recreates all tables)
 * - Update database schema (adds missing columns)
 * - Test database connection
 */

import { configDotenv } from "dotenv";
configDotenv();

import {
  testConnection,
  resetDatabase,
  updateDatabaseSchema,
  createDatabaseIfNotExists,
} from "../configuration/db.js";
import { initializeModels } from "../model/index.js";

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

async function main() {
  console.log("🛠️  Database Tools");
  console.log("==================");

  try {
    // Test connection first
    console.log("Testing database connection...");
    const connected = await testConnection();

    if (!connected) {
      console.error("❌ Database connection failed");
      process.exit(1);
    }

    // Initialize models
    const models = initializeModels();

    switch (command) {
      case "reset":
        console.log("🔄 Resetting database (this will delete all data)...");
        await resetDatabase(models);
        break;

      case "update":
        console.log("🔄 Updating database schema...");
        await updateDatabaseSchema();
        break;

      case "test":
        console.log("✅ Database connection successful");
        break;

      case "create":
        console.log("🔄 Creating database if not exists...");
        await createDatabaseIfNotExists();
        break;

      default:
        console.log("❓ Available commands:");
        console.log("  - test: Test database connection");
        console.log(
          "  - reset: Reset database (drops and recreates all tables)"
        );
        console.log(
          "  - update: Update database schema (adds missing columns)"
        );
        console.log("  - create: Create database if it doesn't exist");
    }

    console.log("✅ Operation completed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the main function
main();

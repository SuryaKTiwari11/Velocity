import sequelize, {
  testConnection,
  initializeDatabase,
} from "../configuration/db.js";
import { initializeModels } from "../model/index.js";
import { configDotenv } from "dotenv";
configDotenv();

/**
 * Simple script to test database connection and model synchronization
 */
async function syncDatabase() {
  try {
    console.log("=== DATABASE SYNC TEST ===\n");

    // Step 1: Test database connection
    console.log("Step 1: Testing database connection...");
    const connected = await testConnection();

    if (!connected) {
      console.error(
        "❌ Database connection failed. Please check your credentials."
      );
      process.exit(1);
    }

    console.log("✅ Database connection successful!\n");

    // Step 2: Initialize models
    console.log("Step 2: Initializing models...");
    const models = initializeModels();
    console.log("✅ Models initialized!\n");

    // Step 3: Sync models with database
    console.log("Step 3: Syncing models with database...");
    const syncSuccess = await initializeDatabase(models, false);

    if (syncSuccess) {
      console.log("✅ Models synced with database successfully!");
    } else {
      console.error("❌ Error syncing models with database.");
      process.exit(1);
    }

    console.log("\n=== DATABASE SYNC COMPLETE ===");
    console.log("Your database is now in sync with your model definitions!");
  } catch (error) {
    console.error("Error during database sync:", error);
  } finally {
    await sequelize.close();
  }
}

// Run the sync
syncDatabase();

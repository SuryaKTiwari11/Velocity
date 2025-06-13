import sequelize, { testConnection } from "../configuration/db.js";
import { initializeModels } from "../model/index.js";
import { configDotenv } from "dotenv";
configDotenv();

/**
 * Verify database setup and connection
 */
async function verifyDatabase() {
  try {
    console.log("=== DATABASE VERIFICATION ===\n");

    // Step 1: Test database connection
    console.log("Step 1: Testing database connection...");
    const connected = await testConnection();

    if (!connected) {
      console.error(
        "❌ Database connection failed. Please check your credentials and that PostgreSQL is running."
      );
      process.exit(1);
    }

    console.log("✅ Database connection successful!\n");

    // Step 2: Check if models are properly initialized
    console.log("Step 2: Initializing models...");
    const models = initializeModels();

    if (!models || !models.User || !models.Employee || !models.OTP) {
      console.error(
        "❌ Models not properly initialized. Check your model files."
      );
      process.exit(1);
    }

    console.log("✅ Models initialized successfully!\n");

    // Step 3: Check database tables
    console.log("Step 3: Checking database tables...");
    try {
      // Query the database to get all tables
      const [results] = await sequelize.query(`
        SELECT tablename FROM pg_catalog.pg_tables 
        WHERE schemaname = 'public';
      `);

      console.log("Found tables:");
      results.forEach((result) => console.log(`- ${result.tablename}`)); // Check if all expected tables exist
      const expectedTables = ["users", "employees", "otp"];
      const foundTables = results.map((r) => r.tablename);

      const missingTables = expectedTables.filter(
        (t) => !foundTables.includes(t)
      );

      if (missingTables.length > 0) {
        console.warn(
          `⚠️ Warning: Some tables are missing: ${missingTables.join(", ")}`
        );
        console.log(
          "You may need to run the application first to create these tables."
        );
      } else {
        console.log("✅ All expected tables exist!");
      }
    } catch (err) {
      console.error("❌ Error checking tables:", err);
    }

    console.log("\n=== VERIFICATION COMPLETE ===");
  } catch (error) {
    console.error("Error during verification:", error);
  } finally {
    await sequelize.close();
  }
}

// Run the verification
verifyDatabase();

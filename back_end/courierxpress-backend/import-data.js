import pool from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importData() {
  try {
    console.log("Importing sample data...");

    // Read SQL file
    const sqlPath = path.join(__dirname, "../../../insert_sample_data.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    // Split by semicolon and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--"));

    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log("✓ Executed:", statement.substring(0, 60) + "...");
      } catch (error) {
        // Skip duplicate key errors
        if (error.code !== "ER_DUP_ENTRY") {
          console.error("✗ Error:", error.message);
        }
      }
    }

    console.log("\n✅ Sample data imported successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Import failed:", error.message);
    process.exit(1);
  }
}

importData();

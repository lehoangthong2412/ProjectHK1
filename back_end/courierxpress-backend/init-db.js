import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  let connection;
  try {
    console.log("Connecting to MySQL...");

    // Connect without specifying database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    console.log("✓ Connected to MySQL");

    // Create database
    const dbName = process.env.DB_NAME || "courierxpress_db";
    console.log(`Creating database '${dbName}'...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`
    );
    console.log(`✓ Database '${dbName}' ready`);

    // Select database
    await connection.changeUser({ database: dbName });

    // Read and execute schema SQL
    const schemaPath = path.join(__dirname, "../../../courierxpress_db_with_data.sql");
    const sqlContent = fs.readFileSync(schemaPath, "utf-8");

    // Split statements
    const statements = sqlContent
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--") && !s.startsWith("/*"));

    console.log(`\nExecuting ${statements.length} SQL statements...`);
    let count = 0;
    for (const statement of statements) {
      try {
        await connection.query(statement);
        count++;
        if (count % 5 === 0) {
          process.stdout.write(`\r✓ Executed ${count}/${statements.length} statements`);
        }
      } catch (error) {
        if (!error.message.includes("Duplicate entry") && !error.message.includes("already exists")) {
          console.error(`\n✗ Error in statement: ${statement.substring(0, 50)}...`);
          console.error(`  ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Database initialized with ${count} statements executed successfully!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Initialization failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();

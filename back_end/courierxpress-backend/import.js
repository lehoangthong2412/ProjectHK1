import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'mysql',
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0
});

async function importSQL() {
  const conn = await pool.getConnection();
  try {
    // Read SQL file
    const sqlFile = 'C:\\Users\\ASUS\\Downloads\\courierxpress_db.sql';
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and filter empty statements
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    
    console.log(`Found ${statements.length} SQL statements`);
    
    let executed = 0;
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (stmt.length > 0) {
        try {
          await conn.execute(stmt);
          executed++;
          if (executed % 10 === 0) console.log(`✓ Executed ${executed} statements...`);
        } catch (err) {
          // Ignore duplicate key errors for INSERT
          if (!err.message.includes('Duplicate entry')) {
            console.error(`Error on statement ${i+1}: ${err.message}`);
          }
        }
      }
    }
    
    console.log(`✅ Import complete! Executed ${executed} statements`);
    
    // Verify data
    const [results] = await conn.execute('SELECT COUNT(*) as count FROM courierxpress_db.users');
    console.log(`Users table count: ${results[0].count}`);
    
  } catch (err) {
    console.error('Import failed:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

importSQL();

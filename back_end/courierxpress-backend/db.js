import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3307,
  user: 'root', 
  password: '', 
  database: 'courierxpress_db',
  waitForConnections: true,
  connectionLimit: 10
});

export default pool;
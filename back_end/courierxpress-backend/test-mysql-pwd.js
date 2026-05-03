import mysql from 'mysql2/promise';

async function testConnections() {
  const passwords = ['9176829', '', '123456', 'root', 'password', 'xampp'];
  
  for (const pwd of passwords) {
    try {
      const conn = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: pwd,
        database: 'mysql'
      });
      
      console.log(`✅ Connected with password: "${pwd}"`);
      
      // Test query
      const [result] = await conn.execute('SELECT USER() as user, VERSION() as version');
      console.log('User:', result[0].user);
      console.log('Version:', result[0].version);
      
      await conn.end();
      return pwd;
    } catch (err) {
      console.log(`❌ Failed with password "${pwd}": ${err.code}`);
    }
  }
  
  console.log('\nNo password worked. Please provide MySQL root password.');
  process.exit(1);
}

testConnections();

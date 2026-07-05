const mysql = require('mysql2/promise');

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: 'bxjefvybvxz46at2qra7-mysql.services.clever-cloud.com',
      user: 'ucnsyi8yq4wieoq2',
      password: '06nD6bJKB66TTkTQkLEw',
      database: 'bxjefvybvxz46at2qra7'
    });
    console.log('Connected to Clever Cloud DB successfully!');

    // Let's check if the 'users' table exists
    const [tables] = await conn.query('SHOW TABLES');
    console.log('Current tables:', tables.map(t => Object.values(t)[0]));

    await conn.end();
  } catch (e) {
    console.error('Connection failed:', e.message);
  }
}
run();

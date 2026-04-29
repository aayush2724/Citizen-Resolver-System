import mysql from 'mysql2/promise';
import 'dotenv/config';

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'citizen_resolver'
    });

    const [rows] = await connection.query('SELECT id, name, email, role FROM users');
    console.log('Users:', rows);
    await connection.end();
  } catch (error) {
    console.error('Error checking Users:', error.message);
  }
}

checkUsers();

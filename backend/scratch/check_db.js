import mysql from 'mysql2/promise';
import 'dotenv/config';

async function checkDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'citizen_resolver'
    });

    const [rows] = await connection.query('SELECT * FROM departments');
    console.log('Departments:', rows);
    await connection.end();
  } catch (error) {
    console.error('Error checking DB:', error.message);
  }
}

checkDB();

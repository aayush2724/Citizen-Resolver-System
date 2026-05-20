#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'scripts', 'migrations');

async function run() {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST || '127.0.0.1',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'citizen_resolver',
    multipleStatements: true
  });

  try {
    for (const file of files) {
      const p = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(p, 'utf8');
      console.log('Running', file);
      await conn.query(sql);
    }
    console.log('Migrations complete');
  } catch (err) {
    console.error('Migration error', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

run();

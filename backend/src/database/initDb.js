/**
 * Database Initialization Script
 * Reads and applies backend/database/schema.sql
 * Run with: npm run db:init
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function initializeDatabase() {
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  console.log(`[DB Init] Reading schema file from: ${schemaPath}`);

  if (!fs.existsSync(schemaPath)) {
    console.error(`[DB Init Error] Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    console.log('[DB Init] Connecting to database and creating tables...');
    await pool.query(sql);
    console.log('[DB Init SUCCESS] All tables, indexes, and constraints successfully created!');
  } catch (err) {
    console.error('[DB Init ERROR] Failed to initialize database schema:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();

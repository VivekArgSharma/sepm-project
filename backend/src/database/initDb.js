/**
 * Database Initialization Script
 * 1. Checks if target database exists; creates it if needed using default 'postgres' database connection.
 * 2. Connects to the target database and executes schema.sql.
 * Run with: npm run db:init
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const targetDb = process.env.DB_NAME || 'skillbridge_db';

async function ensureDatabaseExists() {
  // If user provided a remote cloud DATABASE_URL, the database already exists
  if (process.env.DATABASE_URL) {
    return;
  }

  const maintenanceClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // default maintenance DB in PostgreSQL
  });

  try {
    await maintenanceClient.connect();
    const checkRes = await maintenanceClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDb]
    );

    if (checkRes.rowCount === 0) {
      console.log(`[DB Init] Database "${targetDb}" does not exist. Creating it now...`);
      // Note: Database identifiers cannot be parameterized in CREATE DATABASE
      await maintenanceClient.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`[DB Init] Database "${targetDb}" created successfully!`);
    } else {
      console.log(`[DB Init] Database "${targetDb}" already exists.`);
    }
  } catch (err) {
    console.warn(
      `[DB Init Notice] Could not auto-create database via default 'postgres' db: ${err.message}`
    );
    console.warn(`Proceeding to connect directly to "${targetDb}"...`);
  } finally {
    try {
      await maintenanceClient.end();
    } catch {
      // ignore
    }
  }
}

async function initializeDatabase() {
  await ensureDatabaseExists();

  const { pool } = require('../config/db');
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  console.log(`[DB Init] Reading schema file from: ${schemaPath}`);

  if (!fs.existsSync(schemaPath)) {
    console.error(`[DB Init Error] Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    console.log(`[DB Init] Applying schema to "${targetDb}"...`);
    await pool.query(sql);
    console.log('[DB Init SUCCESS] All 13 tables, indexes, and constraints successfully created!');
  } catch (err) {
    console.error('[DB Init ERROR] Failed to initialize database schema:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();

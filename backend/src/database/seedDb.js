/**
 * Database Seed Script
 * Reads and applies backend/database/seed.sql
 * Run with: npm run db:seed
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function seedDatabase() {
  const seedPath = path.join(__dirname, '../../database/seed.sql');
  console.log(`[DB Seed] Reading seed file from: ${seedPath}`);

  if (!fs.existsSync(seedPath)) {
    console.error(`[DB Seed Error] Seed file not found at ${seedPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(seedPath, 'utf-8');

  try {
    console.log('[DB Seed] Seeding demo data (1 admin, 2 instructors, 5 students, 3 courses)...');
    await pool.query(sql);
    console.log('[DB Seed SUCCESS] Demo data successfully inserted into database!');
    console.log('--- Demo Credentials ---');
    console.log('Default Password for all: Password123!');
    console.log('Admin:       admin@skillbridge.edu');
    console.log('Instructors: dr.smith@skillbridge.edu, prof.ada@skillbridge.edu');
    console.log('Students:    alice@student.edu, bob@student.edu, charlie@student.edu, diana@student.edu, evan@student.edu');
    console.log('------------------------');
  } catch (err) {
    console.error('[DB Seed ERROR] Failed to seed database:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();

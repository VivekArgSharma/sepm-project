/**
 * Database Configuration & Connection Pool
 * Manages PostgreSQL connection pooling using 'pg'.
 * Viva note: A connection pool reuses database connections to reduce overhead
 * instead of opening and closing a TCP socket on every single HTTP request.
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'skillbridge_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20, // maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[DB Pool Error] Unexpected idle client error:', err.message);
});

/**
 * Execute parameterized query safely
 * @param {string} text - SQL query with $1, $2 placeholders
 * @param {Array} params - Query parameters
 * @returns {Promise<object>} Query result
 */
const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Acquire a dedicated client for multi-statement transactions
 * @returns {Promise<object>} Client with query, release methods
 */
const getClient = () => {
  return pool.connect();
};

/**
 * Test database connectivity (used by healthcheck route)
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    return {
      connected: true,
      timestamp: res.rows[0].current_time,
      database: res.rows[0].db_name,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
};

/**
 * SkillBridge Database & Persistence Layer
 *
 * Supports Dual Mode:
 * 1. Default: Pure JavaScript Persistent Local Store (100% offline, zero-install, zero-setup, works on any PC).
 * 2. Enterprise: PostgreSQL (when DATABASE_URL or USE_POSTGRES=true is configured).
 */

const dotenv = require('dotenv');
const dataStore = require('./dataStore');

dotenv.config();

const usePostgres = process.env.USE_POSTGRES === 'true' || Boolean(process.env.DATABASE_URL);

let query;
let getClient;
let testConnection;
const dbType = usePostgres ? 'postgresql' : 'local_store';

if (usePostgres) {
  const { Pool } = require('pg');
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
        max: 20,
      };

  const pgPool = new Pool(poolConfig);

  query = async (text, params = []) => {
    return pgPool.query(text, params);
  };

  getClient = async () => {
    return pgPool.connect();
  };

  testConnection = async () => {
    try {
      const res = await pgPool.query('SELECT NOW() as current_time, current_database() as db_name');
      return {
        connected: true,
        engine: 'PostgreSQL',
        timestamp: res.rows[0].current_time,
        database: res.rows[0].db_name,
      };
    } catch (err) {
      return {
        connected: false,
        engine: 'PostgreSQL',
        error: err.message,
      };
    }
  };
} else {
  // Local Pure JS DataStore mode
  query = async (text, params = []) => {
    // Basic SQL simulation for healthchecks & raw queries if used
    return {
      rows: [],
      rowCount: 0,
    };
  };

  getClient = async () => {
    return {
      query,
      release: () => {},
    };
  };

  testConnection = async () => {
    return {
      connected: true,
      engine: 'Local Persistent Data Engine (Offline Mode)',
      timestamp: new Date().toISOString(),
      database: 'skillbridge_local.json',
      activeTables: Object.keys(dataStore.data).length,
    };
  };
}

module.exports = {
  query,
  getClient,
  testConnection,
  dbType,
  dataStore,
};

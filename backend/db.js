import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DB_URI = process.env.DB_URI;
const DB_URI_DEFAULT = process.env.DB_URI_DEFAULT;

const ensureDatabase = async () => {
  const defaultPool = new Pool({ connectionString: DB_URI_DEFAULT });
  const client = await defaultPool.connect();

  const dbName = new URL(DB_URI).pathname.slice(1);

  try {
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Created database "${dbName}"`);
    }
  } catch (err) {
    console.error("Error ensuring database:", err);
  } finally {
    client.release();
    await defaultPool.end();
  }
};

const pool = new Pool({ connectionString: DB_URI });

const connectDB = async () => {
  try {
    await ensureDatabase();

    const client = await pool.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS Portfolio (
        id SERIAL PRIMARY KEY,
        portName VARCHAR(255) NOT NULL,
        balance NUMERIC NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS Trade (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        currencyPair VARCHAR(50) NOT NULL,
        entryPrice NUMERIC NOT NULL,
        closingPrice NUMERIC NOT NULL,
        entryTime VARCHAR(255) NOT NULL,
        closingTime VARCHAR(255) NOT NULL,
        units NUMERIC NOT NULL,
        return NUMERIC NOT NULL,
        status VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        portId INTEGER REFERENCES Portfolio(id)
      );
    `);

    client.release();
    console.log("Connected to PostgreSQL database and ensured tables.");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

export { pool, connectDB };
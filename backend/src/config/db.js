import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'he_thong_sac_xe_dien',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  // Connection pool settings
  max: 20, // Maximum number of clients in pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Database connection function
export const connectDB = async () => {
  try {
    // Test the connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    console.log(
      `📊 Connected to: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`
    );

    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('🕒 Database time:', result.rows[0].now);

    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔧 Please check:');
    console.error('   - PostgreSQL is running on your machine');
    console.error('   - Database "he_thong_sac_xe_dien" exists');
    console.error('   - Username/password is correct');
    console.error('   - Port 5432 is accessible');
    return false;
  }
};

// Graceful shutdown
export const closeDB = async () => {
  try {
    await pool.end();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error.message);
  }
};

// Export pool for use in other modules
export default pool;

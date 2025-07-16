const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  console.log('🔄 Setting up database...');
  
  // Create database if it doesn't exist
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'postgres' // Connect to default database to create our database
  });

  try {
    await client.connect();
    
    // Check if database exists
    const dbName = process.env.DB_NAME || 'workout_app';
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`;
    const dbExists = await client.query(checkDbQuery);
    
    if (dbExists.rows.length === 0) {
      console.log(`📝 Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log('✅ Database created successfully');
    } else {
      console.log(`✅ Database ${dbName} already exists`);
    }
    
    await client.end();
    
    // Now connect to our database and set up extensions
    const appClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: dbName
    });
    
    await appClient.connect();
    
    // Enable UUID extension
    console.log('🔧 Setting up database extensions...');
    await appClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension enabled');
    
    await appClient.end();
    
    console.log('🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run migrations: npm run migration:run');
    console.log('2. Run seeds: npm run seed:run');
    console.log('3. Start the server: npm run dev');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
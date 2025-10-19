#!/usr/bin/env node

/**
 * Database Initialization Script
 * Creates all necessary tables for the SGT-LMS Video Call System
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function initializeDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'elearningdb',
    user: process.env.DB_USER || 'elearning',
    password: process.env.DB_PASSWORD || 'elearningpass'
  });

  try {
    console.log('🐘 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Read schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    console.log(`📄 Reading schema from: ${schemaPath}`);
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    console.log('🔨 Creating tables and indexes...');
    await client.query(schema);
    console.log('✅ Database schema initialized successfully');

    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\n📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n🎉 Database initialization complete!');

  } catch (error) {
    if (error.code === '42P07') {
      console.log('⚠️  Tables already exist. Skipping creation.');
    } else {
      console.error('❌ Error initializing database:', error.message);
      throw error;
    }
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Load environment variables
require('dotenv').config();

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('\n✅ Ready to start the server!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  });

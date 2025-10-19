const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  // Create pool with Neon connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Md8Lk6fromCY@ep-old-shadow-adhkxq37-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test connection
    console.log('📡 Connecting to Neon PostgreSQL...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully!\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'neon-schema.sql');
    console.log(`📄 Reading SQL file: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`✅ SQL file loaded (${sql.length} characters)\n`);

    // Execute migration
    console.log('🔧 Executing migration...');
    const result = await pool.query(sql);
    console.log('✅ Migration executed successfully!\n');

    // Verify tables created
    console.log('📊 Verifying tables...');
    const tablesResult = await pool.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n✅ Tables created:');
    console.table(tablesResult.rows);

    console.log('\n🎉 Database migration completed successfully!');
    console.log(`📦 Total tables: ${tablesResult.rows.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n👋 Database connection closed');
  }
}

// Run migration
runMigration();

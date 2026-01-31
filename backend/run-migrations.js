const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log('📦 Running Supabase migrations...\n');
  
  try {
    // Read the migrations file
    const migrationsPath = path.join(__dirname, 'migrations.sql');
    const sql = fs.readFileSync(migrationsPath, 'utf8');
    
    console.log('📄 Migration file loaded');
    console.log('⚠️  Note: This script requires Supabase service_role key for RPC execution.');
    console.log('⚠️  Please run the migrations manually in Supabase SQL Editor:\n');
    console.log('1. Go to https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0]);
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of /app/backend/migrations.sql');
    console.log('4. Click "Run"\n');
    
    console.log('📋 Migration SQL preview:');
    console.log('─'.repeat(80));
    console.log(sql.substring(0, 500) + '...\n');
    console.log('─'.repeat(80));
    
  } catch (error) {
    console.error('❌ Error reading migrations file:', error.message);
    process.exit(1);
  }
}

runMigrations();

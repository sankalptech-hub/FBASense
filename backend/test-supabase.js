import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testSupabaseSetup() {
  console.log('🔍 Testing Supabase Setup...\n');
  console.log('📍 Supabase URL:', process.env.SUPABASE_URL);
  console.log('');
  
  const tables = ['inventory', 'sales', 'uploads', 'settings'];
  let allTablesExist = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table} table: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ ${table} table: Ready`);
      }
    } catch (err) {
      console.log(`❌ ${table} table: ${err.message}`);
      allTablesExist = false;
    }
  }
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  if (allTablesExist) {
    console.log('🎉 SUCCESS! All tables are ready.');
    console.log('✅ Supabase integration is fully configured.');
    console.log('\n📋 Next Steps:');
    console.log('1. Restart backend: sudo supervisorctl restart backend');
    console.log('2. Restart frontend: sudo supervisorctl restart frontend');
    console.log('3. Test the app at http://localhost:3000');
    console.log('4. Demo mode banner should be gone!');
  } else {
    console.log('⚠️  Some tables are missing.');
    console.log('📖 Please follow the instructions in /app/SUPABASE_SETUP.md');
    console.log('\n💡 Quick fix: Run the migration SQL in Supabase SQL Editor');
    console.log('   File: /app/backend/migrations.sql');
  }
  
  console.log('\n' + '─'.repeat(60));
}

testSupabaseSetup().catch(console.error);

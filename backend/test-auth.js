import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testAuthFlow() {
  console.log('🔐 Testing Supabase Auth Flow...\n');
  
  // Test signup with auto-confirm disabled
  const testEmail = `test${Date.now()}@fbasense.com`;
  const testPassword = 'TestPass123!';
  
  console.log('1️⃣ Creating test account...');
  console.log('   Email:', testEmail);
  
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Test User'
      }
    }
  });
  
  if (signupError) {
    console.log('   ❌ Signup error:', signupError.message);
    return;
  }
  
  console.log('   ✅ Signup successful');
  console.log('   User ID:', signupData.user?.id);
  console.log('   Email confirmed:', signupData.user?.email_confirmed_at ? 'Yes' : 'No');
  console.log('   Session:', signupData.session ? 'Created' : 'Pending confirmation');
  
  if (!signupData.session) {
    console.log('\n⚠️  Email confirmation required!');
    console.log('📧 To disable email confirmation:');
    console.log('   1. Go to Supabase Dashboard → Authentication → Settings');
    console.log('   2. Under "User Signups" section');
    console.log('   3. Toggle OFF "Enable email confirmations"');
    console.log('   4. Save changes\n');
  } else {
    console.log('\n2️⃣ Testing login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.log('   ❌ Login error:', loginError.message);
    } else {
      console.log('   ✅ Login successful');
      console.log('   Access token:', loginData.session.access_token.substring(0, 30) + '...');
    }
  }
}

testAuthFlow().catch(console.error);

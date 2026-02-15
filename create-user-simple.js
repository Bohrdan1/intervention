// Script simple pour créer le compte AAC
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Usage: node create-user-simple.js email password');
  process.exit(1);
}

// Lire .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const envLines = envContent.split('\n');
let SUPABASE_URL = '';
let SERVICE_ROLE_KEY = '';

envLines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    SUPABASE_URL = line.split('=')[1].trim();
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    SERVICE_ROLE_KEY = line.split('=')[1].trim();
  }
});

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createUser() {
  console.log('⏳ Création du compte...');
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  });

  if (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }

  console.log('');
  console.log('✅ Compte créé avec succès!');
  console.log('📧 Email:', data.user.email);
  console.log('🆔 ID:', data.user.id);
  console.log('');
  console.log('🎯 Vous pouvez maintenant vous connecter');
  console.log('   → http://localhost:3000/login');
}

createUser();

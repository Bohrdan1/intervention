// Script Node.js pour créer votre compte AAC
// Usage: node create-user.js votre@email.com motdepasse

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Usage: node create-user.js votre@email.com motdepasse');
  process.exit(1);
}

if (password.length < 6) {
  console.error('❌ Le mot de passe doit contenir au moins 6 caractères');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createUser() {
  console.log('⏳ Création du compte...');
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true // Email confirmé directement (pas besoin de lien)
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
  console.log('🎯 Vous pouvez maintenant vous connecter à l\'application');
  console.log('   → http://localhost:3000/login');
}

createUser();

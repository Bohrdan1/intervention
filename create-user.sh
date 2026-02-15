#!/bin/bash
# Script pour créer votre compte utilisateur AAC
# Usage: ./create-user.sh

echo "🔐 Création de votre compte AAC"
echo ""

read -p "📧 Votre email: " EMAIL
read -sp "🔑 Mot de passe (min 6 caractères): " PASSWORD
echo ""

# Utiliser npx supabase pour créer l'utilisateur
cd "$(dirname "$0")"

echo "⏳ Création du compte..."

# Via API Supabase (nécessite la clé service_role)
node << EOF
const { createClient } = require('@supabase/supabase-js');

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
  const { data, error } = await supabase.auth.admin.createUser({
    email: '${EMAIL}',
    password: '${PASSWORD}',
    email_confirm: true
  });

  if (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }

  console.log('✅ Compte créé avec succès!');
  console.log('📧 Email:', data.user.email);
  console.log('');
  console.log('🎯 Vous pouvez maintenant vous connecter à l\'application');
}

createUser();
EOF

echo ""
echo "✅ Terminé!"

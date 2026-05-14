# Projet Odessa - Next.js + Supabase

## Stack technique
- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript (strict)
- **CSS** : Tailwind CSS
- **Backend** : Supabase (PostgreSQL, Auth, Storage, Realtime)
- **ORM/Client** : @supabase/supabase-js + @supabase/ssr

## Structure du projet
```
src/
  app/              # Routes Next.js (App Router)
  lib/
    supabase/
      client.ts     # Client navigateur (composants client)
      server.ts     # Client serveur (Server Components, Route Handlers)
      middleware.ts  # Gestion des sessions dans le middleware
  middleware.ts      # Middleware Next.js (refresh des sessions)
supabase/
  migrations/       # Migrations SQL
  config.toml       # Configuration Supabase locale
```

## Regles Supabase

### Row Level Security (RLS)
- Toujours activer la RLS sur chaque nouvelle table : `ALTER TABLE nom_table ENABLE ROW LEVEL SECURITY;`
- Creer systematiquement des policies pour SELECT, INSERT, UPDATE, DELETE
- Utiliser `auth.uid()` pour filtrer par utilisateur connecte
- Ne jamais desactiver la RLS en production

### Migrations SQL
- Créer le fichier SQL dans `supabase/migrations/` (nommage : `YYYYMMDDNNNNNN_nom.sql`)
- **Appliquer via MCP Supabase** (`apply_migration`, project_id : `agldccxurgtrrvaublza`)
- Pas de Docker local, pas de `supabase db push`
- Chaque migration doit etre idempotente quand possible (IF NOT EXISTS)
- Toujours inclure les policies RLS dans la meme migration que la table

### Workflow de déploiement
1. Modifier le code
2. Appliquer les migrations via MCP Supabase (`apply_migration`)
3. `git push` → Vercel déploie automatiquement

### Typage TypeScript
- Pas de génération locale des types (pas de Docker)
- Mettre à jour manuellement `src/lib/supabase/database.types.ts` si nécessaire

### Client Supabase
- Cote client (composants 'use client') : utiliser `createClient()` de `@/lib/supabase/client`
- Cote serveur (Server Components, Route Handlers) : utiliser `createClient()` de `@/lib/supabase/server`
- Ne jamais utiliser la cle `service_role` cote client

### Conventions SQL
- Noms de tables et colonnes en snake_case
- Toujours ajouter `created_at TIMESTAMPTZ DEFAULT NOW()` et `updated_at TIMESTAMPTZ DEFAULT NOW()`
- Utiliser des UUID comme cles primaires : `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
- Creer des index sur les colonnes frequemment filtrees

### Edge Functions
- Les Edge Functions Supabase utilisent Deno
- Gerer les secrets avec `npx supabase secrets set NOM_SECRET=valeur`
- Toujours valider les inputs dans les Edge Functions

## Commandes utiles
```bash
npm run dev                  # Demarrer Next.js en dev (pas de Docker)
# Migrations : via MCP Supabase apply_migration (project agldccxurgtrrvaublza)
# Deploy : git push → Vercel auto
```

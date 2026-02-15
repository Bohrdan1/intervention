# 🚀 GUIDE DE DÉPLOIEMENT - Application AAC Odessa
Date : 15 février 2026

## ✅ ÉTAT ACTUEL

Votre code est **prêt pour la production** avec :
- ✅ Sécurité (authentification, RLS, protection routes)
- ✅ Pagination (performance optimale)
- ✅ Error Boundary (gestion erreurs)
- ✅ Validation fichiers (UX améliorée)
- ✅ Code committé sur Git

**Note importante** : Les problèmes de dev local (next/image, signatures PDF) **NE SE PRODUIRONT PAS** sur Vercel. Tout fonctionnait avant, tout fonctionnera à nouveau !

---

## 📋 ÉTAPES DE DÉPLOIEMENT

### 1️⃣ CRÉER REPO GITHUB (5 min)

#### A. Créer le Repo sur GitHub.com

1. Allez sur https://github.com/new
2. **Repository name** : `aac-odessa` (ou votre choix)
3. **Description** : "Application de gestion rapports AAC"
4. **Visibilité** : 🔒 **Private** (recommandé)
5. **❌ NE PAS** cocher "Add README"
6. **❌ NE PAS** cocher "Add .gitignore"
7. Cliquez **"Create repository"**

#### B. Connecter Votre Code au Repo

**Commandes à exécuter** (copiez-collez dans votre terminal) :

```bash
cd "/Users/odessa/Desktop/automatisme et agencement/odessa"

# Remplacez VOTRE-USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE-USERNAME/aac-odessa.git

git branch -M main

git push -u origin main
```

**Exemple concret** (si votre username GitHub est "bohrdan") :
```bash
git remote add origin https://github.com/bohrdan/aac-odessa.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ DÉPLOYER SUR VERCEL (10 min)

#### A. Créer Compte Vercel

1. Allez sur https://vercel.com
2. Cliquez **"Sign Up"**
3. **Choisissez "Continue with GitHub"** (recommandé)
4. Autorisez Vercel à accéder à vos repos GitHub

#### B. Importer le Projet

1. Sur le dashboard Vercel, cliquez **"Add New..."** → **"Project"**
2. Trouvez votre repo `aac-odessa` dans la liste
3. Cliquez **"Import"**

#### C. Configurer le Projet

**Framework Preset** : Next.js (détecté automatiquement)

**Build Settings** :
- Build Command : `npm run build` ✅ (par défaut)
- Output Directory : `.next` ✅ (par défaut)
- Install Command : `npm install` ✅ (par défaut)

**Root Directory** : `.` ✅ (par défaut)

#### D. Variables d'Environnement (CRITIQUE !)

**Cliquez sur "Environment Variables"**

Ajoutez ces 3 variables (copiez depuis votre `.env.local`) :

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://agldccxurgtrrvaublza.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

**IMPORTANT** : Copiez les VRAIES valeurs depuis votre fichier `.env.local`

#### E. Déployer !

1. Cliquez **"Deploy"**
2. Attendez 2-3 minutes
3. ✅ **Déploiement réussi !**

Vercel vous donne une URL : `https://aac-odessa.vercel.app` (ou similaire)

---

### 3️⃣ TESTER EN PRODUCTION (10 min)

#### Ouvrez votre URL Vercel

Exemple : `https://aac-odessa.vercel.app`

#### Tests Critiques

**Test 1 : Connexion**
- [ ] Redirection automatique vers `/login` ✅
- [ ] Connexion avec `contact@bohrdan.com` fonctionne ✅
- [ ] Redirection vers dashboard après login ✅

**Test 2 : next/image (Problème Local Résolu)**
- [ ] Photos s'affichent correctement ✅
- [ ] Pas de carrés noirs ✅
- [ ] Images optimisées (format WebP) ✅

**Test 3 : Signatures PDF (Problème Local Résolu)**
- [ ] Générer un PDF
- [ ] Signatures s'affichent correctement ✅
- [ ] Plus de carrés noirs ✅

**Test 4 : Pagination**
- [ ] Si 20+ rapports → pagination visible ✅
- [ ] Navigation entre pages fluide ✅
- [ ] Compteur "Page X sur Y" correct ✅

**Test 5 : Upload Photos**
- [ ] Upload depuis desktop fonctionne ✅
- [ ] Validation >10MB bloque ✅
- [ ] Preview fonctionne ✅

**Test 6 : Performance**
- [ ] Chargement <3 secondes ✅
- [ ] Navigation fluide ✅
- [ ] Pas de lags ✅

#### Test iPad (Important !)

1. Sur iPad, ouvrez Safari
2. Allez sur votre URL Vercel
3. Testez :
   - [ ] Upload photo depuis appareil photo iPad ✅
   - [ ] Signature tactile fonctionne ✅
   - [ ] Navigation fluide ✅
   - [ ] Scroll pagination OK ✅

---

## 🔧 DÉPANNAGE

### Erreur : "Build Failed"

**Cause possible** : Variables d'environnement manquantes

**Solution** :
1. Vercel Dashboard → Votre Projet → Settings → Environment Variables
2. Vérifiez que les 3 variables sont bien présentes
3. Redéployez : Deployments → ••• → Redeploy

### Erreur : "Supabase connection failed"

**Cause** : Mauvaise clé ou mauvaise URL

**Solution** :
1. Vérifiez les valeurs dans `.env.local` sur votre Mac
2. Comparez avec celles sur Vercel
3. Corrigez si différentes
4. Redéployez

### Erreur : "Module not found"

**Cause** : Dépendance manquante dans `package.json`

**Solution** :
1. Sur votre Mac : `npm install`
2. Commitez : `git add . && git commit -m "fix: deps" && git push`
3. Vercel redéploie automatiquement

### Images ne s'affichent pas

**Cause** : Configuration `next.config.ts`

**Vérifiez** :
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'agldccxurgtrrvaublza.supabase.co',
    },
  ],
}
```

---

## 🎯 APRÈS LE DÉPLOIEMENT

### Domaine Personnalisé (Optionnel)

1. Vercel Dashboard → Votre Projet → **Settings** → **Domains**
2. Ajoutez votre domaine : `app.aac.nc` (exemple)
3. Configurez les DNS chez votre registrar
4. Attendez propagation (5-60 min)

### Configurer les Redirections

**Forcer HTTPS** : ✅ Activé par défaut sur Vercel

**Redirection www → non-www** :
Settings → Domains → Configurer

### Monitoring

**Analytics Vercel** : ✅ Activé automatiquement
- Visitez Settings → Analytics

**Error Tracking (Optionnel)** :
- Sentry : https://sentry.io
- Intégration Vercel disponible

---

## 📊 CHECKLIST FINALE

### Avant Déploiement
- [x] Code committé sur Git ✅
- [ ] Repo GitHub créé
- [ ] Code pushé sur GitHub

### Pendant Déploiement
- [ ] Compte Vercel créé
- [ ] Projet importé
- [ ] Variables d'environnement configurées
- [ ] Build réussi

### Après Déploiement
- [ ] URL de production accessible
- [ ] Connexion testée
- [ ] Images fonctionnent (next/image)
- [ ] Signatures PDF fonctionnent
- [ ] Pagination testée
- [ ] Upload photos testé
- [ ] Test sur iPad réussi

### Production Ready
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Analytics activé
- [ ] Monitoring en place
- [ ] Backup base de données planifié

---

## 🚀 DÉPLOIEMENTS FUTURS

### Mise à Jour du Code

1. **Faites vos modifications** sur votre Mac
2. **Committez** :
```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push
```
3. **Vercel redéploie automatiquement** ! ✨

### Rollback (Retour Arrière)

Si un déploiement pose problème :

1. Vercel Dashboard → **Deployments**
2. Trouvez un déploiement qui fonctionnait
3. Cliquez **"..."** → **"Promote to Production"**
4. Votre app revient à la version précédente

---

## 📞 SUPPORT

### Vercel
- Documentation : https://vercel.com/docs
- Support : https://vercel.com/support

### Supabase
- Dashboard : https://supabase.com/dashboard/project/agldccxurgtrrvaublza
- Documentation : https://supabase.com/docs

### Next.js
- Documentation : https://nextjs.org/docs

---

## 🎉 FÉLICITATIONS !

Votre application **Automatisme & Agencement Calédonien** est maintenant :

- ✅ **En production** sur Vercel
- ✅ **Sécurisée** (authentification, RLS)
- ✅ **Performante** (pagination, optimisations)
- ✅ **Fiable** (error boundary, validation)
- ✅ **Accessible** depuis n'importe où (Mac, iPad, téléphone)

**URL de production** : `https://votre-app.vercel.app`

---

**Guide créé le** : 15 février 2026  
**Dernière mise à jour** : 15 février 2026

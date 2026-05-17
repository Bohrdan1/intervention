# ARCHITECTURE.md — Odessa

Application de gestion d'interventions pour AAC (Automatisme et Agencement Calédonien).
Portes automatiques, portails, volets roulants — Nouvelle-Calédonie.

**Stack :** Next.js 15 App Router · Supabase · TypeScript strict · Tailwind CSS · @react-pdf/renderer · Vercel
**Repo :** https://github.com/Bohrdan1/intervention.git
**Supabase project ref :** agldccxurgtrrvaublza
**Monnaie :** Francs CFP (F) — jamais d'euros
**TVA :** 11% (Nouvelle-Calédonie)
**Usage principal :** iPad en mobilité

---

## Règle de validation — toujours dans cet ordre

1. `npx supabase db push` — appliquer les migrations
2. `npm run build` — zéro erreur TypeScript = tâche terminée

Ne jamais utiliser `npm run dev` comme étape de validation.

---

## Schéma de données

### Hiérarchie

```
clients
  └── sites
        └── equipements         ← porte physique (ex-installations, migrée Phase 1)
              └── controles     ← résultats contrôle EN 16005

dossiers                        ← entité centrale du workflow
  ├── client_id, site_id, equipement_id
  ├── rdvs[]
  ├── rapports[]                ← rapports.dossier_id (nullable — anciens rapports)
  ├── factures[]
  └── reglements[]              ← lié à facture_id + dossier_id
```

### Tables

| Table | Rôle | Lignes prod |
|-------|------|-------------|
| `clients` | Fiche client B2B ou résidentiel | 1 |
| `sites` | Lieu physique rattaché à un client | 15 |
| `equipements` | Porte automatique (ex-installations, UUID conservés) | 48 |
| `controles` | Résultats contrôle par équipement, JSONB | 33 |
| `dossiers` | Entité centrale, un dossier = un cycle complet | 29 |
| `rapports` | Rapport intervention/maintenance/visite | 25 |
| `rdvs` | Rendez-vous rattachés à un dossier | 3 |
| `factures` | Facture rattachée à un dossier | 0 |
| `reglements` | Règlement rattaché à une facture | 0 |

### Attention — table installations

`app/installations/[id]/page.tsx` existe encore dans le code.
La table `installations` a été supprimée en Phase 1 — remplacée par `equipements` (UUIDs identiques).
Cette page doit être redirigée vers `/equipements/[id]` ou supprimée.
Ne pas recréer la table installations.

### Types énumérés

**dossiers.type :** `urgent` | `contrat` | `visite`
**dossiers.statut :** `ouvert` | `en_cours` | `en_attente` | `termine` | `annule`
**rapports.type_rapport :** `maintenance` | `intervention` | `visite`
**rapports.statut :** `brouillon` | `finalise`
**rapports.statut_devis :** `brouillon` | `envoye` | `accepte` | `refuse`
**rdvs.type :** `diagnostic` | `intervention` | `maintenance` | `visite`
**rdvs.statut :** `planifie` | `confirme` | `realise` | `annule`
**factures.statut :** `brouillon` | `envoyee` | `payee` | `en_retard` | `annulee`
**reglements.mode :** `virement` | `cheque` | `especes` | `carte`

### Champs JSONB importants

**rapports.constat_general :** `[{ label, texte, conforme: boolean }]`
**rapports.pieces_utilisees :** `[{ description, quantite, reference }]`
**rapports.lignes_devis :** `[{ id, description, quantite, unite, prix_unitaire, fournisseur, statut_fournisseur, type }]`
**rapports.visite_data :** `{}` clé/valeur libre
**controles.points_controle :** `[{ nom, etat: 'ok'|'nok'|'na', observation }]`
**controles.points_erp :** `[{ nom, conforme: boolean }]`

---

## Les 3 workflows métier

### 1. Intervention urgente
```
demande → (RDV optionnel) → Rapport type=intervention → Facture → Règlement
dossier.type = 'urgent'
```

### 2. Maintenance contractuelle
```
Contrat → RDV planifié → Rapport type=maintenance → Facture → Règlement
dossier.type = 'contrat'
```

### 3. Visite / Devis
```
demande → RDV → Rapport type=visite → Devis (lignes_devis sur rapport) → Facture → Règlement
dossier.type = 'visite'
Le devis n'est pas une entité séparée — il vit dans rapports.lignes_devis (JSONB)
```

Un rapport peut exister sans dossier (`dossier_id` nullable) — cas des anciens rapports non migrés.
AAC ne stocke pas de pièces — toute ligne devis a un statut fournisseur (à consulter / en attente / confirmé).

---

## Structure des pages (réelle)

```
src/app/
  page.tsx                          ← Dashboard dossiers (accueil)
  layout.tsx, globals.css, loading.tsx, error.tsx

  agenda/
    page.tsx                        ← Liste + calendrier hebdomadaire RDV

  dossiers/
    [id]/page.tsx                   ← Fiche dossier
    new/page.tsx                    ← Création dossier

  rapports/
    page.tsx                        ← Liste rapports (filtres : tous/brouillons/finalisés/archivés)
    nouveau/
      page.tsx                      ← Création rapport
      client-selector.tsx
    [id]/
      page.tsx                      ← Mode lecture (RapportPageClient) + bouton Modifier
      actions.ts                    ← Server actions du rapport
      archive-button.tsx
      delete-button.tsx
      controle/                     ← Checklist EN 16005
      devis/                        ← Module devis (lignes_devis)
      finaliser/                    ← Finalisation rapport
      intervention/                 ← Saisie intervention
      ot/                           ← Ordre de travail — OBSOLÈTE, à supprimer
      pdf/route.tsx                 ← Génération PDF rapport
      visite/                       ← Saisie visite technique

  equipements/
    [id]/page.tsx                   ← Fiche équipement

  installations/
    [id]/page.tsx                   ← OBSOLÈTE — rediriger vers /equipements/[id]

  clients/
    page.tsx
    [id]/                           ← Fiche client, édition, sites, installations

  finances/
    page.tsx                        ← Module finances (en cours)

  prospects/
    page.tsx                        ← Module prospects

  export/
    page.tsx                        ← Export client

  api/
    export/route.ts                 ← Route API export

  login/page.tsx
  offline/page.tsx                  ← Mode PWA offline
```

---

## Structure des composants (réelle)

```
src/components/
  dashboard/
    maintenance-alerts.tsx
    rapport-list.tsx

  dossiers/
    AjouterRapportButton.tsx / AjouterRapportModal.tsx
    DeleteDossierButton.tsx
    DossierCard.tsx
    DossierFilters.tsx
    NouveauDossierForm.tsx

  rapports/
    RapportEdition.tsx              ← Formulaire édition
    RapportLecture.tsx              ← Affichage lecture seule
    RapportPageClient.tsx           ← Orchestrateur lecture/édition (state modeEdition)
    RattacherDossierButton.tsx / RattacherDossierModal.tsx

  rdvs/
    AgendaClient.tsx                ← Toggle liste/calendrier
    DossierRdvSection.tsx           ← Section RDV dans fiche dossier
    RdvCalendrierSemaine.tsx        ← Calendrier CSS grid (pas de lib externe)
    RdvCard.tsx
    RdvModal.tsx
    rdv-types.ts                    ← Types TypeScript RDV

  ui/
    nav-bar.tsx
    pagination.tsx
    photo-upload.tsx
    pieces-input.tsx
    toast.tsx
```

---

## Server Actions

```
src/app/actions/
  dossiers.ts     ← createDossier, updateDossier, deleteDossier, updateDossierStatut
  rapports.ts     ← rattacherRapportDossier, detacherRapportDossier
  rdvs.ts         ← createRdv, updateRdv, updateRdvStatut, deleteRdv

src/app/rapports/[id]/
  actions.ts                ← finaliser, archiver, supprimer rapport
  controle/actions.ts
  devis/actions.ts
  finaliser/actions.ts
  intervention/actions.ts
  visite/actions.ts

src/lib/actions/
  catalogue.ts    ← catalogue pièces/matériel
  photos.ts       ← upload photos Supabase Storage
  signatures.ts   ← gestion signatures client
```

Toujours appeler `revalidatePath()` après chaque mutation.

---

## PDF

```
src/lib/pdf/
  rapport-pdf.tsx     ← Composant @react-pdf/renderer rapport
  devis-pdf.tsx       ← Composant @react-pdf/renderer devis
  logo.ts             ← Logo AAC encodé

src/app/rapports/[id]/pdf/route.tsx       ← GET → stream PDF rapport
src/app/rapports/[id]/devis/pdf/route.ts  ← GET → stream PDF devis
```

**Bugs PDF iPad connus (non corrigés) :**
- `Content-Disposition: attachment` manquant dans les deux route handlers → PDF s'ouvre dans Safari au lieu de se télécharger
- Ne pas corriger en local si ça casse le comportement desktop — fix à valider sur Vercel

---

## Lib utilitaires

```
src/lib/
  supabase/
    client.ts           ← createBrowserClient (Client Components)
    server.ts           ← createServerClient (Server Components + Actions)
    middleware.ts       ← auth middleware
    database.types.ts   ← types générés Supabase (regénérer après chaque migration)
  types/index.ts        ← types métier : Client, Site, Equipement, Dossier, Rapport, Controle, Rdv, Facture, Reglement
  constants.ts          ← constantes partagées
  utils.ts              ← helpers (formatDate, formatMontant CFP, etc.)
```

---

## Conventions

### Server vs Client Components
- **Server Components** : fetches Supabase, pages, layouts
- **Client Components** : filtres, modals, formulaires, calendrier, interactions
- `'use client'` le plus bas possible dans l'arbre

### Nommage
- Pages : `page.tsx`
- Client Components colocalisés : `[nom]-client.tsx`
- Composants réutilisables : `src/components/[domaine]/NomComposant.tsx`
- Server Actions colocalisées : `actions.ts` dans le dossier de la page
- Server Actions globales : `src/app/actions/[entité].ts`

### TypeScript
- Strict mode, zéro `any`
- Types métier dans `src/lib/types/index.ts`
- Types Supabase dans `src/lib/supabase/database.types.ts`

### iPad
- Touch targets min 44px sur tous les éléments interactifs
- Pas de comportements hover-only
- Modals plein écran sur mobile

---

## État d'avancement

| Phase | Statut | Contenu |
|-------|--------|---------|
| 1 | ✅ Terminé | Schéma dossiers, migration installations→equipements |
| 2 | ✅ Terminé | Dashboard dossiers, fiche dossier, création dossier |
| 3A | ✅ Terminé | Module RDV — liste, calendrier, création |
| 3B | 🔜 À faire | Factures + Règlements |
| 3C | 🔜 À faire | Sync Google Calendar (unidirectionnel Odessa → Google) |
| 4 | 🔜 À faire | Fiche équipement complète, EN 16005 checklist, devis PDF |

## Travaux ponctuels ouverts

- `/installations/[id]` → rediriger vers `/equipements/[id]` (table supprimée)
- `/rapports/[id]/ot/` → supprimer (remplacé par mode lecture sur `/rapports/[id]`)
- Calendrier RDV : bug timezone UTC vs Nouméa (UTC+11) dans `RdvCalendrierSemaine.tsx`
- PDF iPad : `Content-Disposition: attachment` manquant dans les deux route handlers

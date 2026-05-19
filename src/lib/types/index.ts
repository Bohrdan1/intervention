// Types métier pour l'app Odessa

export interface PhotoItem {
  id: string;
  url: string;
  path: string;
  label: string;
  context: string; // ex: "controle:{installation_id}" ou "intervention"
  created_at: string;
}

export type ClientType = 'prospect' | 'actif' | 'inactif';
export type FacturationStatut = 'non_facture' | 'facture' | 'paye' | 'en_retard';
export type ReglementMode = 'virement' | 'cheque' | 'especes' | 'carte';
export type DossierStatut = 'ouvert' | 'en_cours' | 'en_attente' | 'facture' | 'termine' | 'annule';

export interface Client {
  id: string;
  nom: string;
  sous_titre: string | null;
  prenom: string | null;
  fonction: string | null;
  telephone: string | null;
  mail: string | null;
  comptabilite: string | null;
  denomination_legale: string | null;
  ridet: string | null;
  adresse_facturation: string | null;
  telephone_secondaire: string | null;
  mail_comptabilite: string | null;
  site_web: string | null;
  notes_internes: string | null;
  type_client: 'professionnel' | 'particulier';
  /** Statut du cycle de vie : prospect → actif → inactif */
  type: ClientType;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  client_id: string;
  nom: string;
  adresse: string | null;
  contact_nom: string | null;
  contact_telephone: string | null;
  contact_mail: string | null;
  memo_prive: string | null;
  /** Périodicité de maintenance en mois. null = pas de contrat. */
  periodicite_maintenance: number | null;
  contact_fonction: string | null;
  horaires: string | null;
  code_acces: string | null;
  notes_site: string | null;
  created_at: string;
  updated_at: string;
}

export interface Equipement {
  id: string;
  site_id: string;
  repere: string;
  type_porte: string;
  modele: string | null;
  marque: string | null;
  numero_serie: string | null;
  annee_installation: number | null;
  date_mise_en_service: string | null;
  avec_batterie: boolean;
  commentaire: string | null;
  notes_techniques: string | null;
  created_at: string;
  updated_at: string;
}

/** @deprecated Utiliser Equipement */
export type Installation = Equipement;

export type EtatControle = 'ok' | 'correction' | 'prevention' | 'na';

export interface PointControle {
  nom: string;
  etat: EtatControle;
  observation: string;
}

export interface PointERP {
  nom: string;
  conforme: boolean;
  commentaire?: string;
}

export interface ConstatItem {
  label: string;
  texte: string;
  conforme: boolean;
}

export interface Controle {
  id: string;
  rapport_id: string;
  equipement_id: string;
  /** @deprecated Renommé en equipement_id — conservé pour compatibilité PDF */
  installation_id?: string | null;
  page_number: number;
  points_controle: PointControle[];
  points_erp: PointERP[];
  note_supplementaire?: string;
  nombre_cycles?: number | null;
  heures_fonctionnement?: number | null;
  created_at: string;
  updated_at: string;
}

export type TypeRapport = 'maintenance' | 'intervention' | 'visite';

/** Mapping centralisé : couleurs Tailwind et labels par type de rapport */
export const TYPE_RAPPORT_CONFIG: Record<TypeRapport, {
  label: string;
  couleurTexte: string;
  couleurBadge: string;
  couleurBouton: string;
}> = {
  maintenance: {
    label: 'Maintenance',
    couleurTexte: 'text-blue-700',
    couleurBadge: 'bg-blue-100 text-blue-700',
    couleurBouton: 'bg-blue-600 hover:bg-blue-700',
  },
  intervention: {
    label: 'Intervention',
    couleurTexte: 'text-purple-700',
    couleurBadge: 'bg-purple-100 text-purple-700',
    couleurBouton: 'bg-purple-600 hover:bg-purple-700',
  },
  visite: {
    label: 'Visite technique',
    couleurTexte: 'text-teal-700',
    couleurBadge: 'bg-teal-100 text-teal-700',
    couleurBouton: 'bg-teal-600 hover:bg-teal-700',
  },
};

// ── Visite technique (portes automatiques) ──

export type TypePorteVisite = 'coulissante' | 'battante' | 'autre';
export type TypeCoulissante = 'simple' | 'telescopique';
export type SensOuverture = 'poussant' | 'tirant';
export type NatureSupport = 'beton' | 'metal' | 'placo' | 'autre';
export type Debattement = 'degage' | 'obstacle';

export interface PorteVisite {
  id: string;
  type_porte: TypePorteVisite;
  type_coulissante: TypeCoulissante | '';
  vantaux: number;
  parties_fixes: number;
  sens_ouverture: SensOuverture | '';
  type_autre: string;
  support: NatureSupport;
  support_autre: string;
  hauteur: string;
  largeur: string;
  passage_utile: string;
  linteau: string;
  profondeur: string;
  debattement: Debattement;
  debattement_detail: string;
  photos: PhotoItem[];
}

export interface EnvironnementVisite {
  acces: string;
  electricite: string[]; // ['230v', 'disjoncteur', 'a_prevoir']
  securite: string[];    // ['rideau_laser', 'cellules', 'barre_palpeuse', 'das']
  activation: string[];  // ['radar', 'bouton', 'digicode', 'badge', 'telecommande']
}

export interface ChecklistPhotos {
  interieur: boolean;
  exterieur: boolean;
  details_techniques: boolean;
}

export interface VisiteData {
  client_site_libre: string;
  adresse: string;
  contact_sur_place: string;
  telephone_contact: string;
  email_supplementaire: string;
  travaux_envisages: string;
  portes: PorteVisite[];
  environnement: EnvironnementVisite;
  observations_particulieres: string;
  preconisation: string;
}

export const DEFAULT_PORTE_VISITE: PorteVisite = {
  id: '',
  type_porte: 'coulissante',
  type_coulissante: 'simple',
  vantaux: 2,
  parties_fixes: 0,
  sens_ouverture: '',
  type_autre: '',
  support: 'beton',
  support_autre: '',
  hauteur: '',
  largeur: '',
  passage_utile: '',
  linteau: '',
  profondeur: '',
  debattement: 'degage',
  debattement_detail: '',
  photos: [],
};

export const DEFAULT_VISITE_DATA: VisiteData = {
  client_site_libre: '',
  adresse: '',
  contact_sur_place: '',
  telephone_contact: '',
  email_supplementaire: '',
  travaux_envisages: '',
  portes: [],
  environnement: {
    acces: '',
    electricite: [],
    securite: [],
    activation: [],
  },
  observations_particulieres: '',
  preconisation: '',
};

export interface PieceUtilisee {
  nom: string;
  quantite: number;
  reference?: string;
}

export interface InterventionEquipement {
  equipement_id: string;
  repere: string;
  diagnostic: string;
  travaux_effectues: string;
  pieces_utilisees: PieceUtilisee[];
}

export interface Rapport {
  id: string;
  numero_cm: string;
  date_intervention: string;
  client_id: string;
  site_id: string;
  technicien: string;
  type_rapport: TypeRapport;
  constat_general: ConstatItem[];
  // Photos
  photos: PhotoItem[];
  // Champs intervention
  equipement_id: string | null;
  dossier_id: string | null;
  demande_client: string | null;
  description_probleme: string | null;
  diagnostic: string | null;
  travaux_effectues: string | null;
  pieces_utilisees: PieceUtilisee[];
  /** Nouveau format multi-équipements. null = ancien format (rétrocompat). */
  interventions_equipements: InterventionEquipement[] | null;
  // Champs visite technique
  observations_visite: string | null;
  recommandations: string | null;
  visite_data: VisiteData | null;
  statut: 'brouillon' | 'finalise';
  /** Montant facturé HT en CFP (saisi manuellement pour export/stats) */
  montant_ht: number | null;
  signature_data: string | null;
  signature_client: string | null;
  /** Nom de la personne qui a signé côté client */
  nom_signataire_client: string | null;
  /** Horodatage de la signature (ISO) */
  date_signature: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Dossier, RDV, Facture, Règlement ──

export interface Dossier {
  id: string;
  reference: string;
  client_id: string;
  site_id: string | null;
  type_dossier: 'maintenance' | 'installation' | 'remplacement' | 'intervention' | 'autre';
  statut: DossierStatut;
  titre: string | null;
  description: string | null;
  date_ouverture: string;
  date_cloture: string | null;
  montant_total_ht: number | null;
  notes: string | null;
  note_attente: string | null;
  // Suivi facturation (Facture+ reste l'outil de facturation)
  facture_statut: FacturationStatut;
  facture_numero: string | null;
  facture_date: string | null;
  facture_montant_ttc: number | null;
  reglement_date: string | null;
  reglement_mode: ReglementMode | null;
  created_at: string;
  updated_at: string;
}

export type RdvType = "diagnostic" | "intervention" | "maintenance" | "visite";
export type RdvStatut = "planifie" | "confirme" | "realise" | "annule";

export interface Rdv {
  id: string;
  dossier_id: string | null;
  client_id: string;
  site_id: string | null;
  type_rdv: RdvType;
  date_rdv: string;
  duree_minutes: number | null;
  statut: RdvStatut;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type RdvFormData = {
  dossier_id: string;
  date_rdv: string;
  duree_minutes: number | null;
  type_rdv: RdvType;
  statut: RdvStatut;
  notes: string | null;
};

export interface Facture {
  id: string;
  numero: string;
  dossier_id: string | null;
  client_id: string;
  date_facture: string;
  date_echeance: string | null;
  statut: 'brouillon' | 'envoyee' | 'partiellement_payee' | 'payee' | 'annulee';
  montant_ht: number;
  taux_tva: number;
  lignes: LigneDevis[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reglement {
  id: string;
  facture_id: string;
  date_reglement: string;
  montant: number;
  mode_paiement: 'virement' | 'cheque' | 'especes' | 'autre';
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Types enrichis (avec jointures)
export interface RapportComplet extends Rapport {
  client: Client;
  site: Site;
  equipement?: Equipement | null;
  /** @deprecated alias pour le PDF — utiliser equipement */
  installation?: Equipement | null;
  controles: (Controle & {
    equipement: Equipement;
    /** @deprecated alias pour le PDF — utiliser equipement */
    installation: Equipement;
  })[];
}

// Coordonnées société (constantes)
export const SOCIETE = {
  nom: 'Automatisme et Agencement Calédonien',
  ridet: '0 934 604.003',
  rc: 'CA500000121738',
  telephone: '800808',
  mail: 'contact@bohrdan.com',
  iban: 'FR21 1415 8010 2200 3506 4W05 139',
  codeApe: '43.29B',
} as const;

// Points de contrôle par défaut
export const DEFAULT_POINTS_CONTROLE: PointControle[] = [
  { nom: 'câblages basse tension', etat: 'ok', observation: '' },
  { nom: 'raccordement électrique', etat: 'ok', observation: '' },
  { nom: 'groupe moteur', etat: 'ok', observation: '' },
  { nom: 'platine électronique', etat: 'ok', observation: '' },
  { nom: 'détecteurs', etat: 'ok', observation: '' },
  { nom: 'SSI / DAS', etat: 'ok', observation: 'raccordé' },
  { nom: 'verrouillage', etat: 'ok', observation: '' },
  { nom: 'boitier de commande', etat: 'ok', observation: '' },
  { nom: 'contrôle d\'accès', etat: 'ok', observation: '' },
  { nom: 'bande de roulement', etat: 'ok', observation: '' },
  { nom: 'courroie', etat: 'ok', observation: '' },
  { nom: 'poulies de renvoi', etat: 'ok', observation: '' },
  { nom: 'chariots porteurs', etat: 'ok', observation: '' },
  { nom: 'butées', etat: 'ok', observation: '' },
  { nom: 'fixations du mécanisme', etat: 'ok', observation: '' },
  { nom: 'éléments de guidage au sol', etat: 'ok', observation: '' },
  { nom: 'menuiserie', etat: 'ok', observation: '' },
  { nom: 'vitrage', etat: 'ok', observation: '' },
  { nom: 'calfeutrements', etat: 'ok', observation: '' },
];

export const DEFAULT_POINTS_ERP: PointERP[] = [
  { nom: 'réouverture sur obstacle', conforme: true },
  { nom: 'ouverture par rappel mécanique', conforme: true },
  { nom: "boitier d'ouverture d'urgence", conforme: true },
  { nom: 'ouverture sur panne réseau si non verrouillé', conforme: true },
  { nom: 'bande de visualisation', conforme: true },
  { nom: 'zone de sécurisation', conforme: true },
  { nom: 'alimentation sur disjoncteur séparé', conforme: true },
];

export const DEFAULT_CONSTAT: ConstatItem[] = [
  { label: 'Structure', texte: 'En bon état, aucune déformation majeure, pas de corrosion. Habillages et fixations correctes.', conforme: true },
  { label: 'Rails', texte: "Nettoyés, pas d'usure excessive ni rayure profonde.", conforme: true },
  { label: 'Motorisation', texte: 'Fonctionnement fluide, pas de vibrations ou bruit anormal. Courroies et câbles en bon état.', conforme: true },
  { label: 'Détection / Sécurité', texte: "Capteurs réactifs, systèmes d'inversion et ralentissement conformes.", conforme: true },
  { label: 'Verrouillage', texte: 'Fonctionnement normal des serrures et loquets, aucune difficulté.', conforme: true },
  { label: 'Carte de commande', texte: "Aucun message d'erreur, réglages conformes.", conforme: true },
  { label: 'Connexion électrique', texte: 'Borniers serrés, câblage OK, mise à la terre conforme.', conforme: true },
  { label: 'Mouvements', texte: 'Fermeture progressive, sans à-coups, butée respectée.', conforme: true },
  { label: 'Essais finaux', texte: 'Fonctionnement fluide, voyants au vert.', conforme: true },
];

// ── Module Devis (issu d'une visite technique) ──

export type TypeLigne = 'materiel' | 'main_oeuvre' | 'deplacement' | 'autre';
export type StatutFournisseur = 'a_consulter' | 'en_attente' | 'confirme';
export type StatutDevis = 'brouillon' | 'envoye' | 'accepte' | 'refuse';

export interface LigneDevis {
  id: string;
  type: TypeLigne;
  description: string;
  quantite: number;
  unite: string;           // 'u', 'h', 'forfait', 'm', 'm²'
  prix_unitaire: number;
  fournisseur: string;     // nom du fournisseur
  statut_fournisseur: StatutFournisseur;
  reference: string;
}

export const DEFAULT_LIGNE_DEVIS: LigneDevis = {
  id: '',
  type: 'materiel',
  description: '',
  quantite: 1,
  unite: 'u',
  prix_unitaire: 0,
  fournisseur: '',
  statut_fournisseur: 'a_consulter',
  reference: '',
};

export const UNITES = ['u', 'h', 'forfait', 'm', 'm²', 'ml', 'lot'] as const;
export const TYPE_LIGNE_LABELS: Record<TypeLigne, string> = {
  materiel: 'Matériel',
  main_oeuvre: 'Main d\'œuvre',
  deplacement: 'Déplacement',
  autre: 'Autre',
};
export const STATUT_FOURNISSEUR_LABELS: Record<StatutFournisseur, string> = {
  a_consulter: 'À consulter',
  en_attente: 'En attente',
  confirme: 'Confirmé',
};

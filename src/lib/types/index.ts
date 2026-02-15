// Types métier pour l'app Odessa

export interface PhotoItem {
  id: string;
  url: string;
  path: string;
  label: string;
  context: string; // ex: "controle:{installation_id}" ou "intervention"
  created_at: string;
}

export interface Client {
  id: string;
  nom: string;
  sous_titre: string | null;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  client_id: string;
  nom: string;
  created_at: string;
  updated_at: string;
}

export interface Installation {
  id: string;
  site_id: string;
  repere: string;
  type_porte: string;
  modele: string | null;
  created_at: string;
  updated_at: string;
}

export type EtatControle = 'ok' | 'correction' | 'prevention' | 'na';

export interface PointControle {
  nom: string;
  etat: EtatControle;
  observation: string;
}

export interface PointERP {
  nom: string;
  conforme: boolean;
}

export interface ConstatItem {
  label: string;
  texte: string;
  conforme: boolean;
}

export interface Controle {
  id: string;
  rapport_id: string;
  installation_id: string;
  page_number: number;
  points_controle: PointControle[];
  points_erp: PointERP[];
  created_at: string;
  updated_at: string;
}

export type TypeRapport = 'maintenance' | 'intervention';

export interface PieceUtilisee {
  nom: string;
  quantite: number;
  reference?: string;
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
  description_probleme: string | null;
  travaux_effectues: string | null;
  pieces_utilisees: PieceUtilisee[];
  statut: 'brouillon' | 'finalise';
  signature_data: string | null;
  signature_client: string | null;
  created_at: string;
  updated_at: string;
}

// Types enrichis (avec jointures)
export interface RapportComplet extends Rapport {
  client: Client;
  site: Site;
  controles: (Controle & { installation: Installation })[];
}

// Coordonnées société (constantes)
export const SOCIETE = {
  nom: 'Automatisme et Agencement Calédonien',
  ridet: '0 934 604.003',
  rc: 'CA500000121738',
  telephone: '800808',
  mail: 'contac@bohrdan.com',
  iban: 'FR21 1415 8010 2200 3506 4W05 139',
  codeApe: '43.29B',
} as const;

// Points de contrôle par défaut
export const DEFAULT_POINTS_CONTROLE: PointControle[] = [
  { nom: 'câblages basse tension', etat: 'ok', observation: '' },
  { nom: 'groupe moteur', etat: 'ok', observation: '' },
  { nom: 'platine électronique', etat: 'ok', observation: '' },
  { nom: 'détecteurs', etat: 'ok', observation: '' },
  { nom: 'verrouillage', etat: 'ok', observation: '' },
  { nom: 'boitier de commande', etat: 'ok', observation: '' },
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
  { nom: 'ouverture sur panne réseau', conforme: true },
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

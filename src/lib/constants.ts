/**
 * Constantes de configuration de l'application AAC
 */

// Limites de l'application
export const LIMITS = {
  // Photos
  MAX_PHOTOS_PER_RAPPORT: 10,
  MAX_FILE_SIZE_MB: 10,
  MAX_IMAGE_DIMENSION: 1200,
  IMAGE_QUALITY: 0.8,
  
  // Pagination
  ITEMS_PER_PAGE: 20,
  MAX_PAGES_DISPLAY: 7,
  
  // Upload
  UPLOAD_TIMEOUT_MS: 30000,
} as const;

// Messages d'erreur traduits
export const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  'Invalid login credentials': 'Email ou mot de passe incorrect',
  'Email not confirmed': 'Veuillez confirmer votre email',
  'User already registered': 'Un compte existe déjà avec cet email',
  
  // Network
  'Network request failed': 'Problème de connexion Internet',
  'Failed to fetch': 'Impossible de charger les données',
  
  // Storage
  'File too large': `Fichier trop volumineux (max ${LIMITS.MAX_FILE_SIZE_MB}MB)`,
  'Invalid file type': 'Type de fichier non supporté',
  
  // Generic
  'default': 'Une erreur est survenue. Veuillez réessayer.',
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  RAPPORT_CREATED: 'Rapport créé avec succès',
  RAPPORT_UPDATED: 'Rapport mis à jour',
  RAPPORT_DELETED: 'Rapport supprimé',
  PHOTO_UPLOADED: 'Photo ajoutée',
  PHOTO_DELETED: 'Photo supprimée',
  CLIENT_CREATED: 'Client créé',
  CLIENT_UPDATED: 'Client mis à jour',
} as const;

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CLIENTS: '/clients',
  RAPPORTS: '/rapports',
  NOUVEAU_RAPPORT: '/rapports/nouveau',
} as const;

// Formats de date
export const DATE_FORMATS = {
  DISPLAY: 'dd MMMM yyyy',
  SHORT: 'dd/MM/yyyy',
  ISO: 'yyyy-MM-dd',
} as const;

// Types de rapports
export const RAPPORT_TYPES = {
  MAINTENANCE: 'maintenance',
  INTERVENTION: 'intervention',
} as const;

// Statuts de rapports
export const RAPPORT_STATUTS = {
  BROUILLON: 'brouillon',
  FINALISE: 'finalise',
} as const;

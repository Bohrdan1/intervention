import { ERROR_MESSAGES } from './constants';

/**
 * Traduit un message d'erreur technique en message user-friendly
 */
export function formatErrorMessage(error: unknown): string {
  if (!error) return ERROR_MESSAGES.default;
  
  const message = error instanceof Error ? error.message : String(error);
  
  // Chercher une correspondance dans les messages traduits
  for (const [key, translation] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) {
      return translation;
    }
  }
  
  // Message par défaut
  return ERROR_MESSAGES.default;
}

/**
 * Formate une taille de fichier en format lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

/**
 * Vérifie si un fichier est trop volumineux
 */
export function isFileTooLarge(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size > maxSizeBytes;
}

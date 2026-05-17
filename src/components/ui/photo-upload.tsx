'use client';

import { useState, useRef } from 'react';
import { uploadPhoto, deletePhoto } from '@/lib/actions/photos';
import { LIMITS } from '@/lib/constants';
import type { PhotoItem } from '@/lib/types';

// ── Constantes ────────────────────────────────────────────────────────────

const MAX_WIDTH = 1200;
const QUALITE = 0.82;
// Limite haute avant compression : bloque les fichiers aberrants (vidéos, etc.)
const MAX_ORIGINAL_SIZE_MB = 50;

// ── Helpers ───────────────────────────────────────────────────────────────

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Compresse une image via Canvas (max 1200 px, 0.82 qualité JPEG).
 * Gère le renommage HEIC → .jpg.
 * Fallback transparent : retourne le fichier original si canvas échoue.
 */
async function compresserImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file); // fallback

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file); // fallback
          const compressed = new File(
            [blob],
            file.name.replace(/\.(heic|heif)$/i, '.jpg'),
            { type: 'image/jpeg' }
          );
          resolve(compressed);
        },
        'image/jpeg',
        QUALITE
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fallback : upload l'original
    };

    img.src = objectUrl;
  });
}

// ── Types ─────────────────────────────────────────────────────────────────

interface PhotoUploadProps {
  rapportId: string;
  context: string;
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

type UploadPhase = 'idle' | 'compressing' | 'uploading';

// ── Component ─────────────────────────────────────────────────────────────

export default function PhotoUpload({
  rapportId,
  context,
  photos,
  onPhotosChange,
  maxPhotos = LIMITS.MAX_PHOTOS_PER_RAPPORT,
}: PhotoUploadProps) {
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [currentFile, setCurrentFile] = useState(0);   // 1-indexé
  const [totalFiles, setTotalFiles] = useState(0);
  const [progress, setProgress] = useState(0);         // 0-100
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBusy = phase !== 'idle';

  // ── Upload handler ───────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const slots = maxPhotos - photos.length;
    if (slots <= 0) return;
    const fileArray = Array.from(files).slice(0, slots);
    const total = fileArray.length;
    const steps = total * 2; // compress + upload par fichier

    setTotalFiles(total);
    setPhase('compressing');
    setCurrentFile(1);
    setProgress(0);

    const newPhotos: PhotoItem[] = [];

    for (let i = 0; i < total; i++) {
      const file = fileArray[i];

      try {
        // Refuse les fichiers aberrants (vidéos, très gros binaires)
        if (file.size > MAX_ORIGINAL_SIZE_MB * 1024 * 1024) {
          alert(
            `Fichier trop volumineux : ${file.name}\n` +
            `Maximum autorisé avant compression : ${MAX_ORIGINAL_SIZE_MB} Mo`
          );
          setProgress(Math.round(((i * 2 + 2) / steps) * 100));
          continue;
        }

        // ① Compression
        setPhase('compressing');
        setCurrentFile(i + 1);
        setProgress(Math.round(((i * 2) / steps) * 100));

        const compressed = await compresserImage(file);

        // ② Upload
        setPhase('uploading');
        setProgress(Math.round(((i * 2 + 1) / steps) * 100));

        const id = generateId();
        const path = `rapports/${rapportId}/${context}/${id}.jpg`;

        const formData = new FormData();
        formData.append(
          'file',
          new File([compressed], `${id}.jpg`, { type: 'image/jpeg' })
        );
        formData.append('path', path);

        const result = await uploadPhoto(formData);

        setProgress(Math.round(((i * 2 + 2) / steps) * 100));

        if (!result.success || !result.url) {
          console.error('Upload error:', result.error);
          continue;
        }

        newPhotos.push({
          id,
          url: result.url,
          path,
          label: '',
          context,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Photo processing error:', err);
      }
    }

    if (newPhotos.length > 0) {
      onPhotosChange([...photos, ...newPhotos].slice(0, maxPhotos));
    }

    setPhase('idle');
    setProgress(0);
    setCurrentFile(0);
    setTotalFiles(0);
    if (inputRef.current) inputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Autres handlers ──────────────────────────────────────────────────────

  const handleDelete = async (photo: PhotoItem) => {
    const result = await deletePhoto(photo.path);
    if (!result.success) console.error('Delete error:', result.error);
    onPhotosChange(photos.filter((p) => p.id !== photo.id));
  };

  const handleLabelChange = (photoId: string, label: string) => {
    onPhotosChange(photos.map((p) => (p.id === photoId ? { ...p, label } : p)));
  };

  // ── Label de statut ──────────────────────────────────────────────────────

  const statusLabel =
    phase === 'compressing'
      ? `Optimisation en cours… (${currentFile}/${totalFiles})`
      : phase === 'uploading'
      ? `Envoi en cours… (${currentFile}/${totalFiles})`
      : '';

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          Photos ({photos.length}/{maxPhotos})
        </h4>
        {photos.length < maxPhotos && !isBusy && (
          <div className="flex gap-1.5">
            <label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
              📷 Photo
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
              📁 Fichier
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Barre de progression */}
      {isBusy && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{statusLabel}</span>
            <span className="text-xs font-medium text-primary">{progress} %</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Thumbnails + légendes */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group flex flex-col">
              {/* Vignette */}
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.label || 'Photo'}
                  className="h-24 w-full cursor-pointer rounded-lg object-cover"
                  onClick={() => setPreviewUrl(photo.url)}
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(photo)}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-70 transition-opacity hover:opacity-100"
                >
                  ✕
                </button>
              </div>
              {/* Champ légende */}
              <input
                type="text"
                maxLength={150}
                placeholder="Légende..."
                value={photo.label}
                onChange={(e) => handleLabelChange(photo.id, e.target.value)}
                className="mt-1.5 w-full rounded-md border border-border bg-white px-2 py-2 placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ fontSize: '16px', lineHeight: '1.2' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Preview lightbox */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
          />
          <button
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white text-xl"
            onClick={() => setPreviewUrl(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { uploadPhoto, deletePhoto } from '@/lib/actions/photos';
import { isFileTooLarge, formatFileSize } from '@/lib/utils';
import { LIMITS } from '@/lib/constants';
import type { PhotoItem } from '@/lib/types';

interface PhotoUploadProps {
  rapportId: string;
  context: string;
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

function generateId() {
  // Fallback pour Safari/iPadOS qui ne supporte pas crypto.randomUUID
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let { width, height } = img;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context error'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression error'));
        },
        'image/jpeg',
        0.8
      );
    };
    img.onerror = () => reject(new Error('Image load error'));
    img.src = URL.createObjectURL(file);
  });
}

export default function PhotoUpload({
  rapportId,
  context,
  photos,
  onPhotosChange,
  maxPhotos = LIMITS.MAX_PHOTOS_PER_RAPPORT,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotos: PhotoItem[] = [];

    for (const file of Array.from(files)) {
      try {
        // Validation : taille du fichier
        if (isFileTooLarge(file, LIMITS.MAX_FILE_SIZE_MB)) {
          alert(`Fichier trop volumineux : ${file.name} (${formatFileSize(file.size)})\nMaximum autorisé : ${LIMITS.MAX_FILE_SIZE_MB}MB`);
          continue;
        }

        const compressed = await compressImage(file);
        const id = generateId();
        const path = `rapports/${rapportId}/${context}/${id}.jpg`;

        const formData = new FormData();
        formData.append('file', new File([compressed], `${id}.jpg`, { type: 'image/jpeg' }));
        formData.append('path', path);

        const result = await uploadPhoto(formData);

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
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDelete = async (photo: PhotoItem) => {
    const result = await deletePhoto(photo.path);
    if (!result.success) console.error('Delete error:', result.error);
    onPhotosChange(photos.filter((p) => p.id !== photo.id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          Photos ({photos.length}/{maxPhotos})
        </h4>
        {photos.length < maxPhotos && (
          <label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
            {uploading ? 'Envoi...' : '+ Ajouter'}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative flex-shrink-0">
              <img
                src={photo.url}
                alt={photo.label || 'Photo'}
                className="h-20 w-20 cursor-pointer rounded-lg object-cover"
                onClick={() => setPreviewUrl(photo.url)}
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                ✕
              </button>
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

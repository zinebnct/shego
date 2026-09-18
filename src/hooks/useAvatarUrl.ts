import { useEffect, useState } from 'react';
import { getPhotoUrl } from '@/services/profile.service';

const TTL_MS = 50 * 60 * 1000; // URL signée valable 1 h : on la renouvelle avant l'échéance
const cache = new Map<string, { url: string; expiresAt: number }>();

const fromCache = (path: string): string | null => {
  const hit = cache.get(path);
  return hit && hit.expiresAt > Date.now() ? hit.url : null;
};

/** Résout un chemin d'avatar (`users.photo_url`) en URL signée courte durée (bucket `avatars` privé). */
export function useAvatarUrl(photoPath: string | null | undefined): string | null {
  const [fetched, setFetched] = useState<{ path: string; url: string } | null>(null);
  const cached = photoPath ? fromCache(photoPath) : null;

  useEffect(() => {
    if (!photoPath || fromCache(photoPath)) return;
    let active = true;
    void getPhotoUrl(photoPath).then((result) => {
      if (!active || result.error) return;
      cache.set(photoPath, { url: result.data, expiresAt: Date.now() + TTL_MS });
      setFetched({ path: photoPath, url: result.data });
    });
    return () => {
      active = false;
    };
  }, [photoPath]);

  if (!photoPath) return null;
  return cached ?? (fetched?.path === photoPath ? fetched.url : null);
}

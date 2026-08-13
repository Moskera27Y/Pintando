import { useEffect, useState } from 'react';

export type MediaItem = {
  id: string;
  title: string;
  description: string | null;
  blobUrl: string;
  thumbnailUrl: string | null;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  category: string;
  status: string;
  displayOrder: number;
  tags: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');

const cache = new Map<string, MediaItem[]>();
const inflight = new Map<string, Promise<MediaItem[]>>();

async function fetchCategory(category: string): Promise<MediaItem[]> {
  if (cache.has(category)) return cache.get(category)!;
  if (inflight.has(category)) return inflight.get(category)!;

  const promise = fetch(`${API_BASE}/media?action=public&category=${encodeURIComponent(category)}`)
    .then((r) => (r.ok ? r.json() : []))
    .then((items: MediaItem[]) => {
      cache.set(category, items);
      inflight.delete(category);
      return items;
    })
    .catch(() => {
      inflight.delete(category);
      return [];
    });

  inflight.set(category, promise);
  return promise;
}

export function refreshMedia(category?: string) {
  if (category) {
    cache.delete(category);
  } else {
    cache.clear();
  }
}

export function useMediaByCategory(category: string): MediaItem[] {
  const [items, setItems] = useState<MediaItem[]>(() => cache.get(category) || []);

  useEffect(() => {
    let active = true;
    const cached = cache.get(category);
    if (cached) {
      setItems(cached);
      return;
    }
    fetchCategory(category).then((data) => {
      if (active) setItems(data);
    });
    return () => { active = false; };
  }, [category]);

  return items;
}

export function useMediaImage(category: string, fallback: string): string {
  const items = useMediaByCategory(category);
  const featured = items.find((m) => m.featured);
  return featured?.blobUrl || items[0]?.blobUrl || fallback;
}

export function useMediaImages(category: string, fallbacks: string[]): string[] {
  const items = useMediaByCategory(category);
  if (items.length >= fallbacks.length) {
    return items.slice(0, fallbacks.length).map((m) => m.blobUrl);
  }
  const urls = items.map((m) => m.blobUrl);
  while (urls.length < fallbacks.length) {
    urls.push(fallbacks[urls.length]);
  }
  return urls;
}

const IMAGE_ALIASES: Record<string, string> = {
  '/imagenes/clientes/reseña.png': '/imagenes/clientes/resena-destacada.png',
  '/imagenes/clientes/resena.png': '/imagenes/clientes/resena-destacada.png',
};

export const GALLERY_IMAGE_FALLBACK = '/imagenes/local/lugar1.jpg';

export function normalizePublicImageUrl(url?: string | null): string {
  const raw = String(url || '').trim();
  if (!raw) return GALLERY_IMAGE_FALLBACK;
  let path = raw;
  try {
    path = decodeURIComponent(raw);
  } catch {
    path = raw;
  }
  if (IMAGE_ALIASES[raw]) return IMAGE_ALIASES[raw];
  if (IMAGE_ALIASES[path]) return IMAGE_ALIASES[path];
  if (/rese[nñ]a\.png$/i.test(path) && !/resena-destacada/i.test(path)) {
    return '/imagenes/clientes/resena-destacada.png';
  }
  return path;
}

export function handlePublicImageError(event: { currentTarget: HTMLImageElement }) {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied === '1') return;
  img.dataset.fallbackApplied = '1';
  img.src = GALLERY_IMAGE_FALLBACK;
}

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
  const current = img.getAttribute('src') || '';
  if (!img.dataset.webpFallback && /\.webp$/i.test(current)) {
    img.dataset.webpFallback = '1';
    img.src = current.replace(/\.webp$/i, '.jpg');
    return;
  }
  if (img.dataset.fallbackApplied === '1') return;
  img.dataset.fallbackApplied = '1';
  img.src = GALLERY_IMAGE_FALLBACK;
}

export function imageAlt(value?: string | null, fallback = ''): string {
  const text = String(value || '').trim();
  return text || fallback;
}

const GALLERY_ALT_BY_FILE: Record<string, string> = {
  'lugar1.jpg': 'gallery_alt_interior',
  'lugar2.jpg': 'gallery_alt_cozy',
  'lugar3.jpg': 'gallery_alt_tables',
  'lugar4.jpg': 'gallery_alt_coffee',
  'lugar5.jpg': 'gallery_alt_details',
  'lugar6.jpg': 'gallery_alt_family',
  'resena-destacada.png': 'gallery_alt_review_featured',
  'reseña.png': 'gallery_alt_review_featured',
  'cliente1.jpg': 'gallery_alt_review_1',
  'cliente2.jpg': 'gallery_alt_review_2',
  'cliente3.jpg': 'gallery_alt_review_3',
  'cliente4.jpg': 'gallery_alt_review_4',
  'cliente5.jpg': 'gallery_alt_review_5',
};

export function galleryAltKeyForSrc(src?: string | null): string {
  const path = String(src || '').split('?')[0].toLowerCase();
  let file = path.split('/').pop() || '';
  if (file.endsWith('.webp')) {
    file = /resena|reseña/.test(file) ? file.replace(/\.webp$/i, '.png') : file.replace(/\.webp$/i, '.jpg');
  }
  return GALLERY_ALT_BY_FILE[file] || GALLERY_ALT_BY_FILE[file.replace(/\.jpg$/i, '.png')] || '';
}

export function optimizedImageUrl(url?: string | null): string {
  const path = normalizePublicImageUrl(url);
  return path.replace(/\.(jpe?g|png)$/i, '.webp');
}

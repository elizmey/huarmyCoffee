import { apiUrl } from '../api';

export function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = localStorage.getItem('adminToken');
  return {
    Authorization: `Bearer ${token || ''}`,
    ...extra,
  };
}

export function getJsonAuthHeaders(): Record<string, string> {
  return getAuthHeaders({ 'Content-Type': 'application/json' });
}

export type StoredAdminUser = {
  id: number | string;
  nombre: string;
  email: string;
  rol: string;
  sucursal_id?: number | null;
};

export function getStoredAdminUser(): StoredAdminUser | null {
  try {
    const raw = localStorage.getItem('adminUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

export async function adminFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getJsonAuthHeaders(),
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(apiUrl(path), { ...options, headers });
  } catch {
    throw new ApiError('No se puede conectar con el API. Asegúrate de ejecutar npm run api (puerto 3001).', 0);
  }

  const data = await res.json().catch(() => ({} as T));
  if (!res.ok) {
    const msg = (data as { error?: string }).error || `Error del servidor (${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

export async function adminFetchList<T = unknown>(path: string): Promise<T[]> {
  const data = await adminFetch<T[] | { error?: string }>(path);
  return Array.isArray(data) ? data : [];
}

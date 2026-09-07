const API_BASE = process.env.REACT_APP_API_URL || '/api';

export function apiUrl(path = '') {
  const cleanBase = API_BASE.replace(/\/$/, '');
  const cleanPath = String(path).replace(/^\//, '');
  return cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;
}

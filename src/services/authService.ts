import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { apiUrl } from '../api';

export type AdminUser = {
  id: string | number;
  nombre: string;
  email: string;
  rol: string;
  sucursal_id?: number | null;
  activo?: boolean;
};

async function loginWithPostgres(email: string, password: string): Promise<AdminUser> {
  let res: Response;
  try {
    res = await fetch(apiUrl('/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });
  } catch {
    throw new Error('No se puede conectar con el API. Ejecuta npm run api en otra terminal (puerto 3001).');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Credenciales inválidas');
  }

  const user: AdminUser = data.user;
  localStorage.setItem('adminToken', data.token);
  localStorage.setItem('adminUser', JSON.stringify(user));
  localStorage.setItem('authProvider', 'postgres');
  localStorage.removeItem('firebaseToken');
  return user;
}

/** Inicio de sesión admin: JWT PostgreSQL (requerido para el panel). Firebase es opcional. */
export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const user = await loginWithPostgres(email, password);

  try {
    if (auth) {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const firebaseToken = await credential.user.getIdToken();
      localStorage.setItem('firebaseToken', firebaseToken);
    }
  } catch {
    /* Firebase opcional; el panel funciona solo con PostgreSQL */
  }

  return user;
}

export async function requestPasswordReset(email: string): Promise<{ message: string; resetUrl?: string }> {
  let res: Response;
  try {
    res = await fetch(apiUrl('/forgot-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
  } catch {
    throw new Error('No se puede conectar con el API. Ejecuta npm run api (puerto 3001).');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'No se pudo solicitar el restablecimiento');
  return data;
}

export async function resetPassword(token: string, password: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl('/reset-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
  } catch {
    throw new Error('No se puede conectar con el API. Ejecuta npm run api (puerto 3001).');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'No se pudo actualizar la contraseña');
}

export async function logoutAdmin(): Promise<void> {
  try {
    if (auth) await signOut(auth);
  } catch {
    /* ignore */
  }
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  localStorage.removeItem('firebaseToken');
  localStorage.removeItem('authProvider');
}

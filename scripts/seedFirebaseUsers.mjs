/**
 * Crea usuarios en Firebase Auth y perfiles en Firestore (colección usuarios).
 * Ejecutar: node scripts/seedFirebaseUsers.mjs
 */
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env") });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Copia .env.example a .env y complétala.`);
  }
  return value;
}

const API_KEY = requireEnv("REACT_APP_FIREBASE_API_KEY");
const PROJECT_ID = requireEnv("REACT_APP_FIREBASE_PROJECT_ID");

const ADMIN_EMAIL = requireEnv("SEED_ADMIN_EMAIL");
const ADMIN_PASSWORD = requireEnv("SEED_ADMIN_PASSWORD");
const RECEPCIONISTA_EMAIL = requireEnv("SEED_RECEPCIONISTA_EMAIL");
const RECEPCIONISTA_PASSWORD = requireEnv("SEED_RECEPCIONISTA_PASSWORD");

const USERS = [
  {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    profile: {
      nombre: "Administrador",
      email: ADMIN_EMAIL,
      rol: "admin",
      activo: true,
      sucursal_id: 1,
    },
  },
  {
    email: RECEPCIONISTA_EMAIL,
    password: RECEPCIONISTA_PASSWORD,
    profile: {
      nombre: "Recepcionista",
      email: RECEPCIONISTA_EMAIL,
      rol: "recepcionista",
      activo: true,
      sucursal_id: 1,
    },
  },
];

async function signUp(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "signUp failed");
  return { uid: data.localId, idToken: data.idToken };
}

async function signIn(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "signIn failed");
  return { uid: data.localId, idToken: data.idToken };
}

async function writeFirestoreDoc(uid, profile, idToken) {
  const fields = {
    nombre: { stringValue: profile.nombre },
    email: { stringValue: profile.email },
    rol: { stringValue: profile.rol },
    activo: { booleanValue: profile.activo },
  };
  if (profile.sucursal_id != null) {
    fields.sucursal_id = { integerValue: String(profile.sucursal_id) };
  }

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/usuarios/${uid}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore write failed: ${err}`);
  }
}

async function ensureUser({ email, password, profile }) {
  let uid, idToken;
  try {
    const r = await signUp(email, password);
    uid = r.uid;
    idToken = r.idToken;
    console.log(`✅ Auth creado: ${email}`);
  } catch (e) {
    if (String(e.message).includes("EMAIL_EXISTS")) {
      const r = await signIn(email, password);
      uid = r.uid;
      idToken = r.idToken;
      console.log(`⚠️ Auth ya existía: ${email}`);
    } else {
      throw e;
    }
  }

  await writeFirestoreDoc(uid, profile, idToken);
  console.log(`✅ Firestore usuarios/${uid} actualizado (${profile.rol})`);
}

async function main() {
  console.log("Sembrando usuarios Firebase Auth + Firestore...\n");
  for (const user of USERS) {
    try {
      await ensureUser(user);
    } catch (err) {
      console.error(`❌ ${user.email}:`, err.message);
    }
  }
  console.log("\nListo. Credenciales configuradas en .env (SEED_ADMIN_*, SEED_RECEPCIONISTA_*).");
}

main();

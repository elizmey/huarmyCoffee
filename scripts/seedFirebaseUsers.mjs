/**
 * Crea usuarios en Firebase Auth y perfiles en Firestore (colección usuarios).
 * Ejecutar: node scripts/seedFirebaseUsers.mjs
 */
const API_KEY = "AIzaSyCE8V6B8xBc8DO98TpZxSGefLulU5b7tyM";
const PROJECT_ID = "huarmy-coffee";

const USERS = [
  {
    email: "admin@huarmycoffee.com",
    password: "admin123",
    profile: {
      nombre: "Administrador",
      email: "admin@huarmycoffee.com",
      rol: "admin",
      activo: true,
      sucursal_id: 1,
    },
  },
  {
    email: "recepcionista@huarmycoffee.com",
    password: "recepcionista123",
    profile: {
      nombre: "Recepcionista",
      email: "recepcionista@huarmycoffee.com",
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
  console.log("\nListo. Credenciales:");
  console.log("  Admin: admin@huarmycoffee.com / admin123");
  console.log("  Recepcionista: recepcionista@huarmycoffee.com / recepcionista123");
}

main();

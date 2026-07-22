import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCE8V6B8xBc8DO98TpZxSGefLulU5b7tyM",
  authDomain: "huarmy-coffee.firebaseapp.com",
  projectId: "huarmy-coffee",
  storageBucket: "huarmy-coffee.firebasestorage.app",
  messagingSenderId: "737736170425",
  appId: "1:737736170425:web:386cd10decc089c8c57468",
  measurementId: "G-50XLTBE0BS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const fetchData = async () => {
  try {
    const menuDoc = await getDoc(doc(db, "huarmy", "menu"));
    const promoDoc = await getDoc(doc(db, "huarmy", "promociones"));

    return {
      menu: menuDoc.exists() ? menuDoc.data() : null,
      promociones: promoDoc.exists() ? promoDoc.data() : null,
    };
  } catch (error) {
    console.warn("Error al leer de Firebase:", error);
    return { menu: null, promociones: null };
  }
};

export const saveMenu = async (menuData) => {
  try {
    await setDoc(doc(db, "huarmy", "menu"), menuData);
    return true;
  } catch (error) {
    console.warn("Error al guardar menu:", error);
    return false;
  }
};

export const savePromociones = async (promoData) => {
  try {
    await setDoc(doc(db, "huarmy", "promociones"), promoData);
    return true;
  } catch (error) {
    console.warn("Error al guardar promociones:", error);
    return false;
  }
};

export const fetchPassword = async () => {
  try {
    const configDoc = await getDoc(doc(db, "huarmy", "config"));
    if (configDoc.exists() && configDoc.data().password) {
      return configDoc.data().password;
    }
    return null;
  } catch (error) {
    console.warn("Error al leer contrasena:", error);
    return null;
  }
};

export const savePassword = async (password) => {
  try {
    await setDoc(doc(db, "huarmy", "config"), { password });
    return true;
  } catch (error) {
    console.warn("Error al guardar contrasena:", error);
    return false;
  }
};

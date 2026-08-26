import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCE8V6B8xBc8DO98TpZxSGefLulU5b7tyM",
  authDomain: "huarmy-coffee.firebaseapp.com",
  projectId: "huarmy-coffee",
  storageBucket: "huarmy-coffee.firebasestorage.app",
  messagingSenderId: "737736170425",
  appId: "1:737736170425:web:386cd10decc089c8c57468",
  measurementId: "G-50XLTBE0BS",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (err) {
  console.warn("Firebase Analytics no disponible en este entorno", err);
}
export { analytics };

export default app;

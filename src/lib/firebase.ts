import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBoj87viiu1t0pjh4MrAvbCHuegngv5j3I",
  authDomain: "edu-quest-b697c.firebaseapp.com",
  projectId: "edu-quest-b697c",
  storageBucket: "edu-quest-b697c.firebasestorage.app",
  messagingSenderId: "388961698639",
  appId: "1:388961698639:web:33617da8464b0a6521bb3a",
  measurementId: "G-5BB0QL70KG"
};

let app;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;
let isFirebaseFallback = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  googleProviderInstance = new GoogleAuthProvider();
  console.log("Firebase berhasil diinisialisasi.");
} catch (error) {
  console.warn("Firebase gagal diinisialisasi, beralih ke Mode Lokal (Fallback LocalStorage):", error);
  isFirebaseFallback = true;
}

export { isFirebaseFallback };
export const auth = authInstance;
export const db = dbInstance;
export const googleProvider = googleProviderInstance;

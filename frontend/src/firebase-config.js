import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // ✅

const firebaseConfig = {
  apiKey: "AIzaSyDtF0AbQPSKxulufYfbZxPM-aYzhryHjaE",
  authDomain: "vuelanding-app.firebaseapp.com",
  projectId: "vuelanding-app",
  storageBucket: "vuelanding-app.appspot.com", // 👈 asegurate de que esté bien escrito (.appspot.com)
  messagingSenderId: "105233875789",
  appId: "1:105233875789:web:522d450225e5f9c0836d04",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // ✅

// 👇 agrega esta línea temporal para debug
if (typeof window !== "undefined") window.auth = auth;

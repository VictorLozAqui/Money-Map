import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Analytics (opcional)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Inicializa o Auth e configura persistência local
export const auth = getAuth(app);

// Configura a persistência para manter o usuário logado
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Erro ao configurar persistência:', error);
});

export const db = getFirestore(app);
export { analytics };
export default app;


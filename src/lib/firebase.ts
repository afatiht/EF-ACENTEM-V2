import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB-FVge6GSNBQTQUIceHGKodSThg2ZbCeo",
  authDomain: "sigorta-takip.firebaseapp.com",
  projectId: "sigorta-takip",
  storageBucket: "sigorta-takip.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
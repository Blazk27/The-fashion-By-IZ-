import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBMOCu7EzJvqgjJ7U9uHyUMD48MQKoWjzk",
  authDomain: "the-fashion-by-iz.firebaseapp.com",
  projectId: "the-fashion-by-iz",
  storageBucket: "the-fashion-by-iz.firebasestorage.app",
  messagingSenderId: "604743663126",
  appId: "1:604743663126:web:481ce2a9c379ecbd237f37"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Telegram Bot Configuration
export const TELEGRAM_BOT_TOKEN = '';
export const TELEGRAM_CHAT_ID = '';

// Admin credentials fallback
export const ADMIN_PASSWORD = '212721';

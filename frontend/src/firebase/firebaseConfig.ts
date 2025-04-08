import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCC-Kews6zKmGbqEGqqFAio6nzLoHhW1yM",
  authDomain: "blackjack-f78d6.firebaseapp.com",
  projectId: "blackjack-f78d6",
  storageBucket: "blackjack-f78d6.firebasestorage.app",
  messagingSenderId: "120417293528",
  appId: "1:120417293528:web:23840aca18c76f9a7873ad",
};

// Initialize Firebase (no need to export since I'm not using)
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);

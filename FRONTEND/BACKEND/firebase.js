// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcW6RjhBsAdVq23W-se0Bwpd9LQ8C6AcI",
  authDomain: "opgbudgetmonitoring.firebaseapp.com",
  projectId: "opgbudgetmonitoring",
  storageBucket: "opgbudgetmonitoring.firebasestorage.app",
  messagingSenderId: "557121562025",
  appId: "1:557121562025:web:13e6d6919a2886959350b8",
  measurementId: "G-SRLNQZW49W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, db, auth, storage };

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA96bURjYzYQ846NprGKlWSBR4i5tShvwA",
  authDomain: "sentinelles-ci.firebaseapp.com",
  projectId: "sentinelles-ci",
  storageBucket: "sentinelles-ci.firebasestorage.app",
  messagingSenderId: "158724923831",
  appId: "1:158724923831:web:82204029b754a9c1f34832",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

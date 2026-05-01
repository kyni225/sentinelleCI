import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, increment, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA96bURjYzYQ846NprGKlWSBR4i5tShvwA",
  authDomain: "sentinelles-ci.firebaseapp.com",
  projectId: "sentinelles-ci",
  storageBucket: "sentinelles-ci.firebasestorage.app",
  messagingSenderId: "158724923831",
  appId: "1:158724923831:web:0aff32ddad796ad6f34832"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ─── Citoyen ───
export function phoneToEmail(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return `${cleaned}@sentinelle.ci`;
}

export async function registerCitizen(name, phone, password) {
  const email = phoneToEmail(phone);
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    name,
    phone,
    email,
    createdAt: Date.now(),
  });
  return cred;
}

export async function loginCitizen(phone, password) {
  const email = phoneToEmail(phone);
  return await signInWithEmailAndPassword(auth, email, password);
}

// ─── Mairie ───
export async function registerMairie(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    name,
    email,
    role: "mairie",
    createdAt: Date.now(),
  });
  return cred;
}

export async function loginMairie(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  await signOut(auth);
}

// ─── Signalements temps réel ───
export function onSignalements(callback) {
  const q = query(collection(db, "signalements"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

export async function updateStatus(id, status) {
  await updateDoc(doc(db, "signalements", id), { status });
}

export async function upvoteReport(id) {
  await updateDoc(doc(db, "signalements", id), { upvotes: increment(1) });
}

export { onAuthStateChanged };

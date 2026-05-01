import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { environment } from '../environments/environment';

const app = initializeApp(environment.firebase);
const auth = getAuth(app);
const firestore = getFirestore(app);

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export interface Signalement {
  id: string;
  number: string;
  category: string;
  description: string;
  photoUris: string[];
  quartier: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: number;
  authorPseudo: string;
  isAnonymous: boolean;
  status: 'soumis' | 'valide' | 'en_cours' | 'resolu';
  history: { status: string; at: number; note?: string }[];
  ai: { severity: string; priority: string; duplicates: number; confidence: number; summary: string };
  upvotes: number;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private _user: User | null = null;

  get user() { return this._user; }
  get isLoggedIn() { return !!this._user; }

  constructor() {
    onAuthStateChanged(auth, (u) => { this._user = u; });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  logout() {
    return signOut(auth);
  }

  // Écoute temps réel des signalements
  onSignalements(callback: (list: Signalement[]) => void) {
    const q = query(collection(firestore, 'signalements'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const list: Signalement[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          number: data['number'] ?? 'S???',
          category: data['category'] ?? '',
          description: data['description'] ?? '',
          photoUris: data['photoUris'] ?? [],
          quartier: data['quartier'] ?? '',
          address: data['address'] ?? '',
          latitude: data['latitude'] ?? 0,
          longitude: data['longitude'] ?? 0,
          createdAt: data['createdAt'] ?? 0,
          authorPseudo: data['authorPseudo'] ?? '',
          isAnonymous: data['isAnonymous'] ?? false,
          status: data['status'] ?? 'soumis',
          history: data['history'] ?? [],
          ai: data['ai'] ?? { severity: 'faible', priority: 'P3', duplicates: 0, confidence: 50, summary: '' },
          upvotes: data['upvotes'] ?? 0,
        };
      });
      callback(list);
    });
  }

  // Changer le statut d'un signalement
  async updateStatus(id: string, status: string, note?: string) {
    const ref = doc(firestore, 'signalements', id);
    await updateDoc(ref, { status });
  }

  // Soutenir un signalement
  async upvote(id: string) {
    const ref = doc(firestore, 'signalements', id);
    await updateDoc(ref, { upvotes: increment(1) });
  }

  // Initialiser RecaptchaVerifier (appelé une seule fois)
  initRecaptcha(containerId: string) {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
      });
    }
  }

  // Envoyer OTP par téléphone
  async sendOtp(phoneNumber: string): Promise<ConfirmationResult> {
    if (!window.recaptchaVerifier) {
      throw new Error('RecaptchaVerifier non initialisé');
    }
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    return await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
  }

  // Vérifier le code OTP
  async verifyOtp(confirmationResult: ConfirmationResult, code: string) {
    return await confirmationResult.confirm(code);
  }

  // Formater le numéro de téléphone pour la Côte d'Ivoire (+225)
  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith('225')) {
      cleaned = '225' + cleaned;
    }
    return '+' + cleaned;
  }
}

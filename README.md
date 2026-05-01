# 🛡️ Citizen-Signal — SentinelleCI

Plateforme civique de signalement de problèmes urbains. Les citoyens signalent, la mairie traite, la blockchain certifie.

---

## 📐 Architecture du projet

```
Citizen-Signal/
├── artifacts/
│   ├── citizen-web/          → Application web Citoyen (React + Vite)
│   ├── mairie-dashboard/     → Tableau de bord Mairie (Angular)
│   └── sentinelle-ci/        → Application mobile native (Expo / React Native)
└── README.md
```

---

## 🌐 citizen-web — Application Citoyen (Web)

### Description

Interface web responsive pour les citoyens : inscription, connexion, signalement de problèmes, suivi en temps réel, carte interactive, profil et badges. Inclut aussi un portail mairie avec tableau de bord de gestion.

### Technologies

| Outil | Version | Rôle |
|---|---|---|
| **React** | 19.1+ | Framework UI (composants fonctionnels, hooks) |
| **React Router DOM** | 7.6+ | Navigation SPA (routes, paramètres) |
| **Vite** | 6.3+ | Build tool et serveur de développement |
| **Firebase** | 12.12+ | Authentification + Firestore (base de données temps réel) |
| **JavaScript (ES Modules)** | ES2022+ | Langage principal |

### Structure des fichiers

```
citizen-web/
├── public/                     → Fichiers statiques
├── src/
│   ├── main.jsx                → Point d'entrée React
│   ├── App.jsx                 → Routes principales
│   ├── firebase.js             → Configuration Firebase + fonctions auth/CRUD
│   ├── constants.js            → Constantes partagées (CATS, STATUS_META, SEVERITY_META, QUARTIERS)
│   ├── utils.js                → Fonctions utilitaires (formatDate, timeAgo, shortHash)
│   ├── components/
│   │   └── BottomNav.jsx       → Barre de navigation inférieure partagée
│   ├── pages/
│   │   ├── Accueil.jsx         → Page d'accueil (choix citoyen/administrateur)
│   │   ├── Inscription.jsx     → Inscription citoyen (téléphone + mot de passe)
│   │   ├── Connexion.jsx       → Connexion citoyen
│   │   ├── CitoyenHome.jsx     → Accueil citoyen (fil d'actualité, stats)
│   │   ├── Signaler.jsx        → Formulaire de signalement (catégorie, photo, quartier, description)
│   │   ├── MesSignalements.jsx → Suivi des signalements du citoyen (filtres, compteurs)
│   │   ├── Carte.jsx           → Carte interactive avec pins et légende priorités
│   │   ├── Profil.jsx          → Profil citoyen (score, badges, réglages, confidentialité)
│   │   ├── SignalementDetail.jsx → Détail d'un signalement (IA, blockchain, timeline)
│   │   ├── MairieLogin.jsx     → Connexion administrateur
│   │   ├── MairieInscription.jsx → Inscription administrateur
│   │   └── MairieDashboard.jsx → Tableau de bord administrateur (gestion des signalements)
│   └── index.css               → Styles globaux
├── index.html                  → Template HTML
├── vite.config.js              → Configuration Vite
├── netlify.toml                → Configuration déploiement Netlify
├── package.json                → Dépendances et scripts
└── .gitignore
```

### Installation et lancement

```bash
# 1. Aller dans le dossier
cd artifacts/citizen-web

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev
# → http://localhost:3000

# 4. Builder pour la production
npm run build
# → Dossier dist/ généré

# 5. Prévisualiser le build
npm run preview
```

### Routes de l'application

| Route | Page | Description |
|---|---|---|
| `/` | Accueil | Choix citoyen / administrateur |
| `/inscription` | Inscription | Créer un compte citoyen |
| `/connexion` | Connexion | Se connecter (citoyen) |
| `/citoyen` | CitoyenHome | Fil d'actualité + stats |
| `/signaler` | Signaler | Nouveau signalement |
| `/mes-signalements` | MesSignalements | Suivi de mes signalements |
| `/carte` | Carte | Carte interactive |
| `/profil` | Profil | Profil, badges, réglages |
| `/signalement/:id` | SignalementDetail | Détail d'un signalement |
| `/mairie` | MairieLogin | Connexion administrateur |
| `/mairie/inscription` | MairieInscription | Créer un compte administrateur |
| `/mairie/dashboard` | MairieDashboard | Tableau de bord administrateur |

### Déploiement (Netlify)

1. Builder le projet : `npm run build`
2. Aller sur [app.netlify.com/drop](https://app.netlify.com/drop)
3. Glisser-déposer le dossier `dist/`
4. L'URL publique est générée automatiquement

---

## 🏛️ mairie-dashboard — Tableau de bord Administrateur (Angular)

### Description

Interface d'administration pour les administrateurs communaux : visualisation des signalements en temps réel, filtres par statut/priorité, changement de statut, carte Leaflet.

### Technologies

| Outil | Version | Rôle |
|---|---|---|
| **Angular** | 21.2+ | Framework UI complet |
| **TypeScript** | 5.9+ | Langage typé |
| **Angular Fire** | 20.0+ | Intégration Firebase officielle |
| **Firebase** | 12.12+ | Auth + Firestore |
| **Leaflet** | 1.9+ | Carte interactive |
| **RxJS** | 7.8+ | Programmation réactive |
| **pnpm** | 10.33+ | Gestionnaire de paquets |

### Installation et lancement

```bash
# 1. Aller dans le dossier
cd artifacts/mairie-dashboard

# 2. Installer pnpm si nécessaire
npm install -g pnpm

# 3. Installer les dépendances
pnpm install

# 4. Lancer en développement
pnpm start
# → http://localhost:4200

# 5. Builder pour la production
pnpm build
```

---

## 📱 sentinelle-ci — Application Mobile Native (Expo)

### Description

Application mobile native iOS/Android pour les citoyens. Même fonctionnalité que citizen-web mais avec accès natif (appareil photo, géolocalisation, haptics).

### Technologies

| Outil | Version | Rôle |
|---|---|---|
| **Expo** | 54.0+ | Framework mobile (build OTA, EAS) |
| **React Native** | 0.81+ | Rendu natif iOS/Android |
| **Expo Router** | 6.0+ | Navigation file-based |
| **TypeScript** | 5.9+ | Langage typé |
| **Firebase** | 12.12+ | Auth + Firestore |
| **React Native Reanimated** | 4.1+ | Animations fluides |
| **React Native SVG** | 15.12+ | Icônes vectorielles |
| **Expo Image Picker** | 17.0+ | Accès appareil photo |
| **Expo Location** | 19.0+ | Géolocalisation |
| **Expo Linear Gradient** | 15.0+ | Dégradés natifs |
| **Expo Haptics** | 15.0+ | Retour haptique |
| **TanStack React Query** | — | Gestion de cache serveur |
| **Zod** | — | Validation de schémas |

### Installation et lancement

```bash
# 1. Aller dans le dossier
cd artifacts/sentinelle-ci

# 2. Installer les dépendances
pnpm install

# 3. Lancer en développement
pnpm dev
# → Ouvre Expo Dev Tools

# 4. Scanner le QR code avec l'app Expo Go sur votre téléphone
```

---

## 🔥 Firebase — Backend partagé

Les 3 applications partagent le même projet Firebase :

| Service | Usage |
|---|---|
| **Authentication** | Inscription/connexion citoyen (email+mdp) et administrateur (email+mdp) |
| **Cloud Firestore** | Base de données NoSQL temps réel |
| **Storage** | (à configurer) Stockage des photos de signalements |

### Collections Firestore

| Collection | Champs principaux |
|---|---|
| `users` | uid, name, phone, email, role (citoyen/admin), createdAt |
| `signalements` | category, description, quartier, address, status, authorId, authorPseudo, photoUris, upvotes, ai (priority, severity, confidence, duplicates), blockchain (txHash, blockNumber), createdAt |

### Configuration Firebase

Le fichier `citizen-web/src/firebase.js` contient la configuration. Pour un nouveau projet Firebase :

1. Créer un projet sur [console.firebase.google.com](https://console.firebase.google.com)
2. Activer **Authentication** → Email/Mot de passe
3. Créer une base **Firestore** en mode test
4. Remplacer les clés dans `firebase.js` avec vos propres credentials

---

## 🎨 Design & UX

- **Palette** : Vert citoyen `#006B3F`, Orange action `#FF6700`, Fond crème `#FAFAF7`, Bordures `#E5DCC9`
- **Typographie** : Système, poids 400-800
- **Navigation** : Bottom nav avec bouton central "Signaler" surélevé (FAB orange)
- **Badges IA** : P1 (rouge, urgent), P2 (orange, important), P3 (gris, normal)
- **Statuts** : Soumis (gris), Validé (bleu), En cours (orange), Résolu (vert)
- **Blockchain** : Preuve d'intégrité avec hash raccourci (0x1234…5678)

---

## 🚀 Déploiement rapide

| Application | Méthode | Commande |
|---|---|---|
| citizen-web | Netlify (drag & drop) | `npm run build` → déposer `dist/` sur Netlify |
| mairie-dashboard | Netlify / Vercel | `pnpm build` → déposer `dist/` |
| sentinelle-ci | EAS Build | `eas build --platform android` |

---

## 📋 Prérequis système

| Outil | Version minimale | Installation |
|---|---|---|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **npm** | 9+ | Inclus avec Node.js |
| **pnpm** | 10+ | `npm install -g pnpm` |
| **Git** | 2.40+ | [git-scm.com](https://git-scm.com) |
| **Expo CLI** | — | `npm install -g @expo/cli` (pour sentinelle-ci) |

---

## 📄 Licence

Projet privé — Tous droits réservés.

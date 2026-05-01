export const CATS = {
  routes: { label: 'Routes', hue: '#1E3A5F', icon: '🛣️' },
  eclairage: { label: 'Éclairage', hue: '#F59E0B', icon: '💡' },
  eau: { label: 'Eau', hue: '#0EA5E9', icon: '💧' },
  ecoles: { label: 'Écoles', hue: '#7C3AED', icon: '🏫' },
  dechets: { label: 'Déchets', hue: '#16A34A', icon: '🗑️' },
  sante: { label: 'Santé', hue: '#DC2626', icon: '🏥' },
  securite: { label: 'Sécurité', hue: '#475569', icon: '🚨' },
  transport: { label: 'Transport', hue: '#0891B2', icon: '🚌' },
  logement: { label: 'Logement', hue: '#A855F7', icon: '🏠' },
  pollution: { label: 'Pollution', hue: '#6B7280', icon: '🏭' },
  inondation: { label: 'Inondation', hue: '#2563EB', icon: '🌊' },
  nuisances: { label: 'Nuisances', hue: '#EA580C', icon: '📢' },
  voirie: { label: 'Voirie', hue: '#CA8A04', icon: '🚧' },
  autre: { label: 'Autre', hue: '#9333EA', icon: '📌' },
}

export const STATUS_ORDER = ['soumis', 'valide', 'en_cours', 'resolu']

export const STATUS_META = {
  soumis: { label: 'Soumis', color: '#475569', bg: '#E2E8F0' },
  valide: { label: 'Validé', color: '#0369A1', bg: '#DBEAFE' },
  en_cours: { label: 'En cours', color: '#B45309', bg: '#FEF3C7' },
  resolu: { label: 'Résolu', color: '#15803D', bg: '#DCFCE7' },
}

export const SEVERITY_META = {
  faible: { label: 'Faible', color: '#15803D', bg: '#DCFCE7' },
  moyen: { label: 'Moyen', color: '#B45309', bg: '#FEF3C7' },
  critique: { label: 'Critique', color: '#DC2626', bg: '#FEE2E2' },
}

export const QUARTIERS = [
  'Cocody', 'Plateau', 'Marcory', 'Treichville', 'Adjame',
  'Yopougon', 'Abobo', 'Koumassi', 'Port-Bouet', 'Attecoube',
  'Songon', 'Bingerville',
]

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Accueil from './pages/Accueil'
import Inscription from './pages/Inscription'
import Connexion from './pages/Connexion'
import CitoyenHome from './pages/CitoyenHome'
import Signaler from './pages/Signaler'
import MesSignalements from './pages/MesSignalements'
import Profil from './pages/Profil'
import SignalementDetail from './pages/SignalementDetail'
import Carte from './pages/Carte'
import MairieLogin from './pages/MairieLogin'
import MairieInscription from './pages/MairieInscription'
import MairieDashboard from './pages/MairieDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/citoyen" element={<CitoyenHome />} />
      <Route path="/signaler" element={<Signaler />} />
      <Route path="/mes-signalements" element={<MesSignalements />} />
      <Route path="/profil" element={<Profil />} />
      <Route path="/carte" element={<Carte />} />
      <Route path="/signalement/:id" element={<SignalementDetail />} />
      <Route path="/mairie" element={<MairieLogin />} />
      <Route path="/mairie/inscription" element={<MairieInscription />} />
      <Route path="/mairie/dashboard" element={<MairieDashboard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

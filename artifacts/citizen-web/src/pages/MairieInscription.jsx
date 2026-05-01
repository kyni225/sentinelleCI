import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerMairie } from '../firebase'

export default function MairieInscription() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      await registerMairie(name, email, password)
      nav('/mairie/dashboard')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé.')
      } else {
        setError('Erreur lors de l\'inscription. Vérifiez vos informations.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoWrap}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.87M19 21V10.87"/></svg>
        </div>
        <h1 style={s.title}>SentinelleCI</h1>
        <p style={s.subtitle}>Inscription Administrateur</p>

        <form onSubmit={handleRegister} style={s.form}>
          <label style={s.field}>
            <span style={s.label}>Nom de l'administrateur</span>
            <input style={s.input} type="text" placeholder="Admin Yopougon" value={name} onChange={e => setName(e.target.value)} required />
          </label>
          <label style={s.field}>
            <span style={s.label}>Adresse email institutionnelle</span>
            <input style={s.input} type="email" placeholder="admin@commune.ci" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label style={s.field}>
            <span style={s.label}>Mot de passe</span>
            <input style={s.input} type="password" placeholder="Minimum 6 caractères" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          <label style={s.field}>
            <span style={s.label}>Confirmer le mot de passe</span>
            <input style={s.input} type="password" placeholder="Confirmez" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </label>

          {error && <div style={s.error}>{error}</div>}

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Création du compte...' : 'Créer le compte administrateur'}
          </button>
        </form>

        <p style={s.switchText}>
          Déjà inscrit ? <span style={s.link} onClick={() => nav('/mairie')}>Se connecter</span>
        </p>
        <p style={s.back}>
          <span style={s.linkSmall} onClick={() => nav('/')}>← Retour à l'accueil</span>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7', padding: 24 },
  card: { width: '100%', maxWidth: 440, background: '#FFFFFF', borderRadius: 28, padding: '40px 36px', textAlign: 'center', border: '1px solid #E5DCC9', boxShadow: '0 12px 48px rgba(0,0,0,0.08)' },
  logoWrap: { width: 60, height: 60, borderRadius: 18, background: '#006B3F15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  title: { fontSize: 24, fontWeight: 800, color: '#006B3F', margin: 0 },
  subtitle: { fontSize: 14, color: '#6B7785', marginTop: 4, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 18, textAlign: 'left' },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#6B7785', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { background: '#F1ECE0', border: '1px solid #E5DCC9', borderRadius: 14, padding: '14px 16px', fontSize: 16, color: '#0F1B2D', outline: 'none' },
  btn: { background: '#FF6700', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 700, marginTop: 4, cursor: 'pointer' },
  error: { color: '#DC2626', fontSize: 14, textAlign: 'center', background: '#DC262610', padding: 12, borderRadius: 12, border: '1px solid #DC262625' },
  switchText: { fontSize: 14, color: '#6B7785', marginTop: 20 },
  link: { color: '#006B3F', fontWeight: 700, cursor: 'pointer' },
  back: { fontSize: 13, color: '#6B7785', marginTop: 12 },
  linkSmall: { color: '#006B3F', fontWeight: 600, cursor: 'pointer' },
}

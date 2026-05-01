import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginMairie } from '../firebase'

export default function MairieLogin() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginMairie(email, password)
      nav('/mairie/dashboard')
    } catch (err) {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h1 style={styles.title}>SentinelleCI</h1>
        <p style={styles.subtitle}>Tableau de bord communal</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.field}>
            <span style={styles.label}>Adresse email</span>
            <input style={styles.input} type="email" placeholder="admin@commune.ci" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label style={styles.field}>
            <span style={styles.label}>Mot de passe</span>
            <input style={styles.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </label>

          {error && <div style={styles.error}>{error}</div>}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.switchText}>
          Pas encore de compte ? <span style={styles.link} onClick={() => nav('/mairie/inscription')}>Créer un compte administrateur</span>
        </p>
        <p style={styles.back}>
          <span style={styles.link} onClick={() => nav('/')}>← Retour à l'accueil</span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7', padding: 24 },
  card: { width: '100%', maxWidth: 440, background: '#FFFFFF', borderRadius: 28, padding: '44px 36px', textAlign: 'center', border: '1px solid #E5DCC9', boxShadow: '0 12px 48px rgba(0,0,0,0.08)' },
  logoWrap: { width: 60, height: 60, borderRadius: 18, background: '#006B3F15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  title: { fontSize: 24, fontWeight: 800, color: '#006B3F', margin: 0 },
  subtitle: { fontSize: 14, color: '#6B7785', marginTop: 4, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 18, textAlign: 'left' },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#6B7785', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { background: '#F1ECE0', border: '1px solid #E5DCC9', borderRadius: 14, padding: '14px 16px', fontSize: 16, color: '#0F1B2D', outline: 'none' },
  btn: { background: '#FF6700', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 700, marginTop: 4 },
  error: { color: '#DC2626', fontSize: 14, textAlign: 'center', background: '#DC262610', padding: 12, borderRadius: 12, border: '1px solid #DC262625' },
  switchText: { fontSize: 14, color: '#6B7785', marginTop: 20 },
  back: { fontSize: 13, color: '#6B7785', marginTop: 12 },
  link: { color: '#006B3F', fontWeight: 700, cursor: 'pointer' },
}

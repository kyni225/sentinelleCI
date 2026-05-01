import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Accueil() {
  const nav = useNavigate()

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h1 style={styles.title}>SentinelleCI</h1>
        <p style={styles.subtitle}>Votre voix, votre commune</p>

        <div style={styles.divider}>
          <span style={styles.dividerText}>Vous êtes ?</span>
        </div>

        <button style={styles.btnCitoyen} onClick={() => nav('/connexion')}>
          <span style={styles.btnEmoji}>👤</span>
          <div style={styles.btnTextWrap}>
            <span style={styles.btnLabel}>Je suis Citoyen</span>
            <span style={styles.btnSub}>Signaler un problème dans ma commune</span>
          </div>
        </button>

        <button style={styles.btnMairie} onClick={() => nav('/mairie')}>
          <span style={styles.btnEmoji}>🏢</span>
          <div style={styles.btnTextWrap}>
            <span style={styles.btnLabel}>Je suis Administrateur</span>
            <span style={styles.btnSub}>Gérer les signalements de la commune</span>
          </div>
        </button>

        <p style={styles.footerText}>
          Pas encore de compte ?{' '}
          <span style={styles.link} onClick={() => nav('/inscription')}>S'inscrire</span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FAFAF7',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    background: '#FFFFFF',
    borderRadius: 28,
    padding: '44px 36px',
    textAlign: 'center',
    border: '1px solid #E5DCC9',
    boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    background: '#006B3F15',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#006B3F',
    letterSpacing: 0.5,
    margin: 0,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7785',
    marginTop: 6,
  },
  divider: {
    borderTop: '1px solid #E5DCC9',
    margin: '32px 0 28px',
    position: 'relative',
  },
  dividerText: {
    position: 'relative',
    top: -10,
    background: '#FFFFFF',
    padding: '0 16px',
    fontSize: 13,
    fontWeight: 600,
    color: '#6B7785',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  btnCitoyen: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '20px 24px',
    borderRadius: 18,
    background: '#006B3F',
    color: '#FFFFFF',
    marginBottom: 14,
    transition: 'transform 0.15s, box-shadow 0.15s',
    border: 'none',
  },
  btnMairie: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '20px 24px',
    borderRadius: 18,
    background: '#F1ECE0',
    color: '#0F1B2D',
    border: '1px solid #E5DCC9',
    marginBottom: 14,
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  btnEmoji: {
    fontSize: 28,
  },
  btnTextWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  btnLabel: {
    fontSize: 17,
    fontWeight: 700,
  },
  btnSub: {
    fontSize: 13,
    opacity: 0.75,
    marginTop: 2,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7785',
    marginTop: 20,
  },
  link: {
    color: '#006B3F',
    fontWeight: 700,
    cursor: 'pointer',
  },
}

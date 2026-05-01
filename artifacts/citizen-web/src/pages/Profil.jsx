import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, logoutUser, onSignalements } from '../firebase'
import BottomNav from '../components/BottomNav'

const BADGES = [
  { icon: '🏅', label: 'Signalisation de premier ordre', desc: 'Vous avez fait entendre votre voix.', unlocked: true },
  { icon: '✅', label: 'Témoin fiable', desc: 'Vos signaux sont confirmés.', unlocked: true },
  { icon: '🏘️', label: 'Vigie de quartier', desc: '500 points atteints.', unlocked: false },
  { icon: '🛡️', label: 'Gardien', desc: '1000 points atteints.', unlocked: false },
]

export default function Profil() {
  const nav = useNavigate()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [notifs, setNotifs] = useState(true)
  const [anonymous, setAnonymous] = useState(false)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (!u) nav('/connexion')
      else setUser(u)
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSignalements(setReports)
    return unsub
  }, [])

  const handleLogout = async () => {
    await logoutUser()
    nav('/')
  }

  const mine = reports.filter(r => r.authorId === user?.uid)
  const soumis = mine.length
  const resolus = mine.filter(r => r.status === 'resolu').length
  const score = soumis * 10 + resolus * 40

  return (
    <div style={s.page}>
      <div style={s.scrollContent}>
        {/* Avatar */}
        <div style={s.avatarSection}>
          <div style={s.avatar}>
            <span style={s.avatarText}>
              {(user?.displayName || 'C').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <h2 style={s.name}>{user?.displayName || 'Citoyen'}</h2>
          <span style={s.pseudo}>@{(user?.displayName || 'citoyen').toLowerCase().replace(/\s+/g, '')}</span>
        </div>

        {/* Score */}
        <div style={s.scoreCard}>
          <div style={s.scoreItem}>
            <span style={s.scoreNum}>{score}</span>
            <span style={s.scoreLabel}>Points</span>
          </div>
          <div style={s.scoreDivider}></div>
          <div style={s.scoreItem}>
            <span style={s.scoreNum}>{soumis}</span>
            <span style={s.scoreLabel}>Signalements</span>
          </div>
          <div style={s.scoreDivider}></div>
          <div style={s.scoreItem}>
            <span style={s.scoreNum}>{resolus}</span>
            <span style={s.scoreLabel}>Résolus</span>
          </div>
        </div>

        {/* Confidentialité */}
        <SectionTitle title="Confidentialité" />
        <div style={s.card}>
          <div style={s.settingRow}>
            <div style={s.settingLeft}>
              <div style={s.settingIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div>
                <span style={s.settingLabel}>Signalement anonyme</span>
                <span style={s.settingDesc}>{anonymous ? 'Vos prochains signalements seront publiés sous « Citoyen anonyme ».' : 'Vos signaux affichent votre pseudo public.'}</span>
              </div>
            </div>
            <button style={{ ...s.toggle, background: anonymous ? '#006B3F' : '#E5DCC9' }} onClick={() => setAnonymous(!anonymous)}>
              <span style={{ ...s.toggleDot, marginLeft: anonymous ? 20 : 2 }}></span>
            </button>
          </div>
        </div>

        {/* Réglages */}
        <SectionTitle title="Réglages" />
        <div style={s.card}>
          <div style={s.settingRow}>
            <div style={s.settingLeft}>
              <div style={s.settingIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <div>
                <span style={s.settingLabel}>Notifications push</span>
                <span style={s.settingDesc}>{notifs ? 'Actives' : 'Désactivées'}</span>
              </div>
            </div>
            <button style={{ ...s.toggle, background: notifs ? '#006B3F' : '#E5DCC9' }} onClick={() => setNotifs(!notifs)}>
              <span style={{ ...s.toggleDot, marginLeft: notifs ? 20 : 2 }}></span>
            </button>
          </div>
          <div style={s.divider}></div>
          <div style={s.settingRow}>
            <div style={s.settingLeft}>
              <div style={s.settingIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <div>
                <span style={s.settingLabel}>Langue</span>
                <span style={s.settingDesc}>Français</span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7785" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div style={s.divider}></div>
          <div style={s.settingRow}>
            <div style={s.settingLeft}>
              <div style={s.settingIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div>
                <span style={s.settingLabel}>Données blockchain</span>
                <span style={s.settingDesc}>Polygon</span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7785" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        {/* Voir mon quartier */}
        <button style={s.quartierCard} onClick={() => nav('/carte')}>
          <div style={s.quartierIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <span style={s.quartierTitle}>Voir mon quartier</span>
            <span style={s.quartierDesc}>Statistiques et historiques de Cocody</span>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7785" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Badges */}
        <SectionTitle title="Vos badges" />
        <div style={s.card}>
          {BADGES.map((b, i) => (
            <React.Fragment key={i}>
              <div style={s.badgeRow}>
                <span style={{ ...s.badgeIcon, opacity: b.unlocked ? 1 : 0.35 }}>{b.icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ ...s.badgeLabel, color: b.unlocked ? '#0F1B2D' : '#6B7785' }}>{b.label}</span>
                  <span style={s.badgeDesc}>{b.desc}</span>
                </div>
                {b.unlocked && <span style={s.badgeCheck}>✓</span>}
              </div>
              {i < BADGES.length - 1 && <div style={s.divider}></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Déconnexion */}
        <button style={s.btnLogout} onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Se déconnecter
        </button>

        {/* À propos de la réputation */}
        <SectionTitle title="À propos de la réputation" />
        <div style={s.reputationCard}>
          <p style={s.reputationText}>Votre score augmente lorsque vos signaux sont validés et résolus. Il diminue en cas de faux signalement. Un score élevé donne plus de poids à vos alertes auprès de la commune.</p>
        </div>
      </div>

      <BottomNav active="profil" />
    </div>
  )
}

function SectionTitle({ title }) {
  return (
    <div style={s.sectionWrap}>
      <span style={s.sectionTitle}>{title}</span>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#FAFAF7', paddingBottom: 80 },
  scrollContent: { maxWidth: 600, margin: '0 auto', padding: '0 20px 24px' },
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0 20px' },
  avatar: { width: 80, height: 80, borderRadius: 24, background: '#006B3F', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 30, fontWeight: 800, color: '#FFFFFF' },
  name: { fontSize: 22, fontWeight: 800, color: '#0F1B2D', margin: '12px 0 2px' },
  pseudo: { fontSize: 14, color: '#6B7785', fontWeight: 500 },
  scoreCard: { display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: 16, padding: '16px 20px', border: '1px solid #E5DCC9', marginBottom: 8 },
  scoreItem: { flex: 1, textAlign: 'center' },
  scoreNum: { fontSize: 24, fontWeight: 800, color: '#006B3F', display: 'block' },
  scoreLabel: { fontSize: 11, color: '#6B7785', fontWeight: 500, display: 'block', marginTop: 2 },
  scoreDivider: { width: 1, height: 36, background: '#E5DCC9' },
  sectionWrap: { paddingTop: 22, paddingBottom: 10 },
  sectionTitle: { fontWeight: 700, fontSize: 16, color: '#0F1B2D' },
  card: { background: '#FFFFFF', borderRadius: 16, padding: 4, border: '1px solid #E5DCC9', marginBottom: 16 },
  divider: { height: 1, background: '#E5DCC9', margin: '0 18px' },
  settingRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' },
  settingLeft: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 },
  settingIcon: { width: 34, height: 34, borderRadius: 10, background: '#006B3F12', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontWeight: 600, fontSize: 14, color: '#0F1B2D', display: 'block' },
  settingDesc: { fontSize: 12, color: '#6B7785', marginTop: 1, display: 'block' },
  toggle: { width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' },
  toggleDot: { width: 22, height: 22, borderRadius: 11, background: '#FFFFFF', display: 'block', transition: 'margin 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
  quartierCard: { display: 'flex', alignItems: 'center', gap: 12, background: '#FFFFFF', borderRadius: 16, padding: '14px 18px', border: '1px solid #E5DCC9', cursor: 'pointer', width: '100%', marginBottom: 16 },
  quartierIcon: { width: 36, height: 36, borderRadius: 10, background: '#F1ECE0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  quartierTitle: { fontWeight: 700, fontSize: 14, color: '#0F1B2D', display: 'block' },
  quartierDesc: { fontSize: 12, color: '#6B7785', marginTop: 1, display: 'block' },
  reputationCard: { background: '#F1ECE0', borderRadius: 14, padding: 14, border: '1px solid #E5DCC9', marginBottom: 16 },
  reputationText: { fontSize: 13, color: '#0F1B2D', lineHeight: 1.5, margin: 0 },
  badgeRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px' },
  badgeIcon: { fontSize: 24 },
  badgeLabel: { fontWeight: 700, fontSize: 14, display: 'block' },
  badgeDesc: { fontSize: 12, color: '#6B7785', marginTop: 1, display: 'block' },
  badgeCheck: { color: '#006B3F', fontWeight: 700, fontSize: 16 },
  btnLogout: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', background: '#DC262610', color: '#DC2626', border: '1px solid #DC262625', borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
}

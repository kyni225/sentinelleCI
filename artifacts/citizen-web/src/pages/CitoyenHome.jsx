import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, onSignalements, logoutUser } from '../firebase'
import { CATS, STATUS_META } from '../constants'
import { timeAgo } from '../utils'
import BottomNav from '../components/BottomNav'

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export default function CitoyenHome() {
  const nav = useNavigate()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])

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

  const myReports = reports.filter(r => r.authorId === user?.uid)
  const enCours = myReports.filter(r => ['soumis', 'valide', 'en_cours'].includes(r.status)).length
  const resolus = myReports.filter(r => r.status === 'resolu').length
  const recent = [...reports].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8)

  const handleLogout = async () => {
    await logoutUser()
    nav('/')
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoWrap}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h1 style={styles.headerTitle}>SentinelleCI</h1>
            <span style={styles.headerSub}>Votre voix, votre commune</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.userName}>{user?.displayName || 'Citoyen'}</span>
          <button style={styles.btnLogout} onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <div style={styles.content}>
        {/* Greeting */}
        <div style={styles.hero}>
          <h2 style={styles.greeting}>{getGreeting()}, {user?.displayName?.split(' ')[0] || 'Citoyen'}</h2>
          <p style={styles.greetingSub}>Votre quartier compte sur vos yeux aujourd'hui.</p>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: '#006B3F15' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ ...styles.statNum, color: '#006B3F' }}>{myReports.length}</span>
            <span style={styles.statLabel}>Mes signalements</span>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: '#F59E0B15' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
            </div>
            <span style={{ ...styles.statNum, color: '#F59E0B' }}>{enCours}</span>
            <span style={styles.statLabel}>En cours</span>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: '#006B3F15' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span style={{ ...styles.statNum, color: '#006B3F' }}>{resolus}</span>
            <span style={styles.statLabel}>Résolus</span>
          </div>
        </div>

        {/* Big CTA */}
        <button style={styles.bigCta} onClick={() => nav('/signaler')}>
          <div style={styles.bigCtaIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <span style={styles.bigCtaTitle}>Signaler un problème</span>
            <span style={styles.bigCtaSub}>Photo, lieu, description — 30 secondes</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>

        {/* Quick Actions */}
        <div style={styles.quickRow}>
          <button style={styles.quickBtn} onClick={() => nav('/mes-signalements')}>
            <div style={styles.quickIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
            </div>
            <span style={styles.quickLabel}>Mon suivi</span>
          </button>
          <button style={styles.quickBtn} onClick={() => nav('/carte')}>
            <div style={styles.quickIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            </div>
            <span style={styles.quickLabel}>Carte</span>
          </button>
          <button style={styles.quickBtn} onClick={() => nav('/quartier')}>
            <div style={styles.quickIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <span style={styles.quickLabel}>{user?.commune || 'Quartier'}</span>
          </button>
        </div>

        {/* Section: Près de chez vous */}
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Près de chez vous</h3>
            <span style={styles.sectionSub}>Signalements récents</span>
          </div>
        </div>

        {recent.length === 0 && (
          <div style={styles.empty}>
            <p style={styles.emptyTitle}>Aucun signalement</p>
            <span style={styles.emptySub}>Soyez le premier à signaler un problème !</span>
          </div>
        )}

        {recent.map(r => {
          const cat = CATS[r.category] || { label: r.category || 'Autre', hue: '#9333EA' }
          const photo = r.photoUris && r.photoUris[0]
          return (
            <div key={r.id} style={styles.card} onClick={() => nav('/signalement/' + r.id)} role="button" tabIndex={0}>
              <div style={styles.cardHeaderRow}>
                {photo ? (
                  <img src={photo} style={styles.cardThumb} alt="" />
                ) : (
                  <div style={{ ...styles.cardIconWrap, background: cat.hue + '15' }}>
                    <span style={{ color: cat.hue, fontSize: 18 }}>{cat.icon || '📌'}</span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.cardTitleRow}>
                    <span style={styles.cardNumber}>#{r.number || r.id.slice(0, 6)}</span>
                    <span style={styles.cardCategory}>{cat.label} · {r.quartier}</span>
                  </div>
                  <span style={styles.cardTime}>{timeAgo(r.createdAt)} · {r.authorPseudo || 'Anonyme'}</span>
                </div>
              </div>
              <p style={styles.cardDesc}>{r.description}</p>
              <div style={styles.cardBadgeRow}>
                <span style={{ ...styles.cardStatus, ...(r.status === 'resolu' ? styles.statusResolu : r.status === 'en_cours' ? styles.statusEnCours : styles.statusSoumis) }}>
                  {(STATUS_META[r.status] || STATUS_META.soumis).label}
                </span>
              </div>
              <div style={styles.cardFooter}>
                <span style={styles.cardAddress}>📍 {r.address || r.quartier}</span>
                <span style={styles.cardUpvotes}>👍 {r.upvotes || 0}</span>
              </div>
            </div>
          )
        })}
        {/* Trust Card — Blockchain */}
        <div style={styles.trustCard}>
          <div style={styles.trustRow}>
            <div style={styles.trustIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <span style={styles.trustTitle}>Vos signalements sont publics et infalsifiables</span>
              <span style={styles.trustSub}>Chaque alerte est enregistrée sur la blockchain Polygon. L'administration ne peut pas l'effacer.</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#FAFAF7', paddingBottom: 80 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#FFFFFF', borderBottom: '1px solid #E5DCC9', position: 'sticky', top: 0, zIndex: 50 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logoWrap: { width: 40, height: 40, borderRadius: 12, background: '#006B3F15', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 800, color: '#006B3F', margin: 0 },
  headerSub: { fontSize: 12, color: '#6B7785' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  userName: { fontSize: 14, fontWeight: 500, color: '#0F1B2D' },
  btnLogout: { background: '#EFE9DD', color: '#006B3F', border: '1px solid #E5DCC9', padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600 },
  content: { maxWidth: 600, margin: '0 auto', padding: '0 20px 24px' },
  hero: { padding: '24px 0 8px' },
  greeting: { fontSize: 24, fontWeight: 800, color: '#0F1B2D', margin: 0 },
  greetingSub: { fontSize: 15, color: '#6B7785', marginTop: 4 },
  statsRow: { display: 'flex', gap: 12, padding: '16px 0', overflowX: 'auto' },
  statCard: { background: '#FFFFFF', borderRadius: 16, padding: '14px 16px', minWidth: 120, border: '1px solid #E5DCC9', display: 'flex', flexDirection: 'column', gap: 6 },
  statIcon: { width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: 24, fontWeight: 800 },
  statLabel: { fontSize: 12, color: '#6B7785', fontWeight: 500 },
  bigCta: { display: 'flex', alignItems: 'center', gap: 14, background: '#FF6700', borderRadius: 18, padding: '18px 22px', color: '#FFFFFF', border: 'none', width: '100%', marginTop: 8, boxShadow: '0 8px 24px #FF670030' },
  bigCtaIcon: { width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bigCtaTitle: { fontSize: 17, fontWeight: 700, display: 'block' },
  bigCtaSub: { fontSize: 13, opacity: 0.85, display: 'block', marginTop: 2 },
  quickRow: { display: 'flex', gap: 10, marginTop: 16 },
  quickBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, padding: '14px 12px', background: '#FFFFFF', border: '1px solid #E5DCC9', borderRadius: 14, color: '#006B3F' },
  quickIcon: { width: 34, height: 34, borderRadius: 10, background: '#006B3F12', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 12, fontWeight: 600, color: '#0F1B2D' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#0F1B2D', margin: 0 },
  sectionSub: { fontSize: 13, color: '#6B7785', marginTop: 2 },
  empty: { textAlign: 'center', padding: 40, color: '#6B7785' },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: '#0F1B2D' },
  emptySub: { fontSize: 14, marginTop: 8 },
  card: { background: '#FFFFFF', borderRadius: 16, padding: 14, border: '1px solid #E5DCC9', marginBottom: 10, cursor: 'pointer' },
  cardHeaderRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardThumb: { width: 44, height: 44, borderRadius: 12, objectFit: 'cover', background: '#E5DCC9' },
  cardIconWrap: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitleRow: { display: 'flex', alignItems: 'baseline', gap: 6 },
  cardNumber: { fontWeight: 700, fontSize: 11, color: '#6B7785', letterSpacing: 0.5 },
  cardCategory: { fontWeight: 700, fontSize: 14, color: '#0F1B2D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardTime: { fontSize: 12, color: '#6B7785', marginTop: 1, display: 'block' },
  cardBadgeRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  cardStatus: { padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600 },
  statusSoumis: { background: '#F59E0B20', color: '#F59E0B', border: '1px solid #F59E0B30' },
  statusEnCours: { background: '#006B3F15', color: '#006B3F', border: '1px solid #006B3F30' },
  statusResolu: { background: '#006B3F15', color: '#006B3F', border: '1px solid #006B3F30' },
  cardDesc: { color: '#0F1B2D', fontSize: 14, margin: '0 0 10px', lineHeight: 1.5 },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 10, borderTop: '1px solid #E5DCC9' },
  cardAddress: { fontSize: 12, color: '#6B7785', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  cardUpvotes: { fontSize: 12, color: '#006B3F', fontWeight: 700 },
  trustCard: { margin: '22px 0 0', padding: 14, borderRadius: 14, border: '1px solid #E5DCC9', background: '#F1ECE0' },
  trustRow: { display: 'flex', alignItems: 'center', gap: 12 },
  trustIcon: { width: 32, height: 32, borderRadius: 10, background: '#006B3F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  trustTitle: { fontSize: 13, fontWeight: 700, color: '#0F1B2D', display: 'block' },
  trustSub: { fontSize: 12, color: '#6B7785', marginTop: 2, lineHeight: 1.4, display: 'block' },
}

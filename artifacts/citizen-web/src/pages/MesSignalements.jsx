import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, onSignalements, logoutUser } from '../firebase'
import { CATS, STATUS_META } from '../constants'
import { timeAgo } from '../utils'
import BottomNav from '../components/BottomNav'

const FILTERS = [
  { id: 'tous', label: 'Tous' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'resolus', label: 'Résolus' },
  { id: 'urgents', label: 'Urgents' },
]


export default function MesSignalements() {
  const nav = useNavigate()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [activeFilter, setActiveFilter] = useState('tous')

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

  const mine = useMemo(() =>
    reports.filter(r => r.authorId === user?.uid).sort((a, b) => b.createdAt - a.createdAt),
    [reports, user]
  )

  const counts = useMemo(() => {
    const enCours = mine.filter(r => ['soumis', 'valide', 'en_cours'].includes(r.status)).length
    const resolus = mine.filter(r => r.status === 'resolu').length
    const urgents = mine.filter(r => r.ai?.priority === 'P1').length
    return { tous: mine.length, en_cours: enCours, resolus, urgents }
  }, [mine])

  const filtered = useMemo(() => {
    if (activeFilter === 'tous') return mine
    if (activeFilter === 'urgents') return mine.filter(r => r.ai?.priority === 'P1')
    if (activeFilter === 'resolus') return mine.filter(r => r.status === 'resolu')
    return mine.filter(r => ['soumis', 'valide', 'en_cours'].includes(r.status))
  }, [mine, activeFilter])

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => nav('/citoyen')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Retour
        </button>
        <h1 style={s.headerTitle}>Mes signalements</h1>
        <div style={{ width: 70 }}></div>
      </header>

      <div style={s.content}>
        <div style={s.intro}>
          <span style={s.kicker}>MON SUIVI</span>
          <h2 style={s.introTitle}>Mes signalements</h2>
          <p style={s.introSub}>Suivez le traitement et l'impact dans votre commune.</p>
        </div>

        {/* Summary cards */}
        <div style={s.summaryRow}>
          <div style={s.summaryCard}>
            <div style={{ ...s.summaryIcon, background: '#006B3F15' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            </div>
            <span style={{ ...s.summaryValue, color: '#006B3F' }}>{counts.tous}</span>
            <span style={s.summaryLabel}>Soumis</span>
          </div>
          <div style={s.summaryCard}>
            <div style={{ ...s.summaryIcon, background: '#FEF3C7' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
            </div>
            <span style={{ ...s.summaryValue, color: '#B45309' }}>{counts.en_cours}</span>
            <span style={s.summaryLabel}>En cours</span>
          </div>
          <div style={s.summaryCard}>
            <div style={{ ...s.summaryIcon, background: '#DCFCE7' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span style={{ ...s.summaryValue, color: '#15803D' }}>{counts.resolus}</span>
            <span style={s.summaryLabel}>Résolus</span>
          </div>
        </div>

        {/* Filter chips */}
        <div style={s.filterRow}>
          {FILTERS.map(f => {
            const active = activeFilter === f.id
            return (
              <button key={f.id} style={{
                ...s.filterChip,
                background: active ? '#0F1B2D' : '#FFFFFF',
                borderColor: active ? '#0F1B2D' : '#E5DCC9',
                color: active ? '#FFFFFF' : '#0F1B2D',
              }} onClick={() => setActiveFilter(f.id)}>
                <span>{f.label}</span>
                <span style={{
                  ...s.filterBadge,
                  background: active ? 'rgba(255,255,255,0.18)' : '#F1ECE0',
                  color: active ? '#FFFFFF' : '#6B7785',
                }}>{counts[f.id]}</span>
              </button>
            )
          })}
        </div>

        {/* Empty state */}
        {mine.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B7785" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
            </div>
            <p style={s.emptyTitle}>Aucun signalement pour l'instant</p>
            <p style={s.emptyText}>Repérez un nid de poule, un lampadaire éteint, une fuite d'eau ? Faites-le savoir à votre commune en deux minutes.</p>
            <button style={s.ctaBtn} onClick={() => nav('/signaler')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Faire mon premier signalement
            </button>
          </div>
        )}

        {/* Filtered empty */}
        {mine.length > 0 && filtered.length === 0 && (
          <div style={s.emptyFilter}>
            <p style={{ fontSize: 15, color: '#6B7785' }}>Aucun signalement avec ce filtre.</p>
          </div>
        )}

        {/* Report cards */}
        {filtered.map(r => {
          const cat = CATS[r.category] || { label: r.category || 'Autre', hue: '#9333EA', icon: '📌' }
          const photo = r.photoUris && r.photoUris[0]
          const st = STATUS_META[r.status] || STATUS_META.soumis
          return (
            <div key={r.id} style={s.card} onClick={() => nav('/signalement/' + r.id)} role="button" tabIndex={0}>
              <div style={s.cardHeaderRow}>
                {photo ? (
                  <img src={photo} style={s.cardThumb} alt="" />
                ) : (
                  <div style={{ ...s.cardIconWrap, background: cat.hue + '15' }}>
                    <span style={{ color: cat.hue, fontSize: 18 }}>{cat.icon}</span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.cardTitleRow}>
                    <span style={s.cardNumber}>#{r.number || r.id.slice(0, 6)}</span>
                    <span style={s.cardCategory}>{cat.label} · {r.quartier}</span>
                  </div>
                  <span style={s.cardTime}>{timeAgo(r.createdAt)} · {r.isAnonymous ? 'Citoyen anonyme' : (r.authorPseudo || 'Anonyme')}</span>
                </div>
              </div>
              <p style={s.cardDesc}>{r.description}</p>
              <div style={s.cardBadgeRow}>
                <span style={{ ...s.cardStatus, background: st.bg, color: st.color, border: '1px solid ' + st.color + '30' }}>
                  {st.label}
                </span>
                {r.ai?.priority && r.ai.priority !== 'P3' && (
                  <span style={{ ...s.cardPriority, background: r.ai.priority === 'P1' ? '#DC2626' : '#F59E0B', color: '#FFFFFF' }}>{r.ai.priority}</span>
                )}
              </div>
              <div style={s.cardFooter}>
                <span style={s.cardAddress}>📍 {r.address || r.quartier}</span>
                <span style={s.cardUpvotes}>👍 {r.upvotes || 0}</span>
              </div>
            </div>
          )
        })}
      </div>
      <BottomNav active="suivi" />
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#FAFAF7', paddingBottom: 80 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#FFFFFF', borderBottom: '1px solid #E5DCC9', position: 'sticky', top: 0, zIndex: 50 },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#006B3F', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  headerTitle: { fontSize: 18, fontWeight: 800, color: '#0F1B2D', margin: 0 },
  content: { maxWidth: 600, margin: '0 auto', padding: '0 20px 24px' },
  intro: { padding: '20px 0 8px' },
  kicker: { fontSize: 12, fontWeight: 700, color: '#FF6700', letterSpacing: 1, textTransform: 'uppercase' },
  introTitle: { fontSize: 24, fontWeight: 800, color: '#0F1B2D', margin: '4px 0 0' },
  introSub: { fontSize: 14, color: '#6B7785', marginTop: 4 },
  summaryRow: { display: 'flex', gap: 10, marginTop: 18 },
  summaryCard: { flex: 1, borderRadius: 14, border: '1px solid #E5DCC9', padding: 12, background: '#FFFFFF' },
  summaryIcon: { width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  summaryValue: { fontSize: 22, fontWeight: 800, display: 'block' },
  summaryLabel: { fontSize: 11, fontWeight: 500, color: '#6B7785', marginTop: 2, display: 'block' },
  filterRow: { display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 0 10px' },
  filterChip: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, border: '1px solid #E5DCC9', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 600 },
  filterBadge: { padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 },
  empty: { textAlign: 'center', padding: 30, borderRadius: 16, border: '1px solid #E5DCC9', background: '#FFFFFF', marginTop: 10 },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, background: '#F1ECE0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: '#0F1B2D', marginTop: 10 },
  emptyText: { fontSize: 13, color: '#6B7785', marginTop: 4, lineHeight: 1.5 },
  emptyFilter: { textAlign: 'center', padding: 30, borderRadius: 16, border: '1px solid #E5DCC9', background: '#FFFFFF', marginTop: 10 },
  ctaBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#FF6700', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '12px 20px', fontSize: 14, fontWeight: 700, marginTop: 16, cursor: 'pointer' },
  card: { background: '#FFFFFF', borderRadius: 16, padding: 14, border: '1px solid #E5DCC9', marginBottom: 10, cursor: 'pointer' },
  cardHeaderRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardThumb: { width: 44, height: 44, borderRadius: 12, objectFit: 'cover', background: '#E5DCC9' },
  cardIconWrap: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitleRow: { display: 'flex', alignItems: 'baseline', gap: 6 },
  cardNumber: { fontWeight: 700, fontSize: 11, color: '#6B7785', letterSpacing: 0.5 },
  cardCategory: { fontWeight: 700, fontSize: 14, color: '#0F1B2D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardTime: { fontSize: 12, color: '#6B7785', marginTop: 1, display: 'block' },
  cardDesc: { color: '#0F1B2D', fontSize: 14, margin: '0 0 10px', lineHeight: 1.5 },
  cardBadgeRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  cardStatus: { padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600 },
  cardPriority: { padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 10, borderTop: '1px solid #E5DCC9' },
  cardAddress: { fontSize: 12, color: '#6B7785', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  cardUpvotes: { fontSize: 12, color: '#006B3F', fontWeight: 700 },
}

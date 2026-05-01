import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, onSignalements, updateStatus, upvoteReport, logoutUser, onAuthStateChanged } from '../firebase'
import { CATS, STATUS_META } from '../constants'
import { timeAgo } from '../utils'


export default function MairieDashboard() {
  const nav = useNavigate()
  const [signalements, setSignalements] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (!u) nav('/mairie') })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSignalements(setSignalements)
    return unsub
  }, [])

  const filtered = signalements.filter(s => {
    if (filterStatus && s.status !== filterStatus) return false
    if (filterPriority && s.ai?.priority !== filterPriority) return false
    if (search) {
      const q = search.toLowerCase()
      return (s.description || '').toLowerCase().includes(q)
        || (s.quartier || '').toLowerCase().includes(q)
        || (s.category || '').toLowerCase().includes(q)
    }
    return true
  })

  const countStatus = (st) => signalements.filter(s => s.status === st).length
  const countPriority = (p) => signalements.filter(s => s.ai?.priority === p).length

  const handleLogout = async () => {
    await logoutUser()
    nav('/')
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div>
            <h1 style={styles.headerTitle}>SentinelleCI</h1>
            <span style={styles.headerSub}>Tableau de bord communal</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.live}>
            <span style={styles.pulseDot}></span> LIVE
          </span>
          <button style={styles.btnLogout} onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <div style={styles.content}>
        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}><span style={{ ...styles.statNum, color: '#006B3F' }}>{signalements.length}</span><span style={styles.statLabel}>Total</span></div>
          <div style={styles.statCard}><span style={{ ...styles.statNum, color: '#F59E0B' }}>{countStatus('soumis')}</span><span style={styles.statLabel}>En attente</span></div>
          <div style={styles.statCard}><span style={{ ...styles.statNum, color: '#006B3F' }}>{countStatus('en_cours')}</span><span style={styles.statLabel}>En cours</span></div>
          <div style={styles.statCard}><span style={{ ...styles.statNum, color: '#006B3F' }}>{countStatus('resolu')}</span><span style={styles.statLabel}>Résolus</span></div>
          <div style={styles.statCard}><span style={{ ...styles.statNum, color: '#DC2626' }}>{countPriority('P1')}</span><span style={styles.statLabel}>Urgences P1</span></div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Statut</label>
            <select style={styles.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Tous</option>
              <option value="soumis">Soumis</option>
              <option value="valide">Validé</option>
              <option value="en_cours">En cours</option>
              <option value="resolu">Résolu</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Priorité</label>
            <select style={styles.select} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">Toutes</option>
              <option value="P1">P1 — Urgent</option>
              <option value="P2">P2 — Important</option>
            </select>
          </div>
          <div style={{ ...styles.filterGroup, flex: 1, minWidth: 240 }}>
            <label style={styles.filterLabel}>Recherche</label>
            <input style={{ ...styles.select, paddingLeft: 14 }} placeholder="Quartier, catégorie..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div style={styles.resultCount}>{filtered.length} signalement{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</div>

        {filtered.length === 0 && (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>📭</span>
            <p style={styles.emptyTitle}>Aucun signalement</p>
            <span style={styles.emptySub}>Les nouveaux signalements des citoyens apparaîtront ici en temps réel.</span>
          </div>
        )}

        {/* Cards */}
        {filtered.map(s => (
          <div key={s.id} style={{ ...styles.card, borderLeftColor: s.status === 'resolu' ? '#006B3F' : s.status === 'en_cours' ? '#006B3F' : s.status === 'valide' ? '#006B3F' : '#F59E0B' }}>
            <div style={styles.cardTop}>
              <span style={styles.cardNumber}>#{s.number || s.id.slice(0, 6)}</span>
              <span style={styles.cardCat}>{(CATS[s.category] || CATS.autre).label}</span>
              {s.ai?.priority && s.ai.priority !== 'P3' && (
                <span style={{ ...styles.cardPriority, ...(s.ai.priority === 'P1' ? styles.prioP1 : styles.prioP2) }}>{s.ai.priority}</span>
              )}
              <span style={{ ...styles.cardStatus, ...(s.status === 'resolu' ? styles.statusResolu : s.status === 'en_cours' ? styles.statusEnCours : styles.statusSoumis) }}>
                {(STATUS_META[s.status] || STATUS_META.soumis).label}
              </span>
            </div>
            <p style={styles.cardDesc}>{s.description}</p>
            <div style={styles.cardMeta}>
              <span>📍 {s.quartier}{s.address ? ` — ${s.address}` : ''}</span>
              <span>🕐 {timeAgo(s.createdAt)} · {s.authorPseudo || 'Anonyme'}</span>
              <span>👍 {s.upvotes || 0}</span>
              {s.ai?.severity && <span>🤖 IA : {s.ai.severity}</span>}
            </div>
            <div style={styles.cardActions}>
              <div style={styles.actionStatus}>
                <label style={styles.actionLabel}>Statut :</label>
                <select style={styles.actionSelect} value={s.status} onChange={e => updateStatus(s.id, e.target.value)}>
                  <option value="soumis">Soumis</option>
                  <option value="valide">Validé</option>
                  <option value="en_cours">En cours</option>
                  <option value="resolu">Résolu</option>
                </select>
              </div>
              <button style={styles.btnUpvote} onClick={() => upvoteReport(s.id)}>👍 Soutenir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#FAFAF7' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#FFFFFF', borderBottom: '1px solid #E5DCC9', position: 'sticky', top: 0, zIndex: 50 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: 700, color: '#006B3F', margin: 0 },
  headerSub: { fontSize: 13, color: '#6B7785' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 14 },
  live: { background: '#DC262615', color: '#DC2626', padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #DC262630' },
  pulseDot: { width: 8, height: 8, borderRadius: '50%', background: '#DC2626', display: 'inline-block', animation: 'pulse 2s infinite' },
  btnLogout: { background: '#EFE9DD', color: '#006B3F', border: '1px solid #E5DCC9', padding: '9px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600 },
  content: { maxWidth: 960, margin: '0 auto', padding: '0 24px 24px' },
  statsRow: { display: 'flex', gap: 14, padding: '24px 0', overflowX: 'auto' },
  statCard: { background: '#FFFFFF', borderRadius: 16, padding: '18px 20px', minWidth: 140, border: '1px solid #E5DCC9', textAlign: 'center' },
  statNum: { fontSize: 28, fontWeight: 800, display: 'block' },
  statLabel: { fontSize: 13, color: '#6B7785', marginTop: 4, display: 'block' },
  filters: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', paddingBottom: 16 },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  filterLabel: { fontSize: 12, fontWeight: 600, color: '#6B7785', textTransform: 'uppercase', letterSpacing: 0.5 },
  select: { background: '#FFFFFF', border: '1px solid #E5DCC9', color: '#0F1B2D', padding: '10px 14px', borderRadius: 12, fontSize: 15, outline: 'none' },
  resultCount: { fontSize: 14, color: '#6B7785', marginBottom: 12, fontWeight: 500 },
  card: { background: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid #E5DCC9', marginBottom: 12, borderLeft: '4px solid #E5DCC9' },
  cardTop: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  cardNumber: { fontWeight: 700, fontSize: 16, color: '#0F1B2D' },
  cardCat: { background: '#F1ECE0', padding: '4px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#006B3F' },
  cardPriority: { padding: '4px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700 },
  prioP1: { background: '#DC2626', color: '#FFFFFF' },
  prioP2: { background: '#F59E0B', color: '#0F1B2D' },
  cardStatus: { padding: '4px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600 },
  statusSoumis: { background: '#F59E0B20', color: '#F59E0B', border: '1px solid #F59E0B30' },
  statusEnCours: { background: '#006B3F15', color: '#006B3F', border: '1px solid #006B3F30' },
  statusResolu: { background: '#006B3F15', color: '#006B3F', border: '1px solid #006B3F30' },
  cardDesc: { color: '#0F1B2D', fontSize: 15, margin: '0 0 12px', lineHeight: 1.6 },
  cardMeta: { display: 'flex', gap: 16, fontSize: 13, color: '#6B7785', flexWrap: 'wrap' },
  cardActions: { display: 'flex', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #E5DCC9', alignItems: 'center' },
  actionStatus: { display: 'flex', alignItems: 'center', gap: 10 },
  actionLabel: { fontSize: 13, color: '#6B7785', fontWeight: 600 },
  actionSelect: { background: '#FFFFFF', border: '1px solid #E5DCC9', color: '#0F1B2D', padding: '9px 14px', borderRadius: 10, fontSize: 14, outline: 'none' },
  btnUpvote: { background: '#FF6700', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600 },
  empty: { textAlign: 'center', padding: 60, background: '#FFFFFF', borderRadius: 16, border: '1px solid #E5DCC9' },
  emptyIcon: { fontSize: 48, display: 'block', marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: '#0F1B2D', margin: '0 0 8px' },
  emptySub: { fontSize: 14, color: '#6B7785' },
}

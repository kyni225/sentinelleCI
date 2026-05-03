import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { auth, onSignalements, updateStatus, upvoteReport, logoutUser, onAuthStateChanged } from '../firebase'
import { CATS, STATUS_META } from '../constants'
import { timeAgo } from '../utils'

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function statusColor(st) {
  return st === 'resolu' ? '#16A34A' : st === 'soumis' ? '#F59E0B' : st === 'en_cours' ? '#006B3F' : st === 'valide' ? '#006B3F' : '#9333EA'
}

function MapMarker({ s, onClick }) {
  const color = statusColor(s.status)
  const icon = L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;">${(CATS[s.category] || CATS.autre).label.charAt(0)}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
  return (
    <Marker position={[s.latitude || 5.345, s.longitude || -4.024]} icon={icon} eventHandlers={{ click: () => onClick(s) }}>
      <Popup>
        <b>#{s.number || s.id.slice(0, 6)}</b> {(CATS[s.category] || CATS.autre).label}<br />
        {s.quartier}<br />
        <small>{(s.description || '').substring(0, 80)}...</small>
      </Popup>
    </Marker>
  )
}

function FitBounds({ signalements }) {
  const map = useMap()
  useEffect(() => {
    const valid = signalements.filter(s => s.latitude && s.longitude)
    if (valid.length > 0) {
      const bounds = L.latLngBounds(valid.map(s => [s.latitude, s.longitude]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [signalements, map])
  return null
}

export default function MairieDashboard() {
  const nav = useNavigate()
  const [signalements, setSignalements] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('dashboard')
  const [selected, setSelected] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (!u) nav('/mairie'); else setUser(u) })
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
        || (s.number || '').toLowerCase().includes(q)
        || (s.address || '').toLowerCase().includes(q)
    }
    return true
  })

  const countStatus = (st) => signalements.filter(s => s.status === st).length
  const countPriority = (p) => signalements.filter(s => s.ai?.priority === p).length
  const resolutionRate = signalements.length > 0 ? Math.round(countStatus('resolu') / signalements.length * 100) : 0

  const handleLogout = async () => {
    await logoutUser()
    nav('/')
  }

  const openDetail = (s) => setSelected(s)
  const closeDetail = () => setSelected(null)

  const lastLogin = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div>
            <h1 style={s.headerTitle}>SentinelleCI</h1>
            <span style={s.headerSub}>Tableau de bord communal</span>
          </div>
        </div>
        <div style={s.headerRight}>
          <span style={s.live}><span style={s.pulseDot}></span> LIVE</span>
          <button style={s.btnLogout} onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      {/* Tabs */}
      <nav style={s.tabs}>
        <button style={{ ...s.tabBtn, ...(tab === 'dashboard' ? s.tabActive : {}) }} onClick={() => setTab('dashboard')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Tableau de bord
        </button>
        <button style={{ ...s.tabBtn, ...(tab === 'map' ? s.tabActive : {}) }} onClick={() => setTab('map')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          Carte
        </button>
        <button style={{ ...s.tabBtn, ...(tab === 'profile' ? s.tabActive : {}) }} onClick={() => setTab('profile')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Profil
        </button>
      </nav>

      {/* ===== DASHBOARD TAB ===== */}
      {tab === 'dashboard' && (
        <div style={s.content}>
          {/* Stats */}
          <div style={s.statsRow}>
            <div style={s.statCard}><span style={{ ...s.statNum, color: '#006B3F' }}>{signalements.length}</span><span style={s.statLabel}>Total</span></div>
            <div style={s.statCard}><span style={{ ...s.statNum, color: '#F59E0B' }}>{countStatus('soumis')}</span><span style={s.statLabel}>En attente</span></div>
            <div style={s.statCard}><span style={{ ...s.statNum, color: '#006B3F' }}>{countStatus('en_cours')}</span><span style={s.statLabel}>En cours</span></div>
            <div style={s.statCard}><span style={{ ...s.statNum, color: '#006B3F' }}>{countStatus('resolu')}</span><span style={s.statLabel}>Résolus</span></div>
            <div style={s.statCard}><span style={{ ...s.statNum, color: '#DC2626' }}>{countPriority('P1')}</span><span style={s.statLabel}>Urgences</span></div>
          </div>

          {/* Filters */}
          <div style={s.filters}>
            <div style={s.filterGroup}>
              <label style={s.filterLabel}>Statut</label>
              <select style={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Tous</option><option value="soumis">Soumis</option><option value="valide">Validé</option><option value="en_cours">En cours</option><option value="resolu">Résolu</option>
              </select>
            </div>
            <div style={s.filterGroup}>
              <label style={s.filterLabel}>Priorité</label>
              <select style={s.select} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="">Toutes</option><option value="P1">P1</option><option value="P2">P2</option>
              </select>
            </div>
            <div style={{ ...s.filterGroup, flex: 1, minWidth: 240 }}>
              <label style={s.filterLabel}>Recherche</label>
              <input style={{ ...s.select, paddingLeft: 14 }} placeholder="Quartier, catégorie..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div style={s.resultCount}>{filtered.length} signalement{filtered.length > 1 ? 's' : ''}</div>

          {filtered.length === 0 && (
            <div style={s.empty}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📭</span>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#0F1B2D', margin: '0 0 8px' }}>Aucun signalement</p>
              <span style={{ fontSize: 14, color: '#6B7785' }}>Les nouveaux signalements apparaîtront ici en temps réel.</span>
            </div>
          )}

          {/* Cards */}
          {filtered.map(sig => (
            <div key={sig.id} style={{ ...s.card, borderLeftColor: statusColor(sig.status), cursor: 'pointer' }} onClick={() => openDetail(sig)}>
              <div style={s.cardTop}>
                {sig.photoUris && sig.photoUris[0] ? (
                  <img src={sig.photoUris[0]} style={s.cardThumb} alt="" />
                ) : (
                  <div style={{ ...s.cardIconWrap, background: (CATS[sig.category]?.hue || '#9333EA') + '22' }}>
                    <span style={{ fontSize: 18 }}>{(CATS[sig.category] || CATS.autre).icon}</span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.cardTopRow}>
                    <span style={s.cardNumber}>#{sig.number || sig.id.slice(0, 6)}</span>
                    <span style={s.cardCat}>{(CATS[sig.category] || CATS.autre).label}</span>
                    {sig.ai?.priority && sig.ai.priority !== 'P3' && (
                      <span style={{ ...s.cardPriority, ...(sig.ai.priority === 'P1' ? s.prioP1 : s.prioP2) }}>{sig.ai.priority}</span>
                    )}
                    <span style={{ ...s.cardStatus, ...(STATUS_META[sig.status] || STATUS_META.soumis) }}>
                      {(STATUS_META[sig.status] || STATUS_META.soumis).label}
                    </span>
                  </div>
                  <span style={s.cardTime}>{timeAgo(sig.createdAt)} · {sig.isAnonymous ? 'Citoyen anonyme' : (sig.authorPseudo || 'Anonyme')}</span>
                </div>
              </div>
              <p style={s.cardDesc}>{sig.description}</p>
              <div style={s.cardMeta}>
                <span>📍 {sig.quartier}{sig.address ? ` — ${sig.address}` : ''}</span>
                <span>👍 {sig.upvotes || 0}</span>
                {sig.ai?.severity && <span>🤖 {sig.ai.severity}</span>}
              </div>
              <div style={s.cardActions} onClick={e => e.stopPropagation()}>
                <div style={s.actionStatus}>
                  <label style={s.actionLabel}>Statut :</label>
                  <select style={s.actionSelect} value={sig.status} onChange={e => updateStatus(sig.id, e.target.value)}>
                    <option value="soumis">Soumis</option><option value="valide">Validé</option><option value="en_cours">En cours</option><option value="resolu">Résolu</option>
                  </select>
                </div>
                <button style={s.btnUpvote} onClick={() => upvoteReport(sig.id)}>👍 Soutenir</button>
                <button style={s.btnMap} onClick={() => { openDetail(sig); setTab('map') }}>📍 Voir sur carte</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== MAP TAB ===== */}
      {tab === 'map' && (
        <div style={{ height: 'calc(100vh - 130px)', width: '100%', position: 'relative' }}>
          <MapContainer center={[5.345, -4.024]} zoom={13} style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }} scrollWheelZoom={true}>
            <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FitBounds signalements={signalements} />
            {signalements.filter(sig => sig.latitude && sig.longitude).map(sig => (
              <MapMarker key={sig.id} s={sig} onClick={openDetail} />
            ))}
          </MapContainer>
        </div>
      )}

      {/* ===== PROFILE TAB ===== */}
      {tab === 'profile' && (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E5DCC9', marginBottom: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#006B3F15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F1B2D', margin: '0 0 4px' }}>Mairie de Yopougon</h2>
            <p style={{ fontSize: 14, color: '#006B3F', fontWeight: 600, margin: '0 0 4px' }}>Administrateur communal</p>
            <p style={{ fontSize: 14, color: '#6B7785', margin: 0 }}>{user?.email || ''}</p>
          </div>

          <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
            <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, padding: 20, border: '1px solid #E5DCC9', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#006B3F' }}>{signalements.length}</div>
              <div style={{ fontSize: 13, color: '#6B7785', marginTop: 4 }}>Signalements reçus</div>
            </div>
            <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, padding: 20, border: '1px solid #E5DCC9', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#006B3F' }}>{countStatus('resolu')}</div>
              <div style={{ fontSize: 13, color: '#6B7785', marginTop: 4 }}>Problèmes résolus</div>
            </div>
            <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, padding: 20, border: '1px solid #E5DCC9', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#006B3F' }}>{resolutionRate}%</div>
              <div style={{ fontSize: 13, color: '#6B7785', marginTop: 4 }}>Taux de résolution</div>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 24, border: '1px solid #E5DCC9', marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 16px' }}>Informations</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1ECE0', fontSize: 15 }}><span style={{ color: '#6B7785', fontWeight: 600 }}>Commune</span><span>Yopougon, Abidjan</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1ECE0', fontSize: 15 }}><span style={{ color: '#6B7785', fontWeight: 600 }}>Pays</span><span>Côte d'Ivoire</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 15 }}><span style={{ color: '#6B7785', fontWeight: 600 }}>Dernière connexion</span><span>{lastLogin}</span></div>
          </div>

          <button style={{ background: '#DC2626', color: '#FFFFFF', border: 'none', padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700, width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Se déconnecter
          </button>
        </div>
      )}

      {/* ===== DETAIL OVERLAY ===== */}
      {selected && (
        <div style={s.overlay} onClick={closeDetail}>
          <div style={s.detailPanel} onClick={e => e.stopPropagation()}>
            <button style={s.detailClose} onClick={closeDetail}>✕</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#0F1B2D' }}>#{selected.number || selected.id.slice(0, 6)}</span>
              <span style={{ background: '#F1ECE0', padding: '4px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#006B3F' }}>{(CATS[selected.category] || CATS.autre).label}</span>
              <span style={{ ...s.cardStatus, ...(STATUS_META[selected.status] || STATUS_META.soumis) }}>{(STATUS_META[selected.status] || STATUS_META.soumis).label}</span>
            </div>

            {selected.photoUris && selected.photoUris.length > 0 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16 }}>
                {selected.photoUris.map((p, i) => <img key={i} src={p} style={{ width: 140, height: 100, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} alt="" />)}
              </div>
            )}

            <p style={{ fontSize: 16, lineHeight: 1.7, color: '#0F1B2D', margin: '0 0 16px' }}>{selected.description}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#0F1B2D' }}>
                <span>📍</span> {selected.quartier}{selected.address ? ` — ${selected.address}` : ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#0F1B2D' }}>
                <span>🕐</span> {timeAgo(selected.createdAt)} · {selected.isAnonymous ? 'Citoyen anonyme' : (selected.authorPseudo || 'Anonyme')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#0F1B2D' }}>
                <span>👍</span> {selected.upvotes || 0} soutien{(selected.upvotes || 0) > 1 ? 's' : ''}
              </div>
              {selected.ai?.severity && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#0F1B2D' }}>
                  <span>🤖</span> IA : {selected.ai.severity} · {selected.ai.priority} · Confiance {Math.round((selected.ai.confidence || 0) * 100)}%
                </div>
              )}
            </div>

            {/* Mini map */}
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #E5DCC9', marginBottom: 16, height: 220, position: 'relative' }}>
              <MapContainer center={[selected.latitude || 5.345, selected.longitude || -4.024]} zoom={16} style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }} scrollWheelZoom={false} dragging={true}>
                <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[selected.latitude || 5.345, selected.longitude || -4.024]}>
                  <Popup>#{selected.number || selected.id.slice(0, 6)} — {(CATS[selected.category] || CATS.autre).label}</Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* History */}
            {selected.history && selected.history.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px' }}>Historique</h4>
                {selected.history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F1ECE0', fontSize: 14 }}>
                    <span style={{ ...s.cardStatus, ...(STATUS_META[h.status] || STATUS_META.soumis), fontSize: 12 }}>{(STATUS_META[h.status] || STATUS_META.soumis).label}</span>
                    <span style={{ color: '#6B7785' }}>{timeAgo(h.at)}</span>
                    {h.note && <span style={{ color: '#0F1B2D', fontStyle: 'italic' }}>{h.note}</span>}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid #E5DCC9' }}>
              <select style={{ ...s.actionSelect, fontSize: 15, padding: '10px 16px' }} value={selected.status} onChange={e => { updateStatus(selected.id, e.target.value); setSelected({ ...selected, status: e.target.value }) }}>
                <option value="soumis">Soumis</option><option value="valide">Validé</option><option value="en_cours">En cours</option><option value="resolu">Résolu</option>
              </select>
              <button style={s.btnUpvote} onClick={() => upvoteReport(selected.id)}>👍 Soutenir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#FAFAF7' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#FFFFFF', borderBottom: '1px solid #E5DCC9', position: 'sticky', top: 0, zIndex: 50 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: 700, color: '#006B3F', margin: 0 },
  headerSub: { fontSize: 13, color: '#6B7785' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 14 },
  live: { background: '#DC262615', color: '#DC2626', padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #DC262630' },
  pulseDot: { width: 8, height: 8, borderRadius: '50%', background: '#DC2626', display: 'inline-block', animation: 'pulse 2s infinite' },
  btnLogout: { background: '#EFE9DD', color: '#006B3F', border: '1px solid #E5DCC9', padding: '9px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' },

  tabs: { display: 'flex', background: '#FFFFFF', borderBottom: '2px solid #E5DCC9', padding: '0 24px' },
  tabBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', background: 'none', border: 'none', borderBottom: '3px solid transparent', color: '#6B7785', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: -2 },
  tabActive: { color: '#006B3F', borderBottomColor: '#006B3F' },

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

  card: { background: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid #E5DCC9', marginBottom: 12, borderLeft: '4px solid #E5DCC9', transition: 'transform 0.2s' },
  cardTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardThumb: { width: 52, height: 52, borderRadius: 14, objectFit: 'cover', background: '#F1ECE0' },
  cardIconWrap: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTopRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardNumber: { fontWeight: 700, fontSize: 16, color: '#0F1B2D' },
  cardCat: { background: '#F1ECE0', padding: '4px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#006B3F' },
  cardPriority: { padding: '4px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700 },
  prioP1: { background: '#DC2626', color: '#FFFFFF' },
  prioP2: { background: '#F59E0B', color: '#0F1B2D' },
  cardStatus: { padding: '4px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600 },
  cardTime: { fontSize: 13, color: '#6B7785', whiteSpace: 'nowrap' },
  cardDesc: { color: '#0F1B2D', fontSize: 15, margin: '0 0 12px', lineHeight: 1.6 },
  cardMeta: { display: 'flex', gap: 16, fontSize: 13, color: '#6B7785', flexWrap: 'wrap' },
  cardActions: { display: 'flex', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #E5DCC9', alignItems: 'center' },
  actionStatus: { display: 'flex', alignItems: 'center', gap: 10 },
  actionLabel: { fontSize: 13, color: '#6B7785', fontWeight: 600 },
  actionSelect: { background: '#FFFFFF', border: '1px solid #E5DCC9', color: '#0F1B2D', padding: '9px 14px', borderRadius: 10, fontSize: 14, outline: 'none' },
  btnUpvote: { background: '#FF6700', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnMap: { background: '#006B3F', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  empty: { textAlign: 'center', padding: 60, background: '#FFFFFF', borderRadius: 16, border: '1px solid #E5DCC9' },

  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  detailPanel: { background: '#FFFFFF', borderRadius: 20, padding: 24, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
  detailClose: { position: 'absolute', top: 16, right: 16, background: '#F1ECE0', border: 'none', width: 32, height: 32, borderRadius: 16, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}

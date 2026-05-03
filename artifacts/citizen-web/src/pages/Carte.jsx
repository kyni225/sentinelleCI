import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { auth, onSignalements } from '../firebase'
import { CATS, STATUS_META } from '../constants'
import { timeAgo } from '../utils'
import BottomNav from '../components/BottomNav'

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function FitBounds({ reports }) {
  const map = useMap()
  useEffect(() => {
    const valid = reports.filter(r => r.latitude && r.longitude)
    if (valid.length > 0) {
      const bounds = L.latLngBounds(valid.map(r => [r.latitude, r.longitude]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [reports, map])
  return null
}

function ReportMarker({ r, onClick }) {
  const cat = CATS[r.category] || CATS.autre
  const icon = L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${cat.hue};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:12px;">${cat.icon}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
  return (
    <Marker position={[r.latitude || 5.345, r.longitude || -4.024]} icon={icon} eventHandlers={{ click: () => onClick(r) }}>
      <Popup>
        <b>{cat.label} · {r.quartier}</b><br />
        <small>{timeAgo(r.createdAt)} · {(STATUS_META[r.status] || STATUS_META.soumis).label}</small>
      </Popup>
    </Marker>
  )
}

const FILTERS = [
  { id: 'all', label: 'Tous' },
  ...Object.entries(CATS).map(([id, c]) => ({ id, label: c.label, hue: c.hue })),
]


export default function Carte() {
  const nav = useNavigate()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

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

  const filtered = useMemo(() => {
    let r = reports
    if (filter !== 'all') r = r.filter(x => x.category === filter)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      r = r.filter(x =>
        (x.quartier || '').toLowerCase().includes(q) ||
        (x.address || '').toLowerCase().includes(q) ||
        (x.description || '').toLowerCase().includes(q)
      )
    }
    return r
  }, [reports, filter, search])

  const stats = useMemo(() => {
    const total = filtered.length
    const enCours = filtered.filter(r => ['soumis', 'valide', 'en_cours'].includes(r.status)).length
    const resolus = filtered.filter(r => r.status === 'resolu').length
    return { total, enCours, resolus }
  }, [filtered])

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => nav('/citoyen')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Retour
        </button>
        <h1 style={s.headerTitle}>Carte</h1>
        <div style={{ width: 70 }}></div>
      </header>

      <div style={s.content}>
        {/* Search */}
        <div style={s.searchWrap}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7785" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input style={s.searchInput} type="text" placeholder="Rechercher quartier, adresse..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statChip}><span style={{ ...s.statNum, color: '#006B3F' }}>{stats.total}</span><span style={s.statLabel}>Total</span></div>
          <div style={s.statChip}><span style={{ ...s.statNum, color: '#B45309' }}>{stats.enCours}</span><span style={s.statLabel}>En cours</span></div>
          <div style={s.statChip}><span style={{ ...s.statNum, color: '#15803D' }}>{stats.resolus}</span><span style={s.statLabel}>Résolus</span></div>
        </div>

        {/* Category filters */}
        <div style={s.filterRow}>
          {FILTERS.map(f => {
            const active = filter === f.id
            return (
              <button key={f.id} style={{
                ...s.filterChip,
                background: active ? (f.hue || '#0F1B2D') : '#FFFFFF',
                color: active ? '#FFFFFF' : '#0F1B2D',
                borderColor: active ? (f.hue || '#0F1B2D') : '#E5DCC9',
              }} onClick={() => setFilter(f.id)}>
                {f.id !== 'all' && <span style={{ marginRight: 4, fontSize: 12 }}>{CATS[f.id]?.icon}</span>}
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Map */}
        <div style={s.mapContainer}>
          <MapContainer center={[5.345, -4.024]} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FitBounds reports={filtered} />
            {filtered.filter(r => r.latitude && r.longitude).map(r => (
              <ReportMarker key={r.id} r={r} onClick={setSelected} />
            ))}
          </MapContainer>
        </div>

        {/* Selected report card */}
        {selected && (
          <div style={s.selectedCard} onClick={() => nav('/signalement/' + selected.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              {selected.photoUris && selected.photoUris[0] ? (
                <img src={selected.photoUris[0]} style={s.cardThumb} alt="" />
              ) : (
                <div style={{ ...s.cardIconWrap, background: (CATS[selected.category]?.hue || '#9333EA') + '15' }}>
                  <span style={{ fontSize: 16 }}>{CATS[selected.category]?.icon || '📌'}</span>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0F1B2D', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {(CATS[selected.category]?.label || 'Autre') + ' · ' + (selected.quartier || '')}
                </span>
                <span style={{ fontSize: 12, color: '#6B7785' }}>{timeAgo(selected.createdAt)} · {selected.address || selected.quartier}</span>
              </div>
              <span style={{ ...s.statusBadge, background: (STATUS_META[selected.status] || STATUS_META.soumis).bg, color: (STATUS_META[selected.status] || STATUS_META.soumis).color }}>
                {(STATUS_META[selected.status] || STATUS_META.soumis).label}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#0F1B2D', margin: 0, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{selected.description}</p>
          </div>
        )}

        {/* List below map */}
        <div style={s.listSection}>
          <h3 style={s.listTitle}>Tous les signalements</h3>
          {filtered.length === 0 && (
            <div style={s.empty}>
              <span style={{ fontSize: 28 }}>🗺️</span>
              <p style={{ fontWeight: 700, color: '#0F1B2D', marginTop: 8 }}>Aucun signalement</p>
              <p style={{ fontSize: 13, color: '#6B7785' }}>Changez les filtres ou signalez un problème.</p>
            </div>
          )}
          {filtered.map(r => {
            const cat = CATS[r.category] || { label: 'Autre', hue: '#9333EA', icon: '📌' }
            const photo = r.photoUris && r.photoUris[0]
            return (
              <div key={r.id} style={s.card} onClick={() => nav('/signalement/' + r.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {photo ? (
                    <img src={photo} style={s.cardThumb} alt="" />
                  ) : (
                    <div style={{ ...s.cardIconWrap, background: cat.hue + '15' }}>
                      <span style={{ color: cat.hue, fontSize: 16 }}>{cat.icon}</span>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0F1B2D' }}>{cat.label} · {r.quartier}</span>
                    <span style={{ fontSize: 12, color: '#6B7785', display: 'block', marginTop: 2 }}>{timeAgo(r.createdAt)} · {r.address || r.quartier}</span>
                  </div>
                  <span style={{ ...s.statusBadge, background: (STATUS_META[r.status] || STATUS_META.soumis).bg, color: (STATUS_META[r.status] || STATUS_META.soumis).color }}>
                    {(STATUS_META[r.status] || STATUS_META.soumis).label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        {/* Légende des priorités */}
        <div style={s.legendCard}>
          <h3 style={s.legendTitle}>Légende des priorités</h3>
          <p style={s.legendIntro}>L'intelligence artificielle classe chaque signalement selon la gravité, le contexte et le nombre de citoyens qui le confirment.</p>
          <div style={s.legendItem}>
            <span style={{ ...s.legendDot, background: '#DC2626' }}>P1</span>
            <div>
              <span style={s.legendLabel}>Urgence absolue</span>
              <span style={s.legendDesc}>Risque immédiat pour la vie ou la sécurité publique.</span>
            </div>
          </div>
          <div style={s.legendItem}>
            <span style={{ ...s.legendDot, background: '#F59E0B' }}>P2</span>
            <div>
              <span style={s.legendLabel}>Intervention rapide</span>
              <span style={s.legendDesc}>Doit être traité dans les 48 h pour éviter une dégradation.</span>
            </div>
          </div>
          <div style={s.legendItem}>
            <span style={{ ...s.legendDot, background: '#6B7785' }}>P3</span>
            <div>
              <span style={s.legendLabel}>Suivi normal</span>
            </div>
          </div>
        </div>
      </div>
      <BottomNav active="carte" />
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#FAFAF7', paddingBottom: 80 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#FFFFFF', borderBottom: '1px solid #E5DCC9', position: 'sticky', top: 0, zIndex: 50 },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#006B3F', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  headerTitle: { fontSize: 18, fontWeight: 800, color: '#0F1B2D', margin: 0 },
  content: { maxWidth: 600, margin: '0 auto', padding: '0 20px 24px' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 10, background: '#FFFFFF', border: '1px solid #E5DCC9', borderRadius: 14, padding: '10px 16px', marginTop: 16 },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#0F1B2D', background: 'transparent' },
  statsRow: { display: 'flex', gap: 10, marginTop: 14 },
  statChip: { flex: 1, background: '#FFFFFF', border: '1px solid #E5DCC9', borderRadius: 12, padding: '10px 12px', textAlign: 'center' },
  statNum: { fontSize: 20, fontWeight: 800, display: 'block' },
  statLabel: { fontSize: 11, color: '#6B7785', fontWeight: 500, display: 'block', marginTop: 2 },
  filterRow: { display: 'flex', gap: 6, overflowX: 'auto', padding: '14px 0 10px' },
  filterChip: { padding: '7px 14px', borderRadius: 20, border: '1px solid #E5DCC9', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 600 },
  mapContainer: { position: 'relative', width: '100%', height: 280, borderRadius: 16, overflow: 'hidden', border: '1px solid #E5DCC9', marginTop: 10, background: '#E8F5E9' },
  mapPlaceholder: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', zIndex: 1 },
  mapPins: { position: 'absolute', inset: 0, zIndex: 2 },
  mapPin: { position: 'absolute', width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', border: '2px solid #FFFFFF', transition: 'transform 0.15s' },
  selectedCard: { background: '#FFFFFF', borderRadius: 16, padding: 14, border: '1px solid #006B3F', marginTop: 10, cursor: 'pointer' },
  cardThumb: { width: 40, height: 40, borderRadius: 10, objectFit: 'cover' },
  cardIconWrap: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statusBadge: { padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' },
  listSection: { marginTop: 22 },
  listTitle: { fontSize: 18, fontWeight: 700, color: '#0F1B2D', margin: '0 0 12px' },
  empty: { textAlign: 'center', padding: 30, borderRadius: 16, border: '1px solid #E5DCC9', background: '#FFFFFF' },
  card: { background: '#FFFFFF', borderRadius: 14, padding: 12, border: '1px solid #E5DCC9', marginBottom: 8, cursor: 'pointer' },
  legendCard: { background: '#FFFFFF', borderRadius: 16, padding: 16, border: '1px solid #E5DCC9', marginTop: 22 },
  legendTitle: { fontSize: 16, fontWeight: 700, color: '#0F1B2D', margin: '0 0 8px' },
  legendIntro: { fontSize: 13, color: '#6B7785', lineHeight: 1.5, margin: '0 0 14px' },
  legendItem: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  legendDot: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 700, fontSize: 12, flexShrink: 0 },
  legendLabel: { fontWeight: 700, fontSize: 14, color: '#0F1B2D', display: 'block' },
  legendDesc: { fontSize: 12, color: '#6B7785', marginTop: 2, display: 'block', lineHeight: 1.4 },
}

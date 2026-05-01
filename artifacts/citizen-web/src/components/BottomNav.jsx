import React from 'react'
import { useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/citoyen', key: 'home', label: 'Accueil', icon: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { path: '/mes-signalements', key: 'suivi', label: 'Suivi', icon: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { path: '/signaler', key: 'signaler', label: 'Signaler', center: true, icon: (c) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
  { path: '/carte', key: 'carte', label: 'Carte', icon: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg> },
  { path: '/profil', key: 'profil', label: 'Profil', icon: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
]

export default function BottomNav({ active }) {
  const nav = useNavigate()
  return (
    <nav style={styles.bottomNav}>
      {NAV_ITEMS.map(item => {
        const isActive = active === item.key
        const color = isActive ? '#006B3F' : '#6B7785'
        if (item.center) {
          return (
            <button key={item.key} style={styles.centerBtn} onClick={() => nav(item.path)}>
              <div style={styles.centerCircle}>
                {item.icon('#FFFFFF')}
              </div>
              <span style={isActive ? styles.navLabelActive : styles.navLabel}>{item.label}</span>
            </button>
          )
        }
        return (
          <button key={item.key} style={styles.navBtn} onClick={() => nav(item.path)}>
            {item.icon(color)}
            <span style={isActive ? styles.navLabelActive : styles.navLabel}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

const styles = {
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', background: '#FFFFFF', borderTop: '1px solid #E5DCC9', padding: '6px 0 12px', zIndex: 50 },
  navBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', padding: '8px 12px 6px', color: '#6B7785', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', minHeight: 48, minWidth: 48 },
  centerBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', WebkitTapHighlightColor: 'transparent', marginTop: -18 },
  centerCircle: { width: 52, height: 52, borderRadius: 26, background: '#FF6700', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,103,0,0.35)' },
  navLabelActive: { fontSize: 11, fontWeight: 700, color: '#006B3F' },
  navLabel: { fontSize: 11, fontWeight: 500, color: '#6B7785' },
}

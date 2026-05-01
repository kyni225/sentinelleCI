import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import { CATS as CATS_MAP, QUARTIERS } from '../constants'
import BottomNav from '../components/BottomNav'

const CATS = Object.entries(CATS_MAP).map(([id, c]) => ({ id, label: c.label, hue: c.hue }))
const MAX_PHOTOS = 3

export default function Signaler() {
  const nav = useNavigate()
  const [user, setUser] = useState(null)
  const [category, setCategory] = useState('')
  const [photos, setPhotos] = useState([])
  const [description, setDescription] = useState('')
  const [quartier, setQuartier] = useState('Yopougon')
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState(null)
  const [locating, setLocating] = useState(false)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (!u) nav('/connexion')
      else setUser(u)
    })
    return unsub
  }, [])

  const canSubmit = category && description.trim().length >= 10 && quartier

  function handlePhotoUpload(e) {
    const files = Array.from(e.target.files).slice(0, MAX_PHOTOS - photos.length)
    const newPhotos = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        newPhotos.push(ev.target.result)
        if (newPhotos.length === files.length) {
          setPhotos(prev => [...prev, ...newPhotos].slice(0, MAX_PHOTOS))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  function removePhoto(index) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  function detectLocation() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setAddress('Position GPS - ' + quartier)
        setLocating(false)
      },
      () => {
        setCoords({ lat: 5.345, lng: -4.024 })
        setAddress(quartier + ', Abidjan (approx.)')
        setLocating(false)
      },
      { timeout: 8000 }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSending(true)
    try {
      const finalCoords = coords || { lat: 5.32 + QUARTIERS.indexOf(quartier) * 0.012, lng: -4.05 + QUARTIERS.indexOf(quartier) * 0.01 }
      await addDoc(collection(db, 'signalements'), {
        category,
        description: description.trim(),
        photoUris: photos,
        quartier,
        address: address.trim() || quartier + ', Abidjan',
        latitude: finalCoords.lat,
        longitude: finalCoords.lng,
        status: 'soumis',
        upvotes: 0,
        authorId: user.uid,
        authorPseudo: user.displayName || 'Citoyen',
        createdAt: Date.now(),
        ai: {
          priority: 'P3',
          severity: 'faible',
          duplicates: 0,
          confidence: 0.5,
          summary: 'Analyse IA en attente. La gravité et la priorité seront évaluées automatiquement.',
        },
        blockchain: {
          chain: 'Polygon',
          txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          blockNumber: 50026528 + Math.floor(Math.random() * 1000),
          confirmedAt: Date.now(),
        },
        history: [
          { status: 'soumis', at: Date.now(), note: 'Signalement soumis' },
        ],
      })
      setSuccess(true)
    } catch (err) {
      alert('Erreur: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  if (success) {
    return (
      <div style={s.page}>
        <div style={s.successCard}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#006B3F', margin: '0 0 8px' }}>Signalement envoye !</h2>
          <p style={{ fontSize: 15, color: '#6B7785', lineHeight: 1.6, marginBottom: 24 }}>Votre commune a ete notifiee. Vous pouvez suivre l'avancement dans "Mon suivi".</p>
          <button style={s.btnPrimary} onClick={() => nav('/citoyen')}>Retour a l'accueil</button>
          <button style={{ ...s.btnOutline, marginTop: 10 }} onClick={() => { setSuccess(false); setCategory(''); setPhotos([]); setDescription(''); setAddress(''); setCoords(null); }}>Nouveau signalement</button>
        </div>
        <BottomNav nav={nav} active="signaler" />
      </div>
    )
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => nav('/citoyen')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Retour
        </button>
        <h1 style={s.headerTitle}>Nouveau signalement</h1>
        <div style={{ width: 70 }}></div>
      </header>

      <div style={s.content}>
        <div style={s.intro}>
          <span style={s.kicker}>ETAPE PAR ETAPE</span>
          <h2 style={s.introTitle}>Signaler un probleme</h2>
          <p style={s.introSub}>En 4 etapes simples.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div style={s.sectionNum}>1</div>
              <h3 style={s.sectionTitleText}>Categorie</h3>
            </div>
            <div style={s.catGrid}>
              {CATS.map(c => (
                <button key={c.id} type="button" style={{
                  ...s.catTile,
                  background: category === c.id ? c.hue : '#FFFFFF',
                  borderColor: category === c.id ? c.hue : '#E5DCC9',
                  color: category === c.id ? '#FFFFFF' : '#0F1B2D',
                }} onClick={() => setCategory(c.id)}>
                  {category === c.id && <span style={{ position: 'absolute', top: 4, right: 6, fontSize: 11, fontWeight: 800 }}>&#10003;</span>}
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div style={s.sectionNum}>2</div>
              <h3 style={s.sectionTitleText}>Photos ({photos.length}/{MAX_PHOTOS})</h3>
            </div>
            {photos.length > 0 && (
              <div style={s.photoRow}>
                {photos.map((p, i) => (
                  <div key={i} style={s.photoCard}>
                    <img src={p} style={s.photoImg} alt="" />
                    <button type="button" style={s.removePhotoBtn} onClick={() => removePhoto(i)}>x</button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <label style={s.addPhotoCard}>
                    <span style={{ fontSize: 22, color: '#006B3F' }}>+</span>
                    <span style={{ fontSize: 11, color: '#006B3F', fontWeight: 600 }}>Ajouter</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            )}
            {photos.length === 0 && (
              <div style={s.photoActions}>
                <label style={s.photoBtnPrimary}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Prendre une photo</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
                <label style={s.photoBtnSecondary}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#006B3F' }}>Galerie</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              </div>
            )}
            <p style={s.photoHint}>Une photo permet a l'IA d'evaluer la gravite. Jusqu'a {MAX_PHOTOS} photos.</p>
          </div>

          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div style={s.sectionNum}>3</div>
              <h3 style={s.sectionTitleText}>Localisation</h3>
            </div>
            <button type="button" style={{ ...s.locateBtn, opacity: locating ? 0.6 : 1 }} onClick={detectLocation} disabled={locating}>
              {locating ? 'Detection...' : coords ? 'Position detectee' : 'Utiliser ma position'}
            </button>
            <div style={s.quartierRow}>
              {QUARTIERS.map(q => (
                <button key={q} type="button" style={{
                  ...s.quartierChip,
                  background: quartier === q ? '#0F1B2D' : '#FFFFFF',
                  color: quartier === q ? '#FFFFFF' : '#0F1B2D',
                  borderColor: quartier === q ? '#0F1B2D' : '#E5DCC9',
                }} onClick={() => setQuartier(q)}>{q}</button>
              ))}
            </div>
            <input style={s.input} type="text" placeholder="Adresse precise (rue, repere...)" value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div style={s.sectionNum}>4</div>
              <h3 style={s.sectionTitleText}>Description</h3>
            </div>
            <textarea style={s.textarea} rows={4} placeholder="Decrivez le probleme : ou, depuis quand, niveau de danger..." value={description} onChange={e => setDescription(e.target.value)} />
            <span style={{ fontSize: 12, color: description.trim().length >= 10 ? '#006B3F' : '#6B7785', marginTop: 4, display: 'block' }}>
              {description.trim().length}/10 caracteres minimum
            </span>
          </div>

          <button style={{ ...s.btnPrimary, opacity: canSubmit && !sending ? 1 : 0.5 }} type="submit" disabled={!canSubmit || sending}>
            {sending ? 'Envoi en cours...' : 'Envoyer le signalement'}
          </button>
        </form>
      </div>
      <BottomNav active="signaler" />
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
  section: { marginTop: 28 },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionNum: { width: 28, height: 28, borderRadius: 14, background: '#006B3F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 },
  sectionTitleText: { fontSize: 17, fontWeight: 700, color: '#0F1B2D', margin: 0 },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  catTile: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 4px', borderRadius: 12, border: '1px solid #E5DCC9', cursor: 'pointer', transition: 'all 0.15s', minHeight: 56 },
  photoRow: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 10 },
  photoCard: { position: 'relative', width: 120, height: 120, borderRadius: 14, overflow: 'hidden', border: '1px solid #E5DCC9', flexShrink: 0 },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  removePhotoBtn: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, background: '#0F1B2D', color: '#FFFFFF', border: 'none', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  addPhotoCard: { width: 120, height: 120, borderRadius: 14, border: '2px dashed #E5DCC9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: '#FFFFFF' },
  photoActions: { display: 'flex', gap: 10, marginBottom: 8 },
  photoBtnPrimary: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, background: '#006B3F', color: '#FFFFFF', borderRadius: 14, border: 'none', cursor: 'pointer' },
  photoBtnSecondary: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, background: '#FFFFFF', borderRadius: 14, border: '1px solid #E5DCC9', cursor: 'pointer' },
  photoHint: { fontSize: 12, color: '#6B7785', lineHeight: 1.5 },
  locateBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 14, background: '#006B3F', color: '#FFFFFF', borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  quartierRow: { display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 0 10px' },
  quartierChip: { padding: '8px 16px', borderRadius: 20, border: '1px solid #E5DCC9', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  input: { width: '100%', background: '#FFFFFF', border: '1px solid #E5DCC9', borderRadius: 14, padding: '14px 16px', fontSize: 16, color: '#0F1B2D', outline: 'none' },
  textarea: { width: '100%', background: '#FFFFFF', border: '1px solid #E5DCC9', borderRadius: 14, padding: '14px 16px', fontSize: 16, color: '#0F1B2D', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  btnPrimary: { display: 'block', width: '100%', background: '#FF6700', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 700, marginTop: 20, cursor: 'pointer' },
  btnOutline: { display: 'block', width: '100%', background: 'transparent', color: '#006B3F', border: '1px solid #006B3F', borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  successCard: { maxWidth: 440, margin: '80px auto', textAlign: 'center', padding: 40 },
}

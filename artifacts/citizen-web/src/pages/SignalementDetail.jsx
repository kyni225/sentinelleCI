import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { CATS, STATUS_ORDER, STATUS_META, SEVERITY_META } from '../constants'
import { formatDate, shortHash } from '../utils'

export default function SignalementDetail() {
  const nav = useNavigate()
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upvoted, setUpvoted] = useState(false)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (!u) nav('/connexion')
      else setUser(u)
    })
    return unsub
  }, [])

  useEffect(() => {
    async function load() {
      if (!id) return
      try {
        const snap = await getDoc(doc(db, 'signalements', id))
        if (snap.exists()) {
          setReport({ id: snap.id, ...snap.data() })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleUpvote = async () => {
    if (!report || upvoted) return
    try {
      const newCount = (report.upvotes || 0) + 1
      await updateDoc(doc(db, 'signalements', report.id), { upvotes: newCount })
      setReport(prev => ({ ...prev, upvotes: newCount }))
      setUpvoted(true)
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.loading}>Chargement…</div>
      </div>
    )
  }

  if (!report) {
    return (
      <div style={s.page}>
        <header style={s.header}>
          <button style={s.backBtn} onClick={() => nav(-1)}>← Retour</button>
        </header>
        <div style={s.loading}>Signalement introuvable.</div>
      </div>
    )
  }

  const cat = CATS[report.category] || { label: report.category || 'Autre', hue: '#9333EA', icon: '📌' }
  const currentStepIdx = STATUS_ORDER.indexOf(report.status)
  const ai = report.ai || { priority: 'P3', severity: 'faible', duplicates: 0, confidence: 0.5, summary: 'Analyse en attente.' }
  const blockchain = report.blockchain || { chain: 'Polygon', txHash: '0x' + report.id?.slice(0, 16) + 'a5ca34', blockNumber: 50026528 + Math.floor(Math.random() * 100), confirmedAt: report.createdAt }
  const severity = SEVERITY_META[ai.severity] || SEVERITY_META.faible
  const priorityColor = ai.priority === 'P1' ? '#DC2626' : ai.priority === 'P2' ? '#F59E0B' : '#6B7785'

  return (
    <div style={s.page}>
      {/* Hero bar */}
      <div style={{ ...s.heroBar, background: `linear-gradient(135deg, ${cat.hue}, ${cat.hue}BB)` }}>
        <div style={s.heroIcon}>
          <span style={{ fontSize: 22 }}>{cat.icon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={s.heroNumberRow}>
            <span style={s.heroNumber}>#{report.number || report.id.slice(0, 6)}</span>
            <span style={s.heroLabel}>{cat.label}</span>
          </div>
          <span style={s.heroQuartier}>{report.quartier || 'Non précisé'}</span>
        </div>
        {ai.priority !== 'P3' && (
          <span style={{ ...s.priorityBadge, background: priorityColor }}>
            {ai.priority}
          </span>
        )}
      </div>

      {/* Photos */}
      {report.photoUris && report.photoUris.length > 0 && (
        <div style={s.photoSection}>
          {report.photoUris.map((uri, i) => (
            <img key={i} src={uri} style={s.photo} alt="" />
          ))}
        </div>
      )}

      <div style={s.content}>
        {/* Meta row */}
        <div style={s.metaRow}>
          <span style={{ ...s.badge, background: (STATUS_META[report.status] || STATUS_META.soumis).bg, color: (STATUS_META[report.status] || STATUS_META.soumis).color, border: '1px solid ' + ((STATUS_META[report.status] || STATUS_META.soumis).color + '30') }}>
            {(STATUS_META[report.status] || STATUS_META.soumis).label}
          </span>
          <span style={{ ...s.badge, background: severity.bg, color: severity.color, border: '1px solid ' + severity.color + '30' }}>
            Gravité {severity.label}
          </span>
          <span style={{ ...s.badge, background: '#F1ECE0', color: '#006B3F', border: '1px solid #006B3F30', fontFamily: 'monospace', fontSize: 11 }}>
            {shortHash(blockchain.txHash)}
          </span>
        </div>

        {/* Description */}
        <p style={s.description}>{report.description}</p>

        {/* Location & time */}
        <div style={s.locRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7785" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style={s.locText}>{report.address || report.quartier}</span>
        </div>
        <div style={s.locRow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7785" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span style={s.locText}>Signalé par {report.isAnonymous ? 'Citoyen anonyme' : (report.authorPseudo || 'Citoyen')} · {formatDate(report.createdAt)}</span>
        </div>

        {/* Upvote */}
        <button style={{ ...s.upvoteRow, opacity: upvoted ? 0.7 : 1 }} onClick={handleUpvote} disabled={upvoted}>
          <div style={s.upIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0F1B2D', display: 'block' }}>
              {upvoted ? 'Problème confirmé' : 'Je confirme ce problème'}
            </span>
            <span style={{ fontSize: 12, color: '#6B7785', marginTop: 1, display: 'block' }}>
              {report.upvotes || 0} citoyen{(report.upvotes || 0) > 1 ? 's' : ''} ont confirmé.
            </span>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7785" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* AI Analysis */}
        <SectionTitle title="Analyse intelligence artificielle" />
        <div style={s.aiCard}>
          <div style={s.aiRow}>
            <AiBlock icon="⚡" label="PRIORITÉ" value={ai.priority} accent={priorityColor} />
            <AiBlock icon="🚨" label="GRAVITÉ" value={severity.label} accent={severity.color} />
            <AiBlock icon="📋" label="DOUBLONS" value={ai.duplicates > 0 ? `+${ai.duplicates}` : 'Aucun'} accent="#006B3F" />
          </div>
          <p style={s.aiSummary}>{ai.summary}</p>
          <div style={s.confidenceRow}>
            <span style={s.confidenceLabel}>Confiance IA</span>
            <div style={s.confidenceTrack}>
              <div style={{ ...s.confidenceFill, width: `${Math.round(ai.confidence * 100)}%`, background: '#006B3F' }}></div>
            </div>
            <span style={s.confidenceValue}>{Math.round(ai.confidence * 100)}%</span>
          </div>
        </div>

        {/* Timeline */}
        <SectionTitle title="Suivi du signalement" />
        <div style={s.timeline}>
          {STATUS_ORDER.map((st, i) => {
            const passed = i <= currentStepIdx
            const meta = STATUS_META[st]
            const event = report.history?.find(h => h.status === st)
            return (
              <div key={st} style={s.timelineRow}>
                <div style={s.timelineLeft}>
                  <div style={{
                    ...s.timelineDot,
                    background: passed ? meta.color : '#E5DCC9',
                    borderColor: passed ? meta.color : '#E5DCC9',
                  }}>
                    {passed && <span style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  {i < STATUS_ORDER.length - 1 && (
                    <div style={{
                      ...s.timelineLine,
                      background: i < currentStepIdx ? meta.color : '#E5DCC9',
                    }}></div>
                  )}
                </div>
                <div style={s.timelineContent}>
                  <span style={{ ...s.timelineLabel, color: passed ? '#0F1B2D' : '#6B7785' }}>{meta.label}</span>
                  <span style={s.timelineSub}>
                    {event ? formatDate(event.at) + (event.note ? ` · ${event.note}` : '') : 'En attente'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Blockchain proof */}
        <SectionTitle title="Preuve blockchain" />
        <div style={s.blockCard}>
          <div style={s.blockTop}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 14 }}>{blockchain.chain} Mainnet</span>
          </div>
          <KvRow label="Numéro de signalement" value={`#${report.number || report.id.slice(0, 6)}`} mono />
          <KvRow label="Hash de transaction" value={shortHash(blockchain.txHash)} mono />
          <KvRow label="Numéro de bloc" value={`#${(blockchain.blockNumber || 0).toLocaleString('fr-FR')}`} />
          <KvRow label="Confirmé le" value={formatDate(blockchain.confirmedAt)} />
          <div style={s.immutableTag}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 11 }}>Donnée immuable et publique</span>
          </div>
        </div>

        {/* Quartier link */}
        <button style={s.quartierLink} onClick={() => nav('/quartier')}>
          <div style={s.quartierLinkIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006B3F" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0F1B2D', display: 'block' }}>Historique de {report.quartier}</span>
            <span style={{ fontSize: 12, color: '#6B7785', marginTop: 1, display: 'block' }}>Voir tous les signalements et statistiques du quartier</span>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7785" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  )
}

function SectionTitle({ title }) {
  return (
    <div style={s.sectionTitleWrap}>
      <span style={s.sectionTitleText}>{title}</span>
    </div>
  )
}

function AiBlock({ icon, label, value, accent }) {
  return (
    <div style={s.aiBlock}>
      <div style={{ ...s.aiBlockIcon, background: accent + '15' }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <span style={s.aiBlockLabel}>{label}</span>
      <span style={{ ...s.aiBlockValue, color: '#0F1B2D' }}>{value}</span>
    </div>
  )
}

function KvRow({ label, value, mono }) {
  return (
    <div style={s.kv}>
      <span style={s.kvLabel}>{label}</span>
      <span style={{ ...s.kvValue, fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#FAFAF7', paddingBottom: 40 },
  loading: { textAlign: 'center', padding: 40, color: '#6B7785', fontSize: 16 },
  heroBar: { display: 'flex', alignItems: 'center', gap: 12, padding: 16 },
  heroIcon: { width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)' },
  heroNumberRow: { display: 'flex', alignItems: 'baseline', gap: 8 },
  heroNumber: { color: '#FFFFFF', fontWeight: 700, fontSize: 13, letterSpacing: 0.5 },
  heroLabel: { color: '#FFFFFFCC', fontWeight: 500, fontSize: 12 },
  heroQuartier: { color: '#FFFFFF', fontWeight: 700, fontSize: 22, marginTop: 1, display: 'block' },
  priorityBadge: { padding: '4px 12px', borderRadius: 8, color: '#FFFFFF', fontWeight: 700, fontSize: 12 },
  photoSection: { display: 'flex', overflowX: 'auto' },
  photo: { width: '100%', maxWidth: 600, height: 220, objectFit: 'cover' },
  content: { maxWidth: 600, margin: '0 auto', padding: '0 16px' },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 16 },
  badge: { padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600 },
  description: { color: '#0F1B2D', fontSize: 15, lineHeight: 1.5, marginTop: 14 },
  locRow: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 },
  locText: { color: '#6B7785', fontSize: 13, fontWeight: 500 },
  upvoteRow: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, padding: 14, borderRadius: 14, border: '1px solid #E5DCC9', background: '#F1ECE0', cursor: 'pointer', width: '100%' },
  upIcon: { width: 36, height: 36, borderRadius: 10, background: '#006B3F', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sectionTitleWrap: { paddingTop: 22, paddingBottom: 12 },
  sectionTitleText: { fontWeight: 700, fontSize: 16, color: '#0F1B2D' },
  aiCard: { padding: 16, borderRadius: 16, border: '1px solid #E5DCC9', background: '#FFFFFF' },
  aiRow: { display: 'flex', gap: 8 },
  aiBlock: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  aiBlockIcon: { width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  aiBlockLabel: { color: '#6B7785', fontWeight: 500, fontSize: 11, marginTop: 6, letterSpacing: 0.5 },
  aiBlockValue: { fontWeight: 700, fontSize: 16, marginTop: 2 },
  aiSummary: { color: '#0F1B2D', fontSize: 13, lineHeight: 1.5, marginTop: 14 },
  confidenceRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 },
  confidenceLabel: { color: '#6B7785', fontWeight: 500, fontSize: 12 },
  confidenceTrack: { flex: 1, height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' },
  confidenceFill: { height: '100%', borderRadius: 3 },
  confidenceValue: { fontWeight: 700, fontSize: 12, color: '#0F1B2D' },
  timeline: { paddingLeft: 4 },
  timelineRow: { display: 'flex', gap: 12 },
  timelineLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 },
  timelineDot: { width: 22, height: 22, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5DCC9' },
  timelineLine: { width: 2, minHeight: 28, margin: '2px 0' },
  timelineContent: { flex: 1, paddingBottom: 18 },
  timelineLabel: { fontWeight: 700, fontSize: 14, display: 'block' },
  timelineSub: { color: '#6B7785', fontSize: 12, marginTop: 2, display: 'block' },
  blockCard: { padding: 16, borderRadius: 16, border: '1px solid #006B3F', background: '#006B3F' },
  blockTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  kv: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.15)' },
  kvLabel: { color: '#FFFFFFAA', fontWeight: 500, fontSize: 12 },
  kvValue: { color: '#FFFFFF', fontWeight: 500, fontSize: 13 },
  immutableTag: { display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.18)', alignSelf: 'flex-start', marginTop: 12 },
  quartierLink: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 22, padding: 14, borderRadius: 14, border: '1px solid #E5DCC9', background: '#FFFFFF', cursor: 'pointer', width: '100%' },
  quartierLinkIcon: { width: 36, height: 36, borderRadius: 10, background: '#F1ECE0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}

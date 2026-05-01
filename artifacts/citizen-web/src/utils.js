export function formatDate(ts) {
  if (!ts) return 'Non précisé'
  const d = new Date(ts)
  return d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function timeAgo(ts) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return "à l'instant"
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h} h`
  return `il y a ${Math.floor(h / 24)} j`
}

export function shortHash(hash) {
  if (!hash) return '0x0000…0000'
  return hash.slice(0, 8) + '…' + hash.slice(-6)
}

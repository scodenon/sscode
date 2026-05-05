export function formatMoney(amount: number, currency: string) {
  if (!Number.isFinite(amount)) return String(amount)
  try {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function formatNumber(amount: number, fractionDigits = 2) {
  if (!Number.isFinite(amount)) return String(amount)
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount)
}

export function parseAmount(input: string) {
  const raw = input.trim()
  if (!raw) return Number.NaN

  const cleaned = raw
    .replace(/s\//gi, '')
    .replace(/[\s\u00A0]/g, '')

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')

  let normalized = cleaned

  if (lastComma !== -1 && lastDot !== -1) {
    const decimalIsComma = lastComma > lastDot
    normalized = decimalIsComma
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned.replace(/,/g, '')
  } else if (lastComma !== -1) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.')
  } else {
    normalized = cleaned.replace(/,/g, '')
  }

  const n = Number(normalized)
  return Number.isFinite(n) ? n : Number.NaN
}

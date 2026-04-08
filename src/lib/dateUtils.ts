// Shared date formatting — dd Mmm yyyy (e.g. "18 Apr 2026")
const MONTHS_SHORT = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogs','Sep','Okt','Nov','Dis']

export function fmtDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr  // free-text: return as-is
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

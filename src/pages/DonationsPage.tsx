import { useEffect, useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Donation } from '../types'

// ── Constants ─────────────────────────────────────────────────────────────────
const KELAS = ['5 Juara', '5 Nekad', '5 Waja', '5 Fikir', '5 Rajin'] as const
type KelasKey = typeof KELAS[number] | 'General'

const MONTHS     = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogos','Sep','Okt','Nov','Dis']
const MONTH_DATES = [
  '2026-01-31','2026-02-28','2026-03-31','2026-04-30',
  '2026-05-31','2026-06-30','2026-07-31','2026-08-31',
  '2026-09-30','2026-10-31','2026-11-30','2026-12-31',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtRM(n: number, dash = false) {
  if (dash && n === 0) return '—'
  return 'RM ' + n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}
function getExpenseKelas(donorName: string): KelasKey {
  for (const k of KELAS) if (donorName.includes(k)) return k
  return 'General'
}
function numFmt(n: number) {
  return n === 0 ? '—' : n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Style constants ───────────────────────────────────────────────────────────
const thGrid: React.CSSProperties = {
  padding: '9px 7px', fontWeight: 700, fontSize: '0.62rem',
  textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap', letterSpacing: 0.3,
}
const tdGrid: React.CSSProperties = { padding: '8px 7px' }
const thList: React.CSSProperties = {
  padding: '7px 10px', fontWeight: 700, fontSize: '0.65rem',
  textTransform: 'uppercase', color: '#6b7280', background: '#f9fafb',
}
const tdList: React.CSSProperties = { padding: '7px 10px' }
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid #d1d5db',
  borderRadius: 8, fontSize: '0.85rem', boxSizing: 'border-box',
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DonationsPage() {
  const { isAdmin } = useAuth()
  const [donations,    setDonations]    = useState<Donation[]>([])
  const [loading,      setLoading]      = useState(true)
  const [mainSection,  setMainSection]  = useState<'dana_saa' | 'cikgu_alam'>('dana_saa')
  const [danaSub,      setDanaSub]      = useState<'kutipan' | 'perbelanjaan'>('kutipan')

  // Edit kutipan modal
  const [editKelas,    setEditKelas]    = useState<string | null>(null)
  const [editCF,       setEditCF]       = useState('')
  const [editMonths,   setEditMonths]   = useState<string[]>(Array(12).fill(''))
  const [saving,       setSaving]       = useState(false)

  // Add expense modal
  const [addExpModal,  setAddExpModal]  = useState(false)
  const [expForm,      setExpForm]      = useState({
    kelas: 'General' as KelasKey, desc: '', amount: '',
    date: new Date().toISOString().split('T')[0], note: '',
  })

  // Add infaq modal
  const [addInfaqModal, setAddInfaqModal] = useState(false)
  const [infaqForm,     setInfaqForm]     = useState({
    donor_name: '', amount: '', date: new Date().toISOString().split('T')[0], note: '',
  })

  // Expand/collapse expense sections
  const [expanded, setExpanded] = useState<Set<string>>(new Set([...KELAS, 'General']))

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('donations').select('*').order('date', { ascending: true })
    setDonations(data || [])
    setLoading(false)
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const kutipanRecs    = donations.filter(d => d.category === 'kutipan_bulanan' && d.type === 'masuk')
  const kutipan2025Recs = donations.filter(d => d.category === 'kutipan_2025')
  const belanjaRecs    = donations.filter(d => d.type === 'keluar')
  const infaqRecs      = donations.filter(d => d.category === 'infaq'           && d.type === 'masuk')
  const cikguRecs      = donations.filter(d => d.category === 'cikgu_alam')

  const sum = (rows: Donation[]) => rows.reduce((s, d) => s + Number(d.amount), 0)

  // Build per-class kutipan data (C/F + 12 months)
  function getKelasData(kelas: string) {
    const recs    = kutipanRecs.filter(d => (d.donor_name || '').includes(kelas))
    const cf      = recs.filter(d => d.date && d.date < '2026-01-01').reduce((s, d) => s + Number(d.amount), 0)
    const months  = Array(12).fill(0)
    recs.filter(d => d.date && d.date >= '2026-01-01').forEach(d => {
      const m = new Date(d.date! + 'T00:00:00').getMonth()
      if (m >= 0 && m < 12) months[m] += Number(d.amount)
    })
    return { cf, months: months as number[], total: cf + (months as number[]).reduce((s: number, v: number) => s + v, 0) }
  }

  const kelasData   = Object.fromEntries(KELAS.map(k => [k, getKelasData(k)]))
  const totalCF     = KELAS.reduce((s, k) => s + kelasData[k].cf, 0)
  const totalMonths = MONTHS.map((_, i) => KELAS.reduce((s, k) => s + kelasData[k].months[i], 0))
  const grandTotal  = KELAS.reduce((s, k) => s + kelasData[k].total, 0)

  // Kutipan 2025 per kelas (info records, not included in financial totals)
  function getKutipan2025(kelas: string): number {
    return kutipan2025Recs
      .filter(d => (d.donor_name || '').includes(kelas))
      .reduce((s, d) => s + Number(d.amount), 0)
  }
  const kutipan2025Data  = Object.fromEntries(KELAS.map(k => [k, getKutipan2025(k)]))
  const totalKutipan2025 = KELAS.reduce((s, k) => s + kutipan2025Data[k], 0)

  const totalMasuk = sum(kutipanRecs) + sum(infaqRecs)
  const totalKeluar = sum(belanjaRecs)
  const baki = totalMasuk - totalKeluar

  // Group expenses by class
  const expGroups: Record<string, Donation[]> = { General: [] }
  KELAS.forEach(k => { expGroups[k] = [] })
  belanjaRecs.forEach(d => {
    const g = getExpenseKelas(d.donor_name || '')
    ;(expGroups[g] || expGroups['General']).push(d)
  })

  // ── Edit kutipan ──────────────────────────────────────────────────────────
  function openEdit(kelas: string) {
    const d = getKelasData(kelas)
    setEditCF(d.cf > 0 ? String(d.cf) : '')
    setEditMonths(d.months.map((v: number) => v > 0 ? String(v) : ''))
    setEditKelas(kelas)
  }

  async function saveEdit() {
    if (!editKelas) return
    setSaving(true)

    const { error: delErr } = await supabase
      .from('donations').delete()
      .ilike('donor_name', `%${editKelas}%`)
      .eq('type', 'masuk').eq('category', 'kutipan_bulanan')

    if (delErr) { setSaving(false); alert('Ralat: ' + delErr.message); return }

    const records: object[] = []
    const cfVal = parseFloat(editCF) || 0
    if (cfVal > 0) records.push({
      donor_name: `KSIB SAA - ${editKelas}`, amount: cfVal,
      date: '2025-12-31', note: `Baki C/F 2025 - ${editKelas}`,
      category: 'kutipan_bulanan', type: 'masuk',
    })
    editMonths.forEach((v, i) => {
      const amt = parseFloat(v) || 0
      if (amt > 0) records.push({
        donor_name: `KSIB SAA - ${editKelas}`, amount: amt,
        date: MONTH_DATES[i], note: `Kutipan bulanan ${MONTHS[i]} 2026 - ${editKelas}`,
        category: 'kutipan_bulanan', type: 'masuk',
      })
    })

    if (records.length > 0) {
      const { error } = await supabase.from('donations').insert(records)
      if (error) { setSaving(false); alert('Ralat: ' + error.message); return }
    }
    setSaving(false); setEditKelas(null); load()
  }

  // ── Add expense ───────────────────────────────────────────────────────────
  async function saveExpense() {
    const amt = parseFloat(expForm.amount)
    if (!amt || !expForm.desc) return
    setSaving(true)
    const donorName = expForm.kelas === 'General'
      ? `Perbelanjaan – ${expForm.desc}`
      : `Perbelanjaan – ${expForm.desc} ${expForm.kelas}`
    await supabase.from('donations').insert({
      donor_name: donorName, amount: amt, date: expForm.date,
      note: expForm.note || expForm.desc,
      category: 'perbelanjaan', type: 'keluar',
    })
    setSaving(false); setAddExpModal(false)
    setExpForm({ kelas: 'General', desc: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' })
    load()
  }

  // ── Add infaq ─────────────────────────────────────────────────────────────
  async function saveInfaq() {
    const amt = parseFloat(infaqForm.amount)
    if (!amt) return
    setSaving(true)
    await supabase.from('donations').insert({
      donor_name: infaqForm.donor_name || 'Penderma Ikhlas',
      amount: amt, date: infaqForm.date,
      note: infaqForm.note, category: 'infaq', type: 'masuk',
    })
    setSaving(false); setAddInfaqModal(false)
    setInfaqForm({ donor_name: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' })
    load()
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function del(id: string) {
    if (!confirm('Padam rekod ini?')) return
    await supabase.from('donations').delete().eq('id', id)
    load()
  }

  function toggleSection(key: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af', fontSize: '1rem' }}>Memuatkan...</div>

  if (!isAdmin) return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 'clamp(12px,4vw,24px)', textAlign: 'center' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 'clamp(1.1rem,5vw,1.5rem)', fontWeight: 800, color: '#9a3412' }}>
          💚 Dana & Kutipan KSIB SAA
        </h1>
        <p style={{ color: '#9ca3af', marginTop: 4, fontSize: 'clamp(0.7rem,3vw,0.875rem)' }}>
          Pengurusan kewangan Batch Salahuddin Al-Ayubi · SPM 2026
        </p>
      </div>
      <div className="card" style={{ padding: '2.5rem 2rem', borderLeft: '4px solid #fed7aa' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔒</div>
        <div style={{ fontWeight: 700, color: '#9a3412', fontSize: '1rem', marginBottom: 8 }}>Akses Terhad</div>
        <div style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6 }}>
          Maklumat kewangan hanya boleh dilihat oleh pentadbir KSIB.<br />
          Sila hubungi pentadbir untuk maklumat lanjut.
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(12px,4vw,24px)' }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 'clamp(1.1rem,5vw,1.5rem)', fontWeight: 800, color: '#9a3412' }}>
          💚 Dana & Kutipan KSIB SAA
        </h1>
        <p style={{ color: '#9ca3af', marginTop: 4, fontSize: 'clamp(0.7rem,3vw,0.875rem)' }}>
          Pengurusan kewangan Batch Salahuddin Al-Ayubi · SPM 2026
        </p>
      </div>

      {/* Main toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'dana_saa',   label: '💚 Dana SAA',           sub: 'Kutipan Bulanan · Perbelanjaan', color: '#16a34a', bdr: '#bbf7d0', shadow: 'rgba(22,163,74,0.3)' },
          ...(isAdmin ? [{ key: 'cikgu_alam', label: '📚 Tuition Cikgu Alam', sub: 'Bayaran tuisyen Math & Add Math', color: '#7c3aed', bdr: '#ede9fe', shadow: 'rgba(124,58,237,0.3)' }] : []),
        ].map(s => {
          const active = mainSection === s.key
          return (
            <button key={s.key} onClick={() => setMainSection(s.key as any)} style={{
              flex: 1, padding: '10px 12px', borderRadius: 12, fontWeight: 700, cursor: 'pointer',
              fontSize: 'clamp(0.78rem,3.5vw,0.9rem)', border: '2px solid', transition: 'all 0.15s',
              background: active ? s.color : '#fff', borderColor: active ? s.color : s.bdr,
              color: active ? '#fff' : s.color, boxShadow: active ? `0 2px 8px ${s.shadow}` : 'none',
            }}>
              {s.label}
              <div style={{ fontSize: 'clamp(0.62rem,2.5vw,0.72rem)', fontWeight: 400, marginTop: 2, opacity: 0.85 }}>{s.sub}</div>
            </button>
          )
        })}
      </div>

      {/* ══════════ DANA SAA ══════════ */}
      {mainSection === 'dana_saa' && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
            {[
              { label: '💰 Jumlah Masuk',                     amount: totalMasuk,  color: '#15803d', border: '#4ade80' },
              { label: '📤 Jumlah Keluar',                    amount: totalKeluar, color: '#dc2626', border: '#f87171' },
              { label: baki >= 0 ? '💰 Baki Dana' : '⚠️ Defisit', amount: baki, color: baki >= 0 ? '#15803d' : '#dc2626', border: baki >= 0 ? '#4ade80' : '#f87171' },
            ].map(c => (
              <div key={c.label} className="card" style={{ borderLeft: `4px solid ${c.border}`, padding: '10px 12px' }}>
                <div style={{ fontSize: 'clamp(0.58rem,2.2vw,0.7rem)', fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 'clamp(0.78rem,3.5vw,1.05rem)', fontWeight: 800, color: c.color, wordBreak: 'break-all' }}>
                  {fmtRM(Math.abs(c.amount))}
                </div>
              </div>
            ))}
          </div>

          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[
              { key: 'kutipan',      label: '💰 Kutipan Bulanan' },
              { key: 'perbelanjaan', label: '📤 Perbelanjaan' },
            ].map(t => {
              const active = danaSub === t.key
              return (
                <button key={t.key} onClick={() => setDanaSub(t.key as any)} style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10, fontWeight: 700, cursor: 'pointer',
                  fontSize: 'clamp(0.78rem,3.5vw,0.88rem)', border: '2px solid', transition: 'all 0.15s',
                  background: active ? '#b34700' : '#fff', borderColor: active ? '#b34700' : '#fed7aa',
                  color: active ? '#fff' : '#b34700', boxShadow: active ? '0 2px 6px rgba(179,71,0,0.3)' : 'none',
                }}>
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* ── KUTIPAN GRID ── */}
          {danaSub === 'kutipan' && (
            <>
              {isAdmin && (
                <div style={{ textAlign: 'right', marginBottom: 6, fontSize: '0.72rem', color: '#9ca3af' }}>
                  Klik <strong>Edit</strong> untuk kemaskini kutipan setiap kelas
                </div>
              )}

              {/* Grid table */}
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.6rem,1.8vw,0.75rem)', minWidth: 860 }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg,#b34700,#e8671a)', color: '#fff' }}>
                        <th style={{ ...thGrid, textAlign: 'left', minWidth: 80, paddingLeft: 12 }}>Kelas</th>
                        <th style={{ ...thGrid, background: 'rgba(109,40,217,0.35)', minWidth: 80 }}>Kutipan 2025</th>
                        <th style={{ ...thGrid, background: 'rgba(0,0,0,0.18)', minWidth: 72 }}>C/F 2025</th>
                        {MONTHS.map(m => <th key={m} style={{ ...thGrid, minWidth: 52 }}>{m}</th>)}
                        <th style={{ ...thGrid, background: 'rgba(0,0,0,0.18)', minWidth: 80 }}>Jumlah</th>
                        {isAdmin && <th style={{ ...thGrid, minWidth: 60 }}></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {KELAS.map((kelas, ri) => {
                        const d = kelasData[kelas]
                        return (
                          <tr key={kelas} style={{ background: ri % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ ...tdGrid, fontWeight: 700, color: '#b34700', paddingLeft: 12 }}>{kelas}</td>
                            <td style={{ ...tdGrid, textAlign: 'right', fontWeight: 600, color: kutipan2025Data[kelas] > 0 ? '#6d28d9' : '#d1d5db', background: '#faf5ff' }}>
                              {kutipan2025Data[kelas] > 0 ? numFmt(kutipan2025Data[kelas]) : '—'}
                            </td>
                            <td style={{ ...tdGrid, textAlign: 'right', fontWeight: 600, color: d.cf > 0 ? '#1d4ed8' : '#d1d5db', background: '#f0f9ff' }}>
                              {numFmt(d.cf)}
                            </td>
                            {d.months.map((amt: number, mi: number) => (
                              <td key={mi} style={{ ...tdGrid, textAlign: 'right', color: amt > 0 ? '#15803d' : '#e5e7eb', fontWeight: amt > 0 ? 600 : 400 }}>
                                {amt > 0 ? amt.toLocaleString('en-MY') : '—'}
                              </td>
                            ))}
                            <td style={{ ...tdGrid, textAlign: 'right', fontWeight: 800, color: '#9a3412', background: '#fff7ed' }}>
                              {numFmt(d.total)}
                            </td>
                            {isAdmin && (
                              <td style={{ ...tdGrid, textAlign: 'center' }}>
                                <button onClick={() => openEdit(kelas)} style={{
                                  background: '#fff3e8', color: '#b34700', border: '1px solid #fed7aa',
                                  borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 600,
                                }}>✏️ Edit</button>
                              </td>
                            )}
                          </tr>
                        )
                      })}
                      {/* Totals row */}
                      <tr style={{ background: '#fff7ed', borderTop: '2px solid #fed7aa', fontWeight: 800 }}>
                        <td style={{ ...tdGrid, color: '#9a3412', fontWeight: 800, paddingLeft: 12 }}>JUMLAH</td>
                        <td style={{ ...tdGrid, textAlign: 'right', color: '#6d28d9', background: '#ede9fe', fontWeight: 800 }}>
                          {numFmt(totalKutipan2025)}
                        </td>
                        <td style={{ ...tdGrid, textAlign: 'right', color: '#1d4ed8', background: '#e0f2fe' }}>
                          {numFmt(totalCF)}
                        </td>
                        {totalMonths.map((amt, i) => (
                          <td key={i} style={{ ...tdGrid, textAlign: 'right', color: amt > 0 ? '#15803d' : '#e5e7eb', fontWeight: amt > 0 ? 700 : 400 }}>
                            {amt > 0 ? amt.toLocaleString('en-MY') : '—'}
                          </td>
                        ))}
                        <td style={{ ...tdGrid, textAlign: 'right', color: '#9a3412', fontWeight: 900, background: '#fde8cc', fontSize: '0.82rem' }}>
                          {numFmt(grandTotal)}
                        </td>
                        {isAdmin && <td style={tdGrid}></td>}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Infaq section */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#eff6ff', borderBottom: '1px solid #dbeafe' }}>
                  <span style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '0.85rem' }}>
                    🌟 Dana Infaq SAA
                    <span style={{ marginLeft: 8, fontSize: '0.68rem', background: '#dbeafe', color: '#1d4ed8', borderRadius: 999, padding: '1px 7px' }}>
                      {infaqRecs.length} rekod · {fmtRM(sum(infaqRecs))}
                    </span>
                  </span>
                  {isAdmin && (
                    <button onClick={() => setAddInfaqModal(true)} style={{
                      display: 'flex', alignItems: 'center', gap: 4, background: '#1d4ed8', color: '#fff',
                      border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem',
                    }}>
                      <Plus size={12} /> Tambah
                    </button>
                  )}
                </div>
                {infaqRecs.length === 0 ? (
                  <div style={{ padding: '14px', color: '#9ca3af', fontSize: '0.78rem', fontStyle: 'italic', textAlign: 'center' }}>Tiada rekod infaq.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr>
                          <th style={{ ...thList, textAlign: 'left' }}>Penderma</th>
                          <th style={{ ...thList, textAlign: 'right' }}>Jumlah</th>
                          <th style={{ ...thList }}>Tarikh</th>
                          <th style={{ ...thList }}>Nota</th>
                          {isAdmin && <th style={thList}></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {infaqRecs.map(d => (
                          <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ ...tdList, fontWeight: 600, color: isAdmin ? '#1f2937' : '#6b7280', fontStyle: isAdmin ? 'normal' : 'italic' }}>
                              {isAdmin ? (d.donor_name || 'Tanpa Nama') : 'Penderma Ikhlas 🤍'}
                            </td>
                            <td style={{ ...tdList, textAlign: 'right', color: '#1d4ed8', fontWeight: 700, whiteSpace: 'nowrap' }}>+{fmtRM(Number(d.amount))}</td>
                            <td style={{ ...tdList, color: '#6b7280', whiteSpace: 'nowrap' }}>{fmtDate(d.date)}</td>
                            <td style={{ ...tdList, color: '#6b7280', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.note || '—'}</td>
                            {isAdmin && (
                              <td style={{ ...tdList, textAlign: 'center' }}>
                                <button onClick={() => del(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.9rem' }}>🗑</button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── PERBELANJAAN ── */}
          {danaSub === 'perbelanjaan' && (
            <>
              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                  <button onClick={() => setAddExpModal(true)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: '#dc2626', color: '#fff',
                    border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                  }}>
                    <Plus size={14} /> Tambah Perbelanjaan
                  </button>
                </div>
              )}

              {/* Per-class expense sections */}
              {([...KELAS, 'General'] as KelasKey[]).map(section => {
                const recs  = expGroups[section] || []
                const total = recs.reduce((s, d) => s + Number(d.amount), 0)
                const open  = expanded.has(section)
                return (
                  <div key={section} className="card" style={{ marginBottom: 10, padding: 0, overflow: 'hidden' }}>
                    <div onClick={() => toggleSection(section)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', cursor: 'pointer',
                      background: section === 'General' ? '#f9fafb' : '#fff7ed',
                      borderBottom: open && recs.length > 0 ? '1px solid #f3f4f6' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, color: section === 'General' ? '#4b5563' : '#b34700', fontSize: '0.88rem' }}>
                          {section === 'General' ? '📋 General' : `🏫 ${section}`}
                        </span>
                        <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#dc2626', borderRadius: 999, padding: '1px 7px', fontWeight: 700 }}>
                          {recs.length} rekod
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.85rem' }}>
                          {total > 0 ? `–${fmtRM(total)}` : '—'}
                        </span>
                        {open ? <ChevronUp size={14} color="#9ca3af" /> : <ChevronDown size={14} color="#9ca3af" />}
                      </div>
                    </div>
                    {open && (
                      recs.length === 0 ? (
                        <div style={{ padding: '12px 14px', color: '#9ca3af', fontSize: '0.78rem', fontStyle: 'italic' }}>
                          Tiada rekod perbelanjaan.
                        </div>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                            <tbody>
                              {recs.map(d => (
                                <tr key={d.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                                  <td style={{ ...tdList, color: '#9ca3af', fontSize: '0.68rem', whiteSpace: 'nowrap', width: 110 }}>{fmtDate(d.date)}</td>
                                  <td style={{ ...tdList, fontWeight: 600, color: '#374151' }}>{d.note || d.donor_name}</td>
                                  <td style={{ ...tdList, textAlign: 'right', fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>–{fmtRM(Number(d.amount))}</td>
                                  {isAdmin && (
                                    <td style={{ ...tdList, textAlign: 'center', width: 36 }}>
                                      <button onClick={() => del(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.9rem' }}>🗑</button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}
                  </div>
                )
              })}

              {/* Grand total */}
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.88rem' }}>Jumlah Keseluruhan Perbelanjaan</span>
                <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '1rem' }}>–{fmtRM(sum(belanjaRecs))}</span>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════ CIKGU ALAM — admin only ══════════ */}
      {isAdmin && mainSection === 'cikgu_alam' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div className="card" style={{ borderLeft: '4px solid #a78bfa', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>📚 Jumlah Kutipan</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed' }}>{fmtRM(sum(cikguRecs))}</div>
              <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: 3 }}>{cikguRecs.length} transaksi</div>
            </div>
            <div className="card" style={{ background: '#f5f3ff', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>ℹ️ Maklumat</div>
              <div style={{ fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.5 }}>
                Kutipan dikutip berasingan daripada Dana SAA.<br />Bayaran terus kepada Cikgu Alam.
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr>
                  <th style={{ ...thList, textAlign: 'left' }}>Nama</th>
                  <th style={{ ...thList, textAlign: 'right' }}>Jumlah</th>
                  <th style={{ ...thList }}>Tarikh</th>
                  <th style={{ ...thList }}>Nota</th>
                  {isAdmin && <th style={thList}></th>}
                </tr>
              </thead>
              <tbody>
                {cikguRecs.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: '#9ca3af', fontStyle: 'italic' }}>Tiada rekod.</td></tr>
                ) : cikguRecs.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ ...tdList, fontWeight: 600 }}>{d.donor_name || 'Tanpa Nama'}</td>
                    <td style={{ ...tdList, textAlign: 'right', color: '#7c3aed', fontWeight: 700, whiteSpace: 'nowrap' }}>+{fmtRM(Number(d.amount))}</td>
                    <td style={{ ...tdList, color: '#6b7280', whiteSpace: 'nowrap' }}>{fmtDate(d.date)}</td>
                    <td style={{ ...tdList, color: '#6b7280' }}>{d.note || '—'}</td>
                    {isAdmin && (
                      <td style={{ ...tdList, textAlign: 'center' }}>
                        <button onClick={() => del(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>🗑</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── EDIT KUTIPAN MODAL ── */}
      {editKelas && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
          onClick={() => setEditKelas(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, color: '#b34700', fontSize: '1rem' }}>✏️ Edit Kutipan — {editKelas}</h2>
              <button onClick={() => setEditKelas(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', display: 'block', marginBottom: 4 }}>💼 Baki C/F 2025 (RM)</label>
              <input type="number" min="0" step="0.01" value={editCF}
                onChange={e => setEditCF(e.target.value)}
                style={{ ...inputStyle, borderColor: '#bfdbfe' }} placeholder="0.00" />
            </div>
            <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 14, paddingTop: 12 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>📅 Kutipan Bulanan 2026 (RM)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {MONTHS.map((m, i) => (
                  <div key={m}>
                    <label style={{ fontSize: '0.65rem', color: '#6b7280', display: 'block', marginBottom: 3 }}>{m} 2026</label>
                    <input type="number" min="0" step="0.01" value={editMonths[i]}
                      onChange={e => { const n = [...editMonths]; n[i] = e.target.value; setEditMonths(n) }}
                      style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8rem', boxSizing: 'border-box' as const }}
                      placeholder="—" />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button onClick={saveEdit} disabled={saving} style={{
                flex: 1, background: '#b34700', color: '#fff', border: 'none', borderRadius: 8,
                padding: 10, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Menyimpan...' : '💾 Simpan'}
              </button>
              <button onClick={() => setEditKelas(null)} style={{ padding: '10px 16px', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD EXPENSE MODAL ── */}
      {addExpModal && isAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
          onClick={() => setAddExpModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, color: '#dc2626', fontSize: '1rem' }}>📤 Tambah Perbelanjaan</h2>
              <button onClick={() => setAddExpModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Kelas</label>
                <select value={expForm.kelas} onChange={e => setExpForm(f => ({ ...f, kelas: e.target.value as KelasKey }))}
                  style={{ ...inputStyle }}>
                  {([...KELAS, 'General'] as KelasKey[]).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Perihal *</label>
                <input value={expForm.desc} onChange={e => setExpForm(f => ({ ...f, desc: e.target.value }))}
                  style={inputStyle} placeholder="cth: Langsir, Sarapan Carnival..." />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Jumlah (RM) *</label>
                <input type="number" min="0" step="0.01" value={expForm.amount}
                  onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))}
                  style={inputStyle} placeholder="0.00" />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Tarikh</label>
                <input type="date" value={expForm.date}
                  onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Nota (pilihan)</label>
                <input value={expForm.note} onChange={e => setExpForm(f => ({ ...f, note: e.target.value }))}
                  style={inputStyle} placeholder="Penerangan tambahan..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={saveExpense} disabled={saving || !expForm.desc || !expForm.amount} style={{
                flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8,
                padding: 10, fontWeight: 700, cursor: 'pointer', opacity: (!expForm.desc || !expForm.amount) ? 0.5 : 1,
              }}>
                {saving ? 'Menyimpan...' : '💾 Simpan'}
              </button>
              <button onClick={() => setAddExpModal(false)} style={{ padding: '10px 16px', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD INFAQ MODAL ── */}
      {addInfaqModal && isAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
          onClick={() => setAddInfaqModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '1rem' }}>🌟 Tambah Dana Infaq</h2>
              <button onClick={() => setAddInfaqModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Nama Penderma</label>
                <input value={infaqForm.donor_name} onChange={e => setInfaqForm(f => ({ ...f, donor_name: e.target.value }))}
                  style={inputStyle} placeholder="Nama atau kosongkan untuk ikhlas" />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Jumlah (RM) *</label>
                <input type="number" min="0" step="0.01" value={infaqForm.amount}
                  onChange={e => setInfaqForm(f => ({ ...f, amount: e.target.value }))}
                  style={inputStyle} placeholder="0.00" />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Tarikh</label>
                <input type="date" value={infaqForm.date}
                  onChange={e => setInfaqForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Nota</label>
                <input value={infaqForm.note} onChange={e => setInfaqForm(f => ({ ...f, note: e.target.value }))}
                  style={inputStyle} placeholder="Penerangan..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={saveInfaq} disabled={saving || !infaqForm.amount} style={{
                flex: 1, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8,
                padding: 10, fontWeight: 700, cursor: 'pointer', opacity: !infaqForm.amount ? 0.5 : 1,
              }}>
                {saving ? 'Menyimpan...' : '💾 Simpan'}
              </button>
              <button onClick={() => setAddInfaqModal(false)} style={{ padding: '10px 16px', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Donation } from '../types'

// ── Classes ────────────────────────────────────────────────────
const KELAS = ['5 Juara', '5 Nekad', '5 Waja', '5 Fikir', '5 Rajin'] as const
type KelasKey = typeof KELAS[number] | 'semua_kelas'

// ── Category colours ───────────────────────────────────────────
const BADGE_CFG = {
  kutipan_bulanan: { label: 'Kutipan Bulanan',        emoji: '💰', badge: 'bg-green-100 text-green-800' },
  infaq:           { label: 'Dana Infaq SAA',          emoji: '🌟', badge: 'bg-blue-100 text-blue-800'  },
  perbelanjaan:    { label: 'Perbelanjaan',            emoji: '📤', badge: 'bg-red-100 text-red-800'    },
  cikgu_alam:      { label: 'Tuition Cikgu Alam',      emoji: '📚', badge: 'bg-purple-100 text-purple-800' },
}

type DanaSAASub = 'semua_dana' | 'kutipan_bulanan' | 'infaq' | 'perbelanjaan'
type MainSection = 'dana_saa' | 'cikgu_alam'

function fmtRM(n: number) {
  return 'RM ' + n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Detect which class a kutipan record belongs to
function getKelas(name: string): string {
  for (const k of KELAS) if (name.includes(k)) return k
  return 'Lain-lain'
}

export default function DonationsPage() {
  const { isAdmin } = useAuth()
  const [donations,   setDonations]   = useState<Donation[]>([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(false)
  const [mainSection, setMainSection] = useState<MainSection>('dana_saa')
  const [danaSub,     setDanaSub]     = useState<DanaSAASub>('semua_dana')
  const [kelasTab,    setKelasTab]    = useState<KelasKey>('semua_kelas')
  const [form, setForm] = useState({
    donor_name: '', amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '', category: 'kutipan_bulanan', type: 'masuk',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('donations').select('*').order('date', { ascending: false })
    setDonations(data || [])
    setLoading(false)
  }

  async function save() {
    if (!form.amount || isNaN(Number(form.amount))) return
    setSaving(true)
    await supabase.from('donations').insert({
      donor_name: form.donor_name || 'Tanpa Nama',
      amount: Number(form.amount), date: form.date,
      note: form.note, category: form.category, type: form.type,
    })
    setSaving(false); setModal(false)
    setForm({ donor_name: '', amount: '', date: new Date().toISOString().split('T')[0], note: '', category: 'kutipan_bulanan', type: 'masuk' })
    load()
  }

  async function del(id: string) {
    if (!confirm('Padam rekod ini?')) return
    await supabase.from('donations').delete().eq('id', id)
    setDonations(prev => prev.filter(d => d.id !== id))
  }

  const sum = (rows: Donation[]) => rows.reduce((s, d) => s + Number(d.amount), 0)

  // ── Base filters ───────────────────────────────────────────────
  const danaSAAAll  = donations.filter(d => d.category !== 'cikgu_alam')
  const kutipanRecs = donations.filter(d => d.category === 'kutipan_bulanan')
  const infaqRecs   = donations.filter(d => d.category === 'infaq')
  const belanjaRecs = donations.filter(d => d.category === 'perbelanjaan')
  const cikguRecs   = donations.filter(d => d.category === 'cikgu_alam')

  // Per-class kutipan
  const kelasByName = (k: string) => kutipanRecs.filter(d => (d.donor_name || '').includes(k))
  const kelasRecs   = kelasTab === 'semua_kelas' ? kutipanRecs : kelasByName(kelasTab)

  const danaMasuk  = sum(kutipanRecs) + sum(infaqRecs)
  const danaKeluar = sum(belanjaRecs)
  const danaBaki   = danaMasuk - danaKeluar

  // ── Displayed rows ─────────────────────────────────────────────
  const displayed =
    mainSection === 'cikgu_alam'         ? cikguRecs
    : danaSub === 'semua_dana'           ? danaSAAAll
    : danaSub === 'kutipan_bulanan'      ? kelasRecs
    : danaSub === 'infaq'                ? infaqRecs
    : belanjaRecs

  // Column count helper for tfoot colspan
  const showCatCol = mainSection === 'dana_saa' && danaSub === 'semua_dana'

  if (loading) return <div className="text-center py-16 text-gray-500">Memuatkan...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-5">
        <h1 style={{ fontSize: 'clamp(1.1rem, 5vw, 1.5rem)', fontWeight: 800, color: '#9a3412' }}>
          💚 Dana & Kutipan KSIB SAA
        </h1>
        <p className="text-gray-500 mt-1" style={{ fontSize: 'clamp(0.7rem, 3vw, 0.875rem)' }}>
          Pengurusan kewangan Batch Salahuddin Al-Ayubi · SPM 2026
        </p>
      </div>

      {/* ── MAIN TOGGLE ─────────────────────────────────────────── */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => { setMainSection('dana_saa'); setDanaSub('semua_dana'); setKelasTab('semua_kelas') }}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 12, fontWeight: 700,
            fontSize: 'clamp(0.78rem, 3.5vw, 0.9rem)', cursor: 'pointer', transition: 'all 0.15s', border: '2px solid',
            background:   mainSection === 'dana_saa' ? '#16a34a' : '#ffffff',
            borderColor:  mainSection === 'dana_saa' ? '#16a34a' : '#bbf7d0',
            color:        mainSection === 'dana_saa' ? '#ffffff' : '#15803d',
            boxShadow:    mainSection === 'dana_saa' ? '0 2px 8px rgba(22,163,74,0.35)' : 'none',
          }}
        >
          💚 Dana SAA
          <div style={{ fontSize: 'clamp(0.62rem, 2.5vw, 0.72rem)', fontWeight: 400, marginTop: 2, opacity: 0.85 }}>
            Kutipan Bulanan · Infaq · Perbelanjaan
          </div>
        </button>
        <button
          onClick={() => setMainSection('cikgu_alam')}
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 12, fontWeight: 700,
            fontSize: 'clamp(0.78rem, 3.5vw, 0.9rem)', cursor: 'pointer', transition: 'all 0.15s', border: '2px solid',
            background:   mainSection === 'cikgu_alam' ? '#7c3aed' : '#ffffff',
            borderColor:  mainSection === 'cikgu_alam' ? '#7c3aed' : '#ede9fe',
            color:        mainSection === 'cikgu_alam' ? '#ffffff' : '#6d28d9',
            boxShadow:    mainSection === 'cikgu_alam' ? '0 2px 8px rgba(124,58,237,0.35)' : 'none',
          }}
        >
          📚 Tuition Cikgu Alam
          <div style={{ fontSize: 'clamp(0.62rem, 2.5vw, 0.72rem)', fontWeight: 400, marginTop: 2, opacity: 0.85 }}>
            Bayaran tuisyen Math &amp; Add Math
          </div>
        </button>
      </div>

      {/* ══════════ DANA SAA ══════════ */}
      {mainSection === 'dana_saa' && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
            {[
              { label: '💰 Kutipan Bulanan', amount: sum(kutipanRecs), count: kutipanRecs.length, color: '#15803d', border: '#4ade80' },
              { label: '🌟 Dana Infaq',      amount: sum(infaqRecs),   count: infaqRecs.length,   color: '#1d4ed8', border: '#60a5fa' },
              { label: '📤 Perbelanjaan',    amount: sum(belanjaRecs), count: belanjaRecs.length, color: '#dc2626', border: '#f87171' },
            ].map(c => (
              <div key={c.label} className="card" style={{ borderLeft: `4px solid ${c.border}`, padding: '10px 10px' }}>
                <div style={{ fontSize: 'clamp(0.58rem, 2.2vw, 0.7rem)', fontWeight: 700, color: '#6b7280', marginBottom: 4, lineHeight: 1.2 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 'clamp(0.78rem, 3.5vw, 1.1rem)', fontWeight: 800, color: c.color, lineHeight: 1.2, wordBreak: 'break-all' }}>
                  {fmtRM(c.amount)}
                </div>
                <div style={{ fontSize: 'clamp(0.58rem, 2vw, 0.7rem)', color: '#9ca3af', marginTop: 3 }}>
                  {c.count} transaksi
                </div>
              </div>
            ))}
          </div>

          {/* Baki banner */}
          <div style={{
            background: danaBaki >= 0 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${danaBaki >= 0 ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: 12, padding: '12px 14px', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'clamp(0.8rem, 3.5vw, 0.9rem)', color: '#374151' }}>Baki Dana SAA</div>
                <div style={{ fontSize: 'clamp(0.62rem, 2.5vw, 0.75rem)', color: '#9ca3af', marginTop: 2 }}>
                  Masuk: {fmtRM(danaMasuk)} · Keluar: {fmtRM(danaKeluar)}
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', color: danaBaki >= 0 ? '#15803d' : '#dc2626', lineHeight: 1 }}>
                {fmtRM(Math.abs(danaBaki))}
                <span style={{ fontWeight: 600, fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)', marginLeft: 5 }}>
                  {danaBaki >= 0 ? 'Baki' : 'Defisit'}
                </span>
              </div>
            </div>
            {isAdmin && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => { setModal(true); setForm(f => ({ ...f, type: 'masuk', category: 'kutipan_bulanan' })) }}
                  className="btn-add flex items-center gap-1 text-sm">
                  <Plus size={15} /> Tambah Rekod
                </button>
              </div>
            )}
          </div>

          {/* Sub-tabs: Semua | Kutipan Bulanan | Infaq | Perbelanjaan */}
          <div style={{ background: '#f3f4f6', padding: 4, borderRadius: 10, marginBottom: 12, display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {([
              ['semua_dana',      '📋 Semua',       danaSAAAll.length],
              ['kutipan_bulanan', '💰 Kutipan',      kutipanRecs.length],
              ['infaq',           '🌟 Infaq',        infaqRecs.length],
              ['perbelanjaan',    '📤 Belanja',      belanjaRecs.length],
            ] as [DanaSAASub, string, number][]).map(([key, label, count]) => (
              <button key={key}
                onClick={() => { setDanaSub(key); setKelasTab('semua_kelas') }}
                style={{
                  fontSize: 'clamp(0.68rem, 2.8vw, 0.78rem)', fontWeight: danaSub === key ? 700 : 500,
                  padding: '6px 10px', borderRadius: 7, cursor: 'pointer', transition: 'all 0.15s',
                  background: danaSub === key ? '#ffffff' : 'transparent',
                  color: danaSub === key ? '#b34700' : '#6b7280',
                  boxShadow: danaSub === key ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                  border: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {label}
                <span style={{
                  marginLeft: 4, fontSize: '0.62rem', borderRadius: 999, padding: '1px 5px',
                  background: danaSub === key ? '#b34700' : '#e5e7eb',
                  color: danaSub === key ? '#fff' : '#6b7280',
                }}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* ── CLASS TABS (only when Kutipan Bulanan is active) ── */}
          {danaSub === 'kutipan_bulanan' && (
            <>
              {/* Per-class summary strip — horizontally scrollable on mobile */}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4, marginBottom: 10 }}>
                {KELAS.map(k => {
                  const recs = kelasByName(k)
                  const total = sum(recs)
                  const isActive = kelasTab === k
                  return (
                    <button key={k} onClick={() => setKelasTab(isActive ? 'semua_kelas' : k)}
                      style={{
                        borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                        border: '2px solid', transition: 'all 0.15s', textAlign: 'center',
                        background: isActive ? '#16a34a' : '#f0fdf4',
                        borderColor: isActive ? '#16a34a' : '#bbf7d0',
                        color: isActive ? '#ffffff' : '#15803d',
                        boxShadow: isActive ? '0 2px 6px rgba(22,163,74,0.3)' : 'none',
                        minWidth: 100, flexShrink: 0,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{k}</div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', marginTop: 3, opacity: 0.9 }}>
                        {fmtRM(total)}
                      </div>
                      <div style={{ fontSize: '0.63rem', opacity: 0.7, marginTop: 2 }}>
                        {recs.length} rekod
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Class tab row — scrollable */}
              <div style={{ background: '#f0fdf4', padding: 4, borderRadius: 10, border: '1px solid #bbf7d0', display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 10 }}>
                <button
                  onClick={() => setKelasTab('semua_kelas')}
                  style={{
                    fontSize: '0.72rem', fontWeight: kelasTab === 'semua_kelas' ? 700 : 500,
                    padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: 'none',
                    background: kelasTab === 'semua_kelas' ? '#16a34a' : 'transparent',
                    color: kelasTab === 'semua_kelas' ? '#fff' : '#15803d',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  📋 Semua
                </button>
                {KELAS.map(k => (
                  <button key={k}
                    onClick={() => setKelasTab(k)}
                    style={{
                      fontSize: '0.72rem', fontWeight: kelasTab === k ? 700 : 500,
                      padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: 'none',
                      background: kelasTab === k ? '#16a34a' : 'transparent',
                      color: kelasTab === k ? '#fff' : '#15803d',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                  >
                    {k}
                    <span style={{
                      marginLeft: 4, fontSize: '0.62rem', borderRadius: 999, padding: '1px 5px',
                      background: kelasTab === k ? 'rgba(255,255,255,0.3)' : '#dcfce7',
                      color: kelasTab === k ? '#fff' : '#15803d',
                    }}>
                      {kelasByName(k).length}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════ CIKGU ALAM ══════════ */}
      {mainSection === 'cikgu_alam' && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="card p-4 border-l-4 border-purple-400">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">📚 Jumlah Kutipan</div>
              <div className="text-xl font-extrabold text-purple-700">{fmtRM(sum(cikguRecs))}</div>
              <div className="text-xs text-gray-400 mt-1">{cikguRecs.length} transaksi</div>
            </div>
            <div className="card p-4 border-l-4 border-gray-300 bg-purple-50">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">ℹ️ Maklumat</div>
              <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                Kutipan ini dikutip berasingan daripada Dana SAA.<br />Bayaran terus kepada Cikgu Alam.
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex justify-end mb-4">
              <button onClick={() => { setModal(true); setForm(f => ({ ...f, type: 'masuk', category: 'cikgu_alam' })) }}
                className="btn-add flex items-center gap-1 text-sm">
                <Plus size={15} /> Tambah Rekod Tuition
              </button>
            </div>
          )}
        </>
      )}

      {/* ── TABLE ───────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        {/* Table title when filtering by class */}
        {danaSub === 'kutipan_bulanan' && kelasTab !== 'semua_kelas' && (
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', background: '#f0fdf4' }}>
            <span style={{ fontWeight: 700, color: '#15803d', fontSize: '0.85rem' }}>
              💰 Kutipan Bulanan — {kelasTab}
            </span>
            <span style={{ marginLeft: 10, fontSize: '0.8rem', color: '#6b7280' }}>
              Jumlah: {fmtRM(sum(kelasRecs))} · {kelasRecs.length} rekod
            </span>
          </div>
        )}

        {displayed.length === 0 ? (
          <p className="text-center text-gray-400 py-10 italic">Tiada rekod.</p>
        ) : (
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', fontSize: 'clamp(0.7rem, 2.5vw, 0.875rem)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '8px 8px', fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>#</th>
                  <th style={{ textAlign: 'left', padding: '8px 8px', fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                    {danaSub === 'kutipan_bulanan' ? 'Kelas / Nama' : 'Nama'}
                  </th>
                  {showCatCol && (
                    <th style={{ textAlign: 'left', padding: '8px 8px', fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Kategori</th>
                  )}
                  {danaSub === 'kutipan_bulanan' && kelasTab === 'semua_kelas' && (
                    <th style={{ textAlign: 'left', padding: '8px 8px', fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Kelas</th>
                  )}
                  <th style={{ textAlign: 'right', padding: '8px 8px', fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Jumlah</th>
                  <th style={{ textAlign: 'left', padding: '8px 8px', fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Tarikh</th>
                  <th style={{ textAlign: 'left', padding: '8px 8px', fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Nota</th>
                  {isAdmin && <th style={{ padding: '8px 8px' }}></th>}
                </tr>
              </thead>
              <tbody>
                {displayed.map((d, i) => {
                  const cfg   = BADGE_CFG[(d.category as keyof typeof BADGE_CFG) || 'kutipan_bulanan'] || BADGE_CFG.kutipan_bulanan
                  const isOut = d.type === 'keluar'
                  const amtColor = isOut ? '#dc2626'
                    : mainSection === 'cikgu_alam' ? '#7c3aed'
                    : danaSub === 'infaq' ? '#1d4ed8'
                    : '#15803d'
                  // Hide donor name for infaq records from non-admin users
                  const isInfaq = d.category === 'infaq'
                  const displayName = (isInfaq && !isAdmin)
                    ? 'Penderma Ikhlas 🤍'
                    : (d.donor_name || 'Tanpa Nama')

                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 8px', color: '#9ca3af', fontSize: '0.7rem' }}>{i + 1}</td>
                      <td style={{ padding: '8px 8px', fontWeight: 600, color: isInfaq && !isAdmin ? '#6b7280' : '#1f2937', maxWidth: 160, wordBreak: 'break-word', fontStyle: isInfaq && !isAdmin ? 'italic' : 'normal' }}>
                        {displayName}
                      </td>
                      {showCatCol && (
                        <td style={{ padding: '8px 8px' }}>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                            {cfg.emoji} {cfg.label}
                          </span>
                        </td>
                      )}
                      {danaSub === 'kutipan_bulanan' && kelasTab === 'semua_kelas' && (
                        <td style={{ padding: '8px 8px' }}>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px',
                            borderRadius: 999, background: '#dcfce7', color: '#15803d', whiteSpace: 'nowrap',
                          }}>
                            {getKelas(d.donor_name || '')}
                          </span>
                        </td>
                      )}
                      <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: amtColor, whiteSpace: 'nowrap' }}>
                        {isOut ? '–' : '+'}{fmtRM(Number(d.amount))}
                      </td>
                      <td style={{ padding: '8px 8px', color: '#6b7280', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{fmtDate(d.date)}</td>
                      <td style={{ padding: '8px 8px', color: '#6b7280', fontSize: '0.7rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.note || '—'}</td>
                      {isAdmin && (
                        <td style={{ padding: '8px 8px' }}>
                          <button onClick={() => del(d.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                  <td colSpan={2 + (showCatCol ? 1 : 0) + (danaSub === 'kutipan_bulanan' && kelasTab === 'semua_kelas' ? 1 : 0)}
                      style={{ padding: '8px 8px', fontSize: '0.72rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Jumlah</td>
                  <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 800 }}>
                    <span style={{ color: '#15803d', display: 'block', whiteSpace: 'nowrap' }}>
                      +{fmtRM(displayed.filter(d => d.type !== 'keluar').reduce((s,d) => s + Number(d.amount), 0))}
                    </span>
                    {displayed.some(d => d.type === 'keluar') && (
                      <span style={{ color: '#dc2626', display: 'block', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        –{fmtRM(displayed.filter(d => d.type === 'keluar').reduce((s,d) => s + Number(d.amount), 0))}
                      </span>
                    )}
                  </td>
                  <td colSpan={isAdmin ? 3 : 2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL ───────────────────────────────────────────────── */}
      {modal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-primary text-lg">➕ Tambah Rekod</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {form.category !== 'cikgu_alam' && (
                <div>
                  <label className="label">Jenis Rekod</label>
                  <select className="input" value={form.type} onChange={e => {
                    const t = e.target.value
                    setForm(f => ({ ...f, type: t, category: t === 'keluar' ? 'perbelanjaan' : 'kutipan_bulanan' }))
                  }}>
                    <option value="masuk">📥 Masuk (Kutipan / Infaq)</option>
                    <option value="keluar">📤 Keluar (Perbelanjaan)</option>
                  </select>
                </div>
              )}
              <div>
                <label className="label">Kategori</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {form.category === 'cikgu_alam' ? (
                    <option value="cikgu_alam">📚 Kutipan Tuition Cikgu Alam</option>
                  ) : form.type === 'masuk' ? (
                    <>
                      <option value="kutipan_bulanan">💰 Kutipan Bulanan (RM20/bulan)</option>
                      <option value="infaq">🌟 Dana Infaq SAA</option>
                    </>
                  ) : (
                    <option value="perbelanjaan">📤 Perbelanjaan</option>
                  )}
                </select>
              </div>
              <div>
                <label className="label">Nama / Kelas</label>
                <input className="input" value={form.donor_name}
                  onChange={e => setForm(f => ({ ...f, donor_name: e.target.value }))}
                  placeholder="cth: KSIB SAA – 5 Juara" />
              </div>
              <div>
                <label className="label">Jumlah (RM) *</label>
                <input className="input" type="number" min="0" step="0.01" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <label className="label">Tarikh</label>
                <input className="input" type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Nota</label>
                <input className="input" value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Penerangan ringkas..." />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={save} disabled={saving} className="btn-save flex-1">
                {saving ? 'Menyimpan...' : '💾 Simpan'}
              </button>
              <button onClick={() => setModal(false)} className="btn-cancel">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

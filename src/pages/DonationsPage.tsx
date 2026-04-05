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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">💚 Dana & Kutipan KSIB SAA</h1>
        <p className="text-gray-500 text-sm mt-1">Pengurusan kewangan Batch Salahuddin Al-Ayubi · SPM 2026</p>
      </div>

      {/* ── MAIN TOGGLE ─────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMainSection('dana_saa'); setDanaSub('semua_dana'); setKelasTab('semua_kelas') }}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 12, fontWeight: 700,
            fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s', border: '2px solid',
            background:   mainSection === 'dana_saa' ? '#16a34a' : '#ffffff',
            borderColor:  mainSection === 'dana_saa' ? '#16a34a' : '#bbf7d0',
            color:        mainSection === 'dana_saa' ? '#ffffff' : '#15803d',
            boxShadow:    mainSection === 'dana_saa' ? '0 2px 8px rgba(22,163,74,0.35)' : 'none',
          }}
        >
          💚 Dana SAA
          <div style={{ fontSize: '0.72rem', fontWeight: 400, marginTop: 2, opacity: 0.85 }}>
            Kutipan Bulanan · Dana Infaq · Perbelanjaan
          </div>
        </button>
        <button
          onClick={() => setMainSection('cikgu_alam')}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 12, fontWeight: 700,
            fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s', border: '2px solid',
            background:   mainSection === 'cikgu_alam' ? '#7c3aed' : '#ffffff',
            borderColor:  mainSection === 'cikgu_alam' ? '#7c3aed' : '#ede9fe',
            color:        mainSection === 'cikgu_alam' ? '#ffffff' : '#6d28d9',
            boxShadow:    mainSection === 'cikgu_alam' ? '0 2px 8px rgba(124,58,237,0.35)' : 'none',
          }}
        >
          📚 Tuition Cikgu Alam
          <div style={{ fontSize: '0.72rem', fontWeight: 400, marginTop: 2, opacity: 0.85 }}>
            Bayaran tuisyen Math & Add Math
          </div>
        </button>
      </div>

      {/* ══════════ DANA SAA ══════════ */}
      {mainSection === 'dana_saa' && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="card p-4 border-l-4 border-green-400">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">💰 Kutipan Bulanan</div>
              <div className="text-xl font-extrabold text-green-700">{fmtRM(sum(kutipanRecs))}</div>
              <div className="text-xs text-gray-400 mt-1">{kutipanRecs.length} transaksi</div>
            </div>
            <div className="card p-4 border-l-4 border-blue-400">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">🌟 Dana Infaq SAA</div>
              <div className="text-xl font-extrabold text-blue-700">{fmtRM(sum(infaqRecs))}</div>
              <div className="text-xs text-gray-400 mt-1">{infaqRecs.length} transaksi</div>
            </div>
            <div className="card p-4 border-l-4 border-red-400">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">📤 Perbelanjaan</div>
              <div className="text-xl font-extrabold text-red-700">{fmtRM(sum(belanjaRecs))}</div>
              <div className="text-xs text-gray-400 mt-1">{belanjaRecs.length} transaksi</div>
            </div>
          </div>

          {/* Baki banner */}
          <div style={{
            background: danaBaki >= 0 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${danaBaki >= 0 ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: 12, padding: '14px 18px', marginBottom: 20,
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>Baki Dana SAA</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>
                Masuk: {fmtRM(danaMasuk)} &nbsp;·&nbsp; Keluar: {fmtRM(danaKeluar)}
              </div>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.8rem', color: danaBaki >= 0 ? '#15803d' : '#dc2626' }}>
              {fmtRM(Math.abs(danaBaki))}
              <span style={{ fontWeight: 600, fontSize: '0.9rem', marginLeft: 6 }}>{danaBaki >= 0 ? 'Baki' : 'Defisit'}</span>
            </div>
            {isAdmin && (
              <button onClick={() => { setModal(true); setForm(f => ({ ...f, type: 'masuk', category: 'kutipan_bulanan' })) }}
                className="btn-add flex items-center gap-1 text-sm">
                <Plus size={15} /> Tambah Rekod
              </button>
            )}
          </div>

          {/* Sub-tabs: Semua | Kutipan Bulanan | Infaq | Perbelanjaan */}
          <div className="flex gap-1 flex-wrap mb-3 bg-gray-100 p-1 rounded-lg">
            {([
              ['semua_dana',      '📋 Semua',         danaSAAAll.length],
              ['kutipan_bulanan', '💰 Kutipan Bulanan', kutipanRecs.length],
              ['infaq',           '🌟 Dana Infaq',     infaqRecs.length],
              ['perbelanjaan',    '📤 Perbelanjaan',   belanjaRecs.length],
            ] as [DanaSAASub, string, number][]).map(([key, label, count]) => (
              <button key={key}
                onClick={() => { setDanaSub(key); setKelasTab('semua_kelas') }}
                style={{
                  fontSize: '0.75rem', fontWeight: danaSub === key ? 700 : 500,
                  padding: '6px 12px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                  background: danaSub === key ? '#ffffff' : 'transparent',
                  color: danaSub === key ? '#b34700' : '#6b7280',
                  boxShadow: danaSub === key ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                  border: 'none',
                }}
              >
                {label}
                <span style={{
                  marginLeft: 4, fontSize: '0.65rem', borderRadius: 999, padding: '1px 6px',
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
              {/* Per-class summary strip */}
              <div className="grid grid-cols-5 gap-2 mb-3">
                {KELAS.map(k => {
                  const recs = kelasByName(k)
                  const total = sum(recs)
                  const isActive = kelasTab === k
                  return (
                    <button key={k} onClick={() => setKelasTab(isActive ? 'semua_kelas' : k)}
                      style={{
                        borderRadius: 10, padding: '10px 8px', cursor: 'pointer',
                        border: '2px solid', transition: 'all 0.15s', textAlign: 'center',
                        background: isActive ? '#16a34a' : '#f0fdf4',
                        borderColor: isActive ? '#16a34a' : '#bbf7d0',
                        color: isActive ? '#ffffff' : '#15803d',
                        boxShadow: isActive ? '0 2px 6px rgba(22,163,74,0.3)' : 'none',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{k}</div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', marginTop: 2, opacity: 0.9 }}>
                        {fmtRM(total)}
                      </div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 1 }}>
                        {recs.length} rekod
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Class tab row */}
              <div className="flex gap-1 flex-wrap mb-3 bg-green-50 p-1 rounded-lg border border-green-100">
                <button
                  onClick={() => setKelasTab('semua_kelas')}
                  style={{
                    fontSize: '0.72rem', fontWeight: kelasTab === 'semua_kelas' ? 700 : 500,
                    padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: 'none',
                    background: kelasTab === 'semua_kelas' ? '#16a34a' : 'transparent',
                    color: kelasTab === 'semua_kelas' ? '#fff' : '#15803d',
                  }}
                >
                  📋 Semua Kelas
                </button>
                {KELAS.map(k => (
                  <button key={k}
                    onClick={() => setKelasTab(k)}
                    style={{
                      fontSize: '0.72rem', fontWeight: kelasTab === k ? 700 : 500,
                      padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: 'none',
                      background: kelasTab === k ? '#16a34a' : 'transparent',
                      color: kelasTab === k ? '#fff' : '#15803d',
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-light border-b border-border">
                  <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">#</th>
                  <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">
                    {danaSub === 'kutipan_bulanan' ? 'Kelas / Nama' : 'Nama / Kelas'}
                  </th>
                  {showCatCol && (
                    <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">Kategori</th>
                  )}
                  {danaSub === 'kutipan_bulanan' && kelasTab === 'semua_kelas' && (
                    <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">Kelas</th>
                  )}
                  <th className="text-right py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">Jumlah</th>
                  <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">Tarikh</th>
                  <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">Nota</th>
                  {isAdmin && <th className="py-2.5 px-3"></th>}
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
                  return (
                    <tr key={d.id} className="border-b border-border last:border-0 hover:bg-light transition-colors">
                      <td className="py-2.5 px-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">{d.donor_name || 'Tanpa Nama'}</td>
                      {showCatCol && (
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                            {cfg.emoji} {cfg.label}
                          </span>
                        </td>
                      )}
                      {danaSub === 'kutipan_bulanan' && kelasTab === 'semua_kelas' && (
                        <td className="py-2.5 px-3">
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
                            borderRadius: 999, background: '#dcfce7', color: '#15803d',
                          }}>
                            {getKelas(d.donor_name || '')}
                          </span>
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-right font-bold" style={{ color: amtColor }}>
                        {isOut ? '–' : '+'}{fmtRM(Number(d.amount))}
                      </td>
                      <td className="py-2.5 px-3 text-gray-500 text-xs whitespace-nowrap">{fmtDate(d.date)}</td>
                      <td className="py-2.5 px-3 text-gray-500 text-xs max-w-[200px] truncate">{d.note || '—'}</td>
                      {isAdmin && (
                        <td className="py-2.5 px-3">
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
                <tr className="bg-gray-50 border-t-2 border-border">
                  <td colSpan={2 + (showCatCol ? 1 : 0) + (danaSub === 'kutipan_bulanan' && kelasTab === 'semua_kelas' ? 1 : 0)}
                      className="py-2.5 px-3 text-xs font-bold text-gray-600 uppercase">Jumlah</td>
                  <td className="py-2.5 px-3 text-right font-extrabold">
                    <span style={{ color: '#15803d', display: 'block' }}>
                      +{fmtRM(displayed.filter(d => d.type !== 'keluar').reduce((s,d) => s + Number(d.amount), 0))}
                    </span>
                    {displayed.some(d => d.type === 'keluar') && (
                      <span style={{ color: '#dc2626', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>
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

import { useEffect, useState } from 'react'
import { Plus, X, Trash2, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Donation } from '../types'

// ── Sub-category config (within Dana SAA) ──────────────────────
const DANA_SAA_SUBS = {
  kutipan_bulanan: {
    label:  'Kutipan Bulanan',
    emoji:  '💰',
    desc:   'RM20/pelajar/bulan · dikutip wakil kelas',
    color:  'text-green-700',
    bg:     'bg-green-50',
    border: 'border-green-300',
    badge:  'bg-green-100 text-green-800',
    amtClass: 'text-green-700',
  },
  infaq: {
    label:  'Dana Infaq SAA',
    emoji:  '🌟',
    desc:   'Tabung Infaq 2026 · diuruskan Amir Abd Rahim',
    color:  'text-blue-700',
    bg:     'bg-blue-50',
    border: 'border-blue-300',
    badge:  'bg-blue-100 text-blue-800',
    amtClass: 'text-blue-700',
  },
  perbelanjaan: {
    label:  'Perbelanjaan',
    emoji:  '📤',
    desc:   'Hadiah, tuition, makanan & lain-lain',
    color:  'text-red-700',
    bg:     'bg-red-50',
    border: 'border-red-300',
    badge:  'bg-red-100 text-red-800',
    amtClass: 'text-red-700',
  },
} as const

const CIKGU_ALAM_CONFIG = {
  label:  'Tuition Cikgu Alam',
  emoji:  '📚',
  desc:   'Bayaran tuisyen Math & Add Math · dikutip berasingan',
  color:  'text-purple-700',
  bg:     'bg-purple-50',
  border: 'border-purple-300',
  badge:  'bg-purple-100 text-purple-800',
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

export default function DonationsPage() {
  const { isAdmin } = useAuth()
  const [donations,    setDonations]    = useState<Donation[]>([])
  const [loading,      setLoading]      = useState(true)
  const [modal,        setModal]        = useState(false)
  const [mainSection,  setMainSection]  = useState<MainSection>('dana_saa')
  const [danaSub,      setDanaSub]      = useState<DanaSAASub>('semua_dana')
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
      amount:     Number(form.amount),
      date:       form.date,
      note:       form.note,
      category:   form.category,
      type:       form.type,
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

  // ── Dana SAA records (kutipan_bulanan + infaq + perbelanjaan) ──
  const danaSAAAll    = donations.filter(d => d.category !== 'cikgu_alam')
  const kutipanRecs   = donations.filter(d => d.category === 'kutipan_bulanan')
  const infaqRecs     = donations.filter(d => d.category === 'infaq')
  const belanjaRecs   = donations.filter(d => d.category === 'perbelanjaan')
  const cikguRecs     = donations.filter(d => d.category === 'cikgu_alam')

  const sum = (rows: Donation[]) => rows.reduce((s, d) => s + Number(d.amount), 0)

  const danaMasuk  = sum(kutipanRecs) + sum(infaqRecs)
  const danaKeluar = sum(belanjaRecs)
  const danaBaki   = danaMasuk - danaKeluar

  // Rows shown in table based on section + sub-tab
  const displayed = mainSection === 'cikgu_alam'
    ? cikguRecs
    : danaSub === 'semua_dana'   ? danaSAAAll
    : danaSub === 'kutipan_bulanan' ? kutipanRecs
    : danaSub === 'infaq'        ? infaqRecs
    : belanjaRecs

  // Category badge helper
  function catBadge(d: Donation) {
    if (d.category === 'kutipan_bulanan') return DANA_SAA_SUBS.kutipan_bulanan
    if (d.category === 'infaq')           return DANA_SAA_SUBS.infaq
    if (d.category === 'perbelanjaan')    return DANA_SAA_SUBS.perbelanjaan
    return CIKGU_ALAM_CONFIG
  }

  if (loading) return <div className="text-center py-16 text-gray-500">Memuatkan...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">💚 Dana & Kutipan KSIB SAA</h1>
        <p className="text-gray-500 text-sm mt-1">Pengurusan kewangan Batch Salahuddin Al-Ayubi · SPM 2026</p>
      </div>

      {/* ── MAIN SECTION TOGGLE ───────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMainSection('dana_saa'); setDanaSub('semua_dana') }}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${
            mainSection === 'dana_saa'
              ? 'bg-green-600 text-white border-green-600 shadow-md'
              : 'bg-white text-green-700 border-green-200 hover:border-green-400'
          }`}
        >
          💚 Dana SAA
          <div className={`text-xs font-normal mt-0.5 ${mainSection === 'dana_saa' ? 'text-green-100' : 'text-gray-400'}`}>
            Kutipan Bulanan · Dana Infaq · Perbelanjaan
          </div>
        </button>
        <button
          onClick={() => setMainSection('cikgu_alam')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${
            mainSection === 'cikgu_alam'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
              : 'bg-white text-purple-700 border-purple-200 hover:border-purple-400'
          }`}
        >
          📚 Tuition Cikgu Alam
          <div className={`text-xs font-normal mt-0.5 ${mainSection === 'cikgu_alam' ? 'text-purple-100' : 'text-gray-400'}`}>
            Bayaran tuisyen Math & Add Math
          </div>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          DANA SAA SECTION
      ══════════════════════════════════════════════════════════ */}
      {mainSection === 'dana_saa' && (
        <>
          {/* Summary cards — Dana SAA */}
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

          {/* Baki Dana SAA */}
          <div className={`card p-4 mb-5 flex flex-wrap items-center justify-between gap-3 ${danaBaki >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div>
              <div className="text-sm font-bold text-gray-700">Baki Dana SAA</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Masuk: {fmtRM(danaMasuk)} &nbsp;·&nbsp; Keluar: {fmtRM(danaKeluar)}
              </div>
            </div>
            <div className={`text-3xl font-extrabold ${danaBaki >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {fmtRM(Math.abs(danaBaki))}
              <span className="text-base font-semibold ml-1">{danaBaki >= 0 ? 'Baki' : 'Defisit'}</span>
            </div>
            {isAdmin && (
              <button onClick={() => { setModal(true); setForm(f => ({ ...f, type: 'masuk', category: 'kutipan_bulanan' })) }}
                className="btn-add flex items-center gap-1 text-sm">
                <Plus size={15} /> Tambah Rekod
              </button>
            )}
          </div>

          {/* Sub-tabs for Dana SAA */}
          <div className="flex gap-1 flex-wrap mb-4 bg-gray-100 p-1 rounded-lg">
            {([
              ['semua_dana',       '📋 Semua Dana SAA'],
              ['kutipan_bulanan',  '💰 Kutipan Bulanan'],
              ['infaq',            '🌟 Dana Infaq SAA'],
              ['perbelanjaan',     '📤 Perbelanjaan'],
            ] as [DanaSAASub, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDanaSub(key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                  danaSub === key ? 'bg-white text-primary shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
                <span className={`ml-1 text-[10px] rounded-full px-1.5 py-0.5 ${danaSub === key ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {key === 'semua_dana' ? danaSAAAll.length
                    : key === 'kutipan_bulanan' ? kutipanRecs.length
                    : key === 'infaq'           ? infaqRecs.length
                    : belanjaRecs.length}
                </span>
              </button>
            ))}
          </div>

          {/* Sub-section description */}
          {danaSub !== 'semua_dana' && (
            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-3 ${DANA_SAA_SUBS[danaSub as keyof typeof DANA_SAA_SUBS]?.bg} ${DANA_SAA_SUBS[danaSub as keyof typeof DANA_SAA_SUBS]?.color}`}>
              <ChevronRight size={12} />
              {DANA_SAA_SUBS[danaSub as keyof typeof DANA_SAA_SUBS]?.desc}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          CIKGU ALAM SECTION
      ══════════════════════════════════════════════════════════ */}
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
                Kutipan ini dikutip berasingan daripada Dana SAA.<br />
                Bayaran terus kepada Cikgu Alam.
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

      {/* ── SHARED TABLE ─────────────────────────────────────── */}
      <div className="card overflow-hidden">
        {displayed.length === 0 ? (
          <p className="text-center text-gray-400 py-10 italic">Tiada rekod.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-light border-b border-border">
                  <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">#</th>
                  <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">Nama / Kelas</th>
                  {mainSection === 'dana_saa' && danaSub === 'semua_dana' && (
                    <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">Kategori</th>
                  )}
                  <th className="text-right py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">Jumlah</th>
                  <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">Tarikh</th>
                  <th className="text-left py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">Nota</th>
                  {isAdmin && <th className="py-2.5 px-3"></th>}
                </tr>
              </thead>
              <tbody>
                {displayed.map((d, i) => {
                  const cfg   = catBadge(d)
                  const isOut = d.type === 'keluar'
                  return (
                    <tr key={d.id} className="border-b border-border last:border-0 hover:bg-light transition-colors">
                      <td className="py-2.5 px-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">{d.donor_name || 'Tanpa Nama'}</td>
                      {mainSection === 'dana_saa' && danaSub === 'semua_dana' && (
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${'badge' in cfg ? cfg.badge : 'bg-gray-100 text-gray-700'}`}>
                            {'emoji' in cfg ? cfg.emoji : ''} {cfg.label}
                          </span>
                        </td>
                      )}
                      <td className={`py-2.5 px-3 text-right font-bold ${isOut ? 'text-red-600' : mainSection === 'cikgu_alam' ? 'text-purple-700' : danaSub === 'infaq' ? 'text-blue-700' : 'text-green-700'}`}>
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
                  <td colSpan={mainSection === 'dana_saa' && danaSub === 'semua_dana' ? 3 : 2}
                      className="py-2.5 px-3 text-xs font-bold text-gray-600 uppercase">
                    Jumlah
                  </td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-gray-800">
                    <span className="text-green-700 block">
                      +{fmtRM(displayed.filter(d => d.type !== 'keluar').reduce((s,d) => s + Number(d.amount), 0))}
                    </span>
                    {displayed.some(d => d.type === 'keluar') && (
                      <span className="text-red-600 block text-xs font-bold">
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

      {/* ── ADD RECORD MODAL ─────────────────────────────────── */}
      {modal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-primary text-lg">➕ Tambah Rekod</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-3">
              {/* Only show type toggle for Dana SAA */}
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

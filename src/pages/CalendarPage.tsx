import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { CalendarOverride, FutureActivity } from '../types'

// ── Static school schedule ───────────────────────────────────────
const _PB:   Record<number, number[]> = {3:[5,6,7],4:[23,24,25],7:[2,3,4,30,31],8:[1],10:[1,2,3]}
const _OT:   Record<number, number[]> = {1:[23,24],4:[10,11],5:[8,9],6:[19,20],7:[17,18],8:[14,15],9:[18,19],10:[16,17,30,31],11:[20,21]}
const _LW:   Record<number, number[]> = {1:[16,17,30,31],2:[6,7,27,28],3:[13,14],4:[3,4,17,18],5:[1,2,15,16],6:[12,13,26,27],7:[10,11,24,25],8:[7,8,21,22],9:[11,12,25,26],10:[9,10,23,24],11:[13,14,27,28]}
const _CUTI: Record<number, number[]> = {1:[1,2,3,4,5,6,7,8,9,10],2:[11,12,13,14,15,16,17,18,19,20,21],3:[19,20,21,22,23,24,25,26,27,28],5:[21,22,23,24,25,26,27,28,29,30,31],6:[1,2,3,4,5,6],8:[27,28,29,30,31],9:[1,2,3,4,5],11:[5,6,7,8,9],12:[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]}

const MONTHS_MY  = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']
const DAYS_MY    = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu']
const DAYS_SHORT = ['Ahd','Isn','Sel','Rab','Kha','Jum','Sab']

function has(obj: Record<number, number[]>, m: number, d: number) {
  return (obj[m] || []).includes(d)
}
function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}
function addMonths(year: number, month: number, offset: number) {
  let m = month - 1 + offset
  const y = year + Math.floor(m / 12)
  m = ((m % 12) + 12) % 12
  return { year: y, month: m + 1 }
}

const ACTIVITY_EMPTY = { name:'', description:'', date:'', time:'', place:'', participants:'', cost:'', organiser:'KSIB SAA', status:'Dirancang' }

// ── Full-size month grid ─────────────────────────────────────────
interface MonthGridProps {
  year: number
  month: number
  overrides: Record<string, CalendarOverride>
  actByDate: Record<string, FutureActivity[]>
  dayDetail: string | null
  onDayClick: (iso: string) => void
  todayIso: string
}

function FullMonthGrid({ year, month, overrides, actByDate, dayDetail, onDayClick, todayIso }: MonthGridProps) {
  const firstDow    = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const total       = firstDow + daysInMonth
  const trailing    = (7 - (total % 7)) % 7

  return (
    <div className="card p-4 mb-4">
      {/* Month title */}
      <h2 className="text-lg font-bold text-primary mb-3 text-center">
        {MONTHS_MY[month - 1]} {year}
      </h2>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d, i) => (
          <div key={d} className={`text-center text-xs font-bold py-1 ${i === 4 || i === 5 ? 'text-orange-500' : 'text-gray-500'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {Array.from({ length: firstDow }, (_, i) => (
          <div key={`b${i}`} className="bg-gray-50 min-h-[80px]" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const d       = i + 1
          const dow     = (firstDow + i) % 7
          const isWknd  = dow === 4 || dow === 5
          const iso     = isoDate(year, month, d)
          const ov      = overrides[iso]
          const isPB    = ov ? ov.pb   : has(_PB,   month, d)
          const isOT    = ov ? ov.ot   : has(_OT,   month, d)
          const isLW    = ov ? ov.lw   : has(_LW,   month, d)
          const isCuti  = ov ? ov.cuti : has(_CUTI, month, d)
          const isToday    = todayIso === iso
          const isSelected = dayDetail === iso
          const dayActs    = actByDate[iso] || []

          const bg = isSelected
            ? 'bg-orange-50 ring-2 ring-primary ring-inset'
            : isCuti ? 'bg-gray-50'
            : isWknd ? 'bg-amber-50/40'
            : 'bg-white'

          return (
            <div
              key={d}
              onClick={() => onDayClick(iso)}
              className={`${bg} min-h-[80px] p-1.5 cursor-pointer hover:bg-orange-50/60 transition-colors relative`}
            >
              {/* Day number */}
              <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                ${isToday ? 'bg-primary text-white' : isWknd ? 'text-orange-500' : 'text-gray-700'}`}>
                {d}
              </div>

              {/* Schedule badges */}
              <div className="space-y-0.5">
                {isPB   && <div className="text-[9px] font-bold bg-green-100 text-green-700 px-1 rounded leading-tight">PB</div>}
                {isOT   && <div className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1 rounded leading-tight">OT</div>}
                {isLW   && <div className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1 rounded leading-tight">LW</div>}
                {isCuti && !isPB && !isOT && !isLW &&
                  <div className="text-[9px] bg-gray-200 text-gray-500 px-1 rounded leading-tight">Cuti</div>}

                {/* Activity chips */}
                {dayActs.slice(0, 2).map(a => (
                  <div key={a.id} className="text-[9px] bg-orange-500 text-white px-1 rounded leading-tight truncate">
                    {a.name}
                  </div>
                ))}
                {dayActs.length > 2 && (
                  <div className="text-[9px] text-orange-500 font-bold">+{dayActs.length - 2} lagi</div>
                )}
              </div>

              {ov && <span className="absolute top-0.5 right-0.5 text-[8px] text-gray-400">✏</span>}
            </div>
          )
        })}

        {Array.from({ length: trailing }, (_, i) => (
          <div key={`t${i}`} className="bg-gray-50 min-h-[80px]" />
        ))}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────
export default function CalendarPage() {
  const { isAdmin } = useAuth()
  const today    = new Date()
  const todayIso = isoDate(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const [startYear,  setStartYear]  = useState(2026)
  const [startMonth, setStartMonth] = useState(today.getFullYear() === 2026 ? today.getMonth() + 1 : 4)

  const [overrides,  setOverrides]  = useState<Record<string, CalendarOverride>>({})
  const [activities, setActivities] = useState<FutureActivity[]>([])
  const [dayDetail,  setDayDetail]  = useState<string | null>(null)

  // Admin modals
  const [editDay,  setEditDay]  = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ pb: false, ot: false, lw: false, cuti: false })
  const [actModal,  setActModal]  = useState(false)
  const [actEdit,   setActEdit]   = useState<Partial<FutureActivity>>({})
  const [actSaving, setActSaving] = useState(false)

  useEffect(() => { loadOverrides(); loadActivities() }, [])

  async function loadOverrides() {
    const { data } = await supabase.from('calendar_overrides').select('*')
    if (!data) return
    const map: Record<string, CalendarOverride> = {}
    data.forEach(r => { map[r.date] = r })
    setOverrides(map)
  }
  async function loadActivities() {
    const { data } = await supabase.from('future_activities').select('*').order('date')
    setActivities(data || [])
  }

  const actByDate: Record<string, FutureActivity[]> = {}
  activities.forEach(a => {
    if (a.date && /^\d{4}-\d{2}-\d{2}$/.test(a.date)) {
      if (!actByDate[a.date]) actByDate[a.date] = []
      actByDate[a.date].push(a)
    }
  })

  // Navigation (slide by 1 month)
  function prev() {
    const { year, month } = addMonths(startYear, startMonth, -1)
    setStartYear(year); setStartMonth(month); setDayDetail(null)
  }
  function next() {
    const { year, month } = addMonths(startYear, startMonth, 1)
    setStartYear(year); setStartMonth(month); setDayDetail(null)
  }

  const visibleMonths = [0,1,2,3].map(o => addMonths(startYear, startMonth, o))

  // Day detail data
  const detailDate  = dayDetail ? new Date(dayDetail + 'T00:00:00') : null
  const detailD     = dayDetail ? parseInt(dayDetail.split('-')[2]) : 0
  const detailM     = dayDetail ? parseInt(dayDetail.split('-')[1]) : 0
  const detailY     = dayDetail ? parseInt(dayDetail.split('-')[0]) : 0
  const detailActs  = dayDetail ? (actByDate[dayDetail] || []) : []
  const detailOv    = dayDetail ? overrides[dayDetail] : null
  const detailIsPB  = detailOv ? detailOv.pb   : has(_PB,   detailM, detailD)
  const detailIsOT  = detailOv ? detailOv.ot   : has(_OT,   detailM, detailD)
  const detailIsLW  = detailOv ? detailOv.lw   : has(_LW,   detailM, detailD)
  const detailIsCuti = detailOv ? detailOv.cuti : has(_CUTI, detailM, detailD)

  function handleDayClick(iso: string) {
    setDayDetail(prev => prev === iso ? null : iso)
    // Scroll to detail panel
    setTimeout(() => {
      document.getElementById('day-detail-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  function openEditModal(iso: string) {
    const [,m,d] = iso.split('-').map(Number)
    const ov = overrides[iso]
    setEditForm({
      pb:   ov ? ov.pb   : has(_PB,   m, d),
      ot:   ov ? ov.ot   : has(_OT,   m, d),
      lw:   ov ? ov.lw   : has(_LW,   m, d),
      cuti: ov ? ov.cuti : has(_CUTI, m, d),
    })
    setEditDay(iso)
  }
  async function saveOverride() {
    if (!editDay) return
    await supabase.from('calendar_overrides').upsert({ date: editDay, ...editForm })
    setOverrides(prev => ({ ...prev, [editDay]: { date: editDay, ...editForm } }))
    setEditDay(null)
  }
  async function clearOverride() {
    if (!editDay) return
    await supabase.from('calendar_overrides').delete().eq('date', editDay)
    setOverrides(prev => { const n = {...prev}; delete n[editDay]; return n })
    setEditDay(null)
  }
  function openNewActivity(iso: string) { setActEdit({ ...ACTIVITY_EMPTY, date: iso }); setActModal(true) }
  function openEditActivity(a: FutureActivity) { setActEdit({...a}); setActModal(true) }
  async function saveActivity() {
    if (!actEdit.name?.trim()) return
    setActSaving(true)
    if (actEdit.id) await supabase.from('future_activities').update(actEdit).eq('id', actEdit.id)
    else await supabase.from('future_activities').insert({ ...actEdit, sort_order: activities.length })
    setActSaving(false); setActModal(false); loadActivities()
  }
  async function deleteActivity(id: string) {
    if (!confirm('Padam aktiviti ini?')) return
    await supabase.from('future_activities').delete().eq('id', id)
    loadActivities()
  }

  const lastMonth = visibleMonths[3]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-primary">📅 Kalendar Akademik {startYear}</h1>
          <p className="text-gray-500 text-sm">Jadual & Program Batch Salahuddin Al-Ayubi · KUPSIS</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="p-2 rounded-lg border border-border hover:bg-light transition-colors" title="Bulan sebelum">
            <ChevronLeft size={18} />
          </button>
          <span className="font-semibold text-primary text-sm min-w-[210px] text-center">
            {MONTHS_MY[startMonth - 1]} – {MONTHS_MY[lastMonth.month - 1]} {lastMonth.year}
          </span>
          <button onClick={next} className="p-2 rounded-lg border border-border hover:bg-light transition-colors" title="Bulan seterusnya">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          ['bg-green-100 text-green-800 border border-green-200',   'PB — Pulang Bermalam'],
          ['bg-blue-100 text-blue-800 border border-blue-200',      'OT — Outing'],
          ['bg-purple-100 text-purple-800 border border-purple-200','LW — Lawatan Waris'],
          ['bg-gray-100 text-gray-500 border border-gray-200',      'Cuti Sekolah'],
          ['bg-amber-50 text-amber-700 border border-amber-200',    'Hujung Minggu'],
          ['bg-orange-500 text-white',                              '● Program KSIB'],
        ].map(([cls, label]) => (
          <span key={label} className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
        ))}
        {isAdmin && <span className="text-xs text-gray-400 italic self-center">Klik tarikh untuk lihat / edit</span>}
      </div>

      {/* Day detail panel (sticky, shown when a day is selected) */}
      {dayDetail && (
        <div id="day-detail-panel" className="card mb-5 border-l-4 border-primary">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-bold text-primary text-base">
                {detailDate ? DAYS_MY[detailDate.getDay()] : ''}, {detailD} {MONTHS_MY[detailM - 1]} {detailY}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {detailIsPB   && <span className="badge badge-green text-xs">PB — Pulang Bermalam</span>}
                {detailIsOT   && <span className="badge badge-blue text-xs">OT — Outing</span>}
                {detailIsLW   && <span className="badge badge-purple text-xs">LW — Lawatan Waris</span>}
                {detailIsCuti && <span className="badge badge-grey text-xs">Cuti Sekolah</span>}
                {!detailIsPB && !detailIsOT && !detailIsLW && !detailIsCuti &&
                  <span className="text-xs text-gray-400 italic">Tiada jadual khas</span>}
              </div>
            </div>
            <button onClick={() => setDayDetail(null)} className="text-gray-400 hover:text-gray-600 shrink-0 ml-2">
              <X size={18} />
            </button>
          </div>

          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Program / Aktiviti</div>
          {detailActs.length === 0 ? (
            <p className="text-gray-400 text-sm italic mb-3">Tiada program pada tarikh ini.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
              {detailActs.map(a => (
                <div key={a.id} className="bg-light rounded-lg p-2.5 border border-border">
                  <div className="flex items-start justify-between gap-1">
                    <div className="font-semibold text-sm text-gray-800 flex-1">{a.name}</div>
                    {isAdmin && (
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEditActivity(a)} className="text-blue-500 hover:text-blue-700"><Pencil size={13} /></button>
                        <button onClick={() => deleteActivity(a.id)} className="text-red-500 hover:text-red-700"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                  {a.time       && <div className="text-xs text-gray-500 mt-0.5">⏰ {a.time}</div>}
                  {a.place      && <div className="text-xs text-gray-500">📍 {a.place}</div>}
                  {a.organiser  && <div className="text-xs text-gray-500">🏢 {a.organiser}</div>}
                  {a.description && <div className="text-xs text-gray-500 mt-1 border-t border-border pt-1">{a.description}</div>}
                </div>
              ))}
            </div>
          )}

          {isAdmin && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => openNewActivity(dayDetail)} className="btn-add flex items-center gap-1 text-xs">
                <Plus size={13} /> Tambah Program
              </button>
              <button onClick={() => openEditModal(dayDetail)} className="btn-edit flex items-center gap-1 text-xs">
                <Pencil size={13} /> Edit PB/OT/LW
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4 full-size monthly grids stacked */}
      {visibleMonths.map(({ year, month }) => (
        <FullMonthGrid
          key={`${year}-${month}`}
          year={year}
          month={month}
          overrides={overrides}
          actByDate={actByDate}
          dayDetail={dayDetail}
          onDayClick={handleDayClick}
          todayIso={todayIso}
        />
      ))}

      {/* All programs list */}
      <div className="mt-4">
        <h2 className="text-lg font-bold text-primary mb-4">📋 Semua Program {startYear}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MONTHS_MY.map((mName, mi) => {
            const m  = mi + 1
            const mm = String(m).padStart(2,'0')
            const monthActs = activities.filter(a => a.date && a.date.startsWith(`${startYear}-${mm}`))
            if (monthActs.length === 0) return null
            return (
              <div key={m} className="card p-3 cursor-pointer hover:bg-light transition-colors"
                onClick={() => { setStartYear(startYear); setStartMonth(m); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                <div className="font-bold text-primary text-sm mb-2">{mName} {startYear}</div>
                <div className="space-y-1">
                  {monthActs.map(a => (
                    <div key={a.id} className="flex items-start gap-2 text-xs">
                      <span className="text-gray-400 shrink-0 font-mono">{a.date?.slice(8)}</span>
                      <span className="text-gray-700 font-medium truncate">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Edit PB/OT/LW Modal */}
      {editDay && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditDay(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-primary text-lg mb-1">✏️ Edit Jadual</h2>
            <p className="text-gray-400 text-sm mb-4">{editDay}</p>
            {(['pb','ot','lw','cuti'] as const).map(key => (
              <label key={key} className="flex items-center gap-2 mb-3 cursor-pointer select-none">
                <input type="checkbox" checked={editForm[key]}
                  onChange={e => setEditForm(f => ({ ...f, [key]: e.target.checked }))}
                  className="w-4 h-4 accent-orange-600" />
                <span className="text-sm font-medium">
                  {key === 'pb' && 'PB — Pulang Bermalam'}
                  {key === 'ot' && 'OT — Outing'}
                  {key === 'lw' && 'LW — Lawatan Waris'}
                  {key === 'cuti' && 'Cuti / Tidak Bersekolah'}
                </span>
              </label>
            ))}
            <div className="flex gap-2 mt-4">
              <button onClick={saveOverride} className="btn-save flex-1">💾 Simpan</button>
              <button onClick={clearOverride} className="btn-cancel flex-1">🔄 Reset</button>
              <button onClick={() => setEditDay(null)} className="btn-del">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Activity Modal */}
      {actModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setActModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-primary text-lg">{actEdit.id ? '✏️ Edit Program' : '➕ Tambah Program'}</h2>
              <button onClick={() => setActModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="label">Nama Program *</label>
                <input className="input" value={actEdit.name || ''} onChange={e => setActEdit(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Tarikh</label>
                <input className="input" type="date" value={actEdit.date || ''} onChange={e => setActEdit(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Masa</label>
                <input className="input" value={actEdit.time || ''} onChange={e => setActEdit(p => ({ ...p, time: e.target.value }))} placeholder="cth: 9:00 AM" />
              </div>
              <div>
                <label className="label">Tempat</label>
                <input className="input" value={actEdit.place || ''} onChange={e => setActEdit(p => ({ ...p, place: e.target.value }))} />
              </div>
              <div>
                <label className="label">Penganjur</label>
                <input className="input" value={actEdit.organiser || ''} onChange={e => setActEdit(p => ({ ...p, organiser: e.target.value }))} />
              </div>
              <div>
                <label className="label">Peserta</label>
                <input className="input" value={actEdit.participants || ''} onChange={e => setActEdit(p => ({ ...p, participants: e.target.value }))} />
              </div>
              <div>
                <label className="label">Kos</label>
                <input className="input" value={actEdit.cost || ''} onChange={e => setActEdit(p => ({ ...p, cost: e.target.value }))} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={actEdit.status || 'Dirancang'} onChange={e => setActEdit(p => ({ ...p, status: e.target.value }))}>
                  {['Dirancang','Sedang Berjalan','Selesai','Dibatalkan'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Penerangan</label>
                <textarea className="input h-20 resize-none" value={actEdit.description || ''} onChange={e => setActEdit(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveActivity} disabled={actSaving} className="btn-save flex-1">
                {actSaving ? 'Menyimpan...' : '💾 Simpan'}
              </button>
              <button onClick={() => setActModal(false)} className="btn-cancel">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

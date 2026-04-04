import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { CalendarOverride } from '../types'

// Static schedule data (matches original dashboard)
const _PB:   Record<number, number[]> = {3:[5,6,7],4:[23,24,25],7:[2,3,4,30,31],8:[1],10:[1,2,3]}
const _OT:   Record<number, number[]> = {1:[23,24],4:[10,11],5:[8,9],6:[19,20],7:[17,18],8:[14,15],9:[18,19],10:[16,17,30,31],11:[20,21]}
const _LW:   Record<number, number[]> = {1:[16,17,30,31],2:[6,7,27,28],3:[13,14],4:[3,4,17,18],5:[1,2,15,16],6:[12,13,26,27],7:[10,11,24,25],8:[7,8,21,22],9:[11,12,25,26],10:[9,10,23,24],11:[13,14,27,28]}
const _CUTI: Record<number, number[]> = {1:[1,2,3,4,5,6,7,8,9,10],2:[11,12,13,14,15,16,17,18,19,20,21],3:[19,20,21,22,23,24,25,26,27,28],5:[21,22,23,24,25,26,27,28,29,30,31],6:[1,2,3,4,5,6],8:[27,28,29,30,31],9:[1,2,3,4,5],11:[5,6,7,8,9],12:[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]}

const MONTHS_MY = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']
const DAYS_MY   = ['Ahd','Isn','Sel','Rab','Kha','Jum','Sab']

function has(obj: Record<number, number[]>, m: number, d: number) {
  return (obj[m] || []).includes(d)
}

export default function CalendarPage() {
  const { isAdmin } = useAuth()
  const [overrides, setOverrides] = useState<Record<string, CalendarOverride>>({})
  const [selected, setSelected] = useState<{ date: string; m: number; d: number } | null>(null)
  const [editForm, setEditForm] = useState({ pb: false, ot: false, lw: false, cuti: false })
  const today = new Date()

  useEffect(() => {
    supabase.from('calendar_overrides').select('*').then(({ data }) => {
      if (!data) return
      const map: Record<string, CalendarOverride> = {}
      data.forEach(r => { map[r.date] = r })
      setOverrides(map)
    })
  }, [])

  function openDay(isoDate: string, m: number, d: number) {
    const ov = overrides[isoDate]
    setEditForm({
      pb:   ov ? ov.pb   : has(_PB,   m, d),
      ot:   ov ? ov.ot   : has(_OT,   m, d),
      lw:   ov ? ov.lw   : has(_LW,   m, d),
      cuti: ov ? ov.cuti : has(_CUTI, m, d),
    })
    setSelected({ date: isoDate, m, d })
  }

  async function saveOverride() {
    if (!selected) return
    const { date } = selected
    const { error } = await supabase.from('calendar_overrides').upsert({ date, ...editForm })
    if (!error) {
      setOverrides(prev => ({ ...prev, [date]: { date, ...editForm } }))
      setSelected(null)
    }
  }

  async function clearOverride() {
    if (!selected) return
    const { date } = selected
    await supabase.from('calendar_overrides').delete().eq('date', date)
    setOverrides(prev => { const n = { ...prev }; delete n[date]; return n })
    setSelected(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary mb-2">📅 Kalendar Akademik 2026</h1>
      <p className="text-gray-500 text-sm mb-6">Jadual PB, OT, LW dan Cuti KUPSIS — Batch Salahuddin Al-Ayubi</p>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          ['bg-green-100 text-green-800',  'PB — Pulang Bermalam'],
          ['bg-blue-100 text-blue-800',    'OT — Outing'],
          ['bg-purple-100 text-purple-800','LW — Lawatan Waris'],
          ['bg-gray-200 text-gray-600',    'Cuti / Tidak Bersekolah'],
          ['bg-amber-100 text-amber-800',  'Hujung minggu (Khamis–Jumaat)'],
        ].map(([cls, label]) => (
          <span key={label} className={`text-xs font-semibold px-2 py-1 rounded-full ${cls}`}>{label}</span>
        ))}
        {isAdmin && <span className="text-xs text-gray-400 italic">Klik tarikh untuk edit</span>}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, mi) => {
          const m = mi + 1
          const firstDow = new Date(2026, mi, 1).getDay()
          const daysInM  = new Date(2026, m, 0).getDate()
          const mm = String(m).padStart(2, '0')

          return (
            <div key={m} className="card p-3">
              <div className="text-center font-bold text-primary text-sm mb-2">{MONTHS_MY[mi]} 2026</div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    {DAYS_MY.map((d, di) => (
                      <th key={d} className={`py-1 text-center font-semibold ${di >= 5 ? 'text-orange-500' : 'text-gray-500'}`}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const cells: React.ReactNode[] = []
                    let row: React.ReactNode[] = []
                    // Leading blanks
                    for (let e = 0; e < firstDow; e++) {
                      row.push(<td key={`e${e}`} />)
                    }
                    for (let d = 1; d <= daysInM; d++) {
                      const dow    = (firstDow + d - 1) % 7
                      const isWknd = dow === 4 || dow === 5  // Thu+Fri (Kedah)
                      const dd = String(d).padStart(2, '0')
                      const iso = `2026-${mm}-${dd}`
                      const ov  = overrides[iso]
                      const isPB   = ov ? ov.pb   : has(_PB,   m, d)
                      const isOT   = ov ? ov.ot   : has(_OT,   m, d)
                      const isLW   = ov ? ov.lw   : has(_LW,   m, d)
                      const isCuti = ov ? ov.cuti : has(_CUTI, m, d)
                      const isToday = today.getFullYear() === 2026 && today.getMonth() + 1 === m && today.getDate() === d

                      const bg = isCuti ? 'bg-gray-100' : isWknd ? 'bg-amber-50' : ''
                      const numCls = isToday
                        ? 'bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto font-bold'
                        : isWknd ? 'text-orange-500 font-semibold' : ''

                      row.push(
                        <td
                          key={d}
                          className={`${bg} p-0.5 align-top ${isAdmin ? 'cursor-pointer hover:bg-yellow-50' : ''}`}
                          onClick={() => isAdmin && openDay(iso, m, d)}
                        >
                          <div className={numCls}>{d}</div>
                          <div className="flex flex-wrap gap-0.5 mt-0.5">
                            {isPB   && <span className="block w-full bg-green-100 text-green-700 text-[9px] font-bold px-0.5 rounded leading-tight">PB</span>}
                            {isOT   && <span className="block w-full bg-blue-100 text-blue-700 text-[9px] font-bold px-0.5 rounded leading-tight">OT</span>}
                            {isLW   && <span className="block w-full bg-purple-100 text-purple-700 text-[9px] font-bold px-0.5 rounded leading-tight">LW</span>}
                            {isCuti && !isPB && !isOT && !isLW && <span className="block w-full bg-gray-200 text-gray-500 text-[9px] px-0.5 rounded leading-tight">Cuti</span>}
                            {ov && <span title="Override">✏️</span>}
                          </div>
                        </td>
                      )
                      if (row.length === 7) {
                        cells.push(<tr key={d}>{row}</tr>)
                        row = []
                      }
                    }
                    if (row.length > 0) {
                      while (row.length < 7) row.push(<td key={`t${row.length}`} />)
                      cells.push(<tr key="last">{row}</tr>)
                    }
                    return cells
                  })()}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {selected && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-primary text-lg mb-1">✏️ Edit Tarikh</h2>
            <p className="text-gray-400 text-sm mb-4">{selected.date}</p>
            {(['pb','ot','lw','cuti'] as const).map(key => (
              <label key={key} className="flex items-center gap-2 mb-3 cursor-pointer">
                <input type="checkbox" checked={editForm[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4" />
                <span className="text-sm font-medium capitalize">
                  {key === 'pb' && 'PB — Pulang Bermalam'}
                  {key === 'ot' && 'OT — Outing'}
                  {key === 'lw' && 'LW — Lawatan Waris'}
                  {key === 'cuti' && 'Cuti / Tidak Bersekolah'}
                </span>
              </label>
            ))}
            <div className="flex gap-2 mt-4">
              <button onClick={saveOverride} className="btn-primary flex-1">💾 Simpan</button>
              <button onClick={clearOverride} className="btn-secondary flex-1">🔄 Reset</button>
              <button onClick={() => setSelected(null)} className="btn-danger">✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

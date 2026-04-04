import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { FutureActivity } from '../types'

const STATUS_OPTIONS = ['Dirancang','Sedang Berjalan','Selesai','Dibatalkan']

const badgeCls: Record<string, string> = {
  'Dirancang': 'badge-orange', 'Sedang Berjalan': 'badge-blue',
  'Selesai': 'badge-green', 'Dibatalkan': 'badge-red',
}

const EMPTY: Partial<FutureActivity> = { name:'', description:'', date:'', time:'', place:'', participants:'', cost:'', organiser:'KSIB SAA', status:'Dirancang' }

export default function FutureActivitiesPage() {
  const { isAdmin } = useAuth()
  const [activities, setActivities] = useState<FutureActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Partial<FutureActivity>>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('future_activities').select('*').order('sort_order').order('date')
    setActivities(data || [])
    setLoading(false)
  }

  function openNew() { setEditing({ ...EMPTY }); setModal(true) }
  function openEdit(a: FutureActivity) { setEditing({ ...a }); setModal(true) }

  async function save() {
    if (!editing.name?.trim()) return
    setSaving(true)
    if (editing.id) {
      await supabase.from('future_activities').update(editing).eq('id', editing.id)
    } else {
      await supabase.from('future_activities').insert({ ...editing, sort_order: activities.length })
    }
    setSaving(false)
    setModal(false)
    load()
  }

  async function del(id: string) {
    if (!confirm('Padam aktiviti ini?')) return
    await supabase.from('future_activities').delete().eq('id', id)
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Memuatkan...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">🔮 Aktiviti Akan Datang</h1>
          <p className="text-gray-500 text-sm mt-1">{activities.length} aktiviti dirancang</p>
        </div>
        {isAdmin && (
          <button onClick={openNew} className="btn-primary flex items-center gap-1">
            <Plus size={16} /> Tambah
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🔮</div>
          <p>Tiada aktiviti dirancang lagi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map(a => (
            <div key={a.id} className="card border-l-4 border-orange-400">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="font-bold text-gray-800">{a.name}</h2>
                    {a.status && <span className={badgeCls[a.status] || 'badge-gray'}>{a.status}</span>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-0.5 text-sm text-gray-600">
                    {a.date        && <span>📅 {a.date}</span>}
                    {a.time        && <span>⏰ {a.time}</span>}
                    {a.place       && <span>📍 {a.place}</span>}
                    {a.participants && <span>👥 {a.participants}</span>}
                    {a.cost        && <span>💰 {a.cost}</span>}
                    {a.organiser   && <span>🏢 {a.organiser}</span>}
                  </div>
                  {a.description && <p className="text-gray-500 text-sm mt-2">{a.description}</p>}
                </div>
                {isAdmin && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(a)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={15} /></button>
                    <button onClick={() => del(a.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-primary text-lg">{editing.id ? 'Edit Aktiviti' : 'Tambah Aktiviti Akan Datang'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="label">Nama Aktiviti *</label>
                <input className="input" value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Tarikh (boleh teks bebas: "April 2026" atau "2026-04-01")</label>
                <input className="input" value={editing.date || ''} onChange={e => setEditing(p => ({ ...p, date: e.target.value }))} placeholder="cth: April – Oktober 2026" />
              </div>
              <div>
                <label className="label">Masa</label>
                <input className="input" value={editing.time || ''} onChange={e => setEditing(p => ({ ...p, time: e.target.value }))} />
              </div>
              <div>
                <label className="label">Tempat</label>
                <input className="input" value={editing.place || ''} onChange={e => setEditing(p => ({ ...p, place: e.target.value }))} />
              </div>
              <div>
                <label className="label">Peserta</label>
                <input className="input" value={editing.participants || ''} onChange={e => setEditing(p => ({ ...p, participants: e.target.value }))} />
              </div>
              <div>
                <label className="label">Kos</label>
                <input className="input" value={editing.cost || ''} onChange={e => setEditing(p => ({ ...p, cost: e.target.value }))} />
              </div>
              <div>
                <label className="label">Penganjur</label>
                <input className="input" value={editing.organiser || ''} onChange={e => setEditing(p => ({ ...p, organiser: e.target.value }))} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={editing.status || ''} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Penerangan</label>
                <textarea className="input h-20 resize-none" value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={save} className="btn-primary flex-1" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              <button onClick={() => setModal(false)} className="btn-secondary">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

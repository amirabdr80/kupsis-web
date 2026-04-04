import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { PastActivity } from '../types'

const STATUS_OPTIONS = ['Selesai','Sedang Berjalan','Dirancang','Dibatalkan']
const badgeCls: Record<string, string> = {
  'Selesai': 'badge-green', 'Sedang Berjalan': 'badge-blue',
  'Dirancang': 'badge-orange', 'Dibatalkan': 'badge-red',
}
const EMPTY: Partial<PastActivity> = { name:'', description:'', date:'', time:'', place:'', participants:'', cost:'', organiser:'KSIB SAA', status:'Selesai' }

export default function PastActivitiesPage() {
  const { isAdmin } = useAuth()
  const [activities, setActivities] = useState<PastActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Partial<PastActivity>>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('past_activities').select('*').order('date', { ascending: false })
    setActivities(data || [])
    setLoading(false)
  }

  function openNew() { setEditing({ ...EMPTY }); setModal(true) }
  function openEdit(a: PastActivity) { setEditing({ ...a }); setModal(true) }

  async function save() {
    if (!editing.name?.trim()) return
    setSaving(true)
    if (editing.id) {
      await supabase.from('past_activities').update(editing).eq('id', editing.id)
    } else {
      await supabase.from('past_activities').insert({ ...editing, sort_order: activities.length })
    }
    setSaving(false); setModal(false); load()
  }

  async function del(id: string) {
    if (!confirm('Padam aktiviti ini?')) return
    await supabase.from('past_activities').delete().eq('id', id)
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0', color: '#8a6040' }}>Memuatkan aktiviti...</div>

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 24px' }}>
      <div className="section-hero">
        <div style={{ fontSize: '3rem' }}>📋</div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Aktiviti Lepas</h2>
          <p style={{ opacity: 0.85, marginTop: 6, fontSize: '0.9rem' }}>{activities.length} aktiviti direkodkan · Batch Salahuddin Al-Ayubi 2025–2026</p>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <span>📋 Senarai Aktiviti</span>
          {isAdmin && <button className="btn-add" onClick={openNew}>➕ Tambah Aktiviti</button>}
        </div>

        {activities.length === 0 ? (
          <p style={{ color: '#8a6040', textAlign: 'center', padding: '40px 0' }}>Tiada aktiviti direkodkan lagi.</p>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th><th>Nama Aktiviti</th><th>Tarikh</th><th>Tempat</th>
                  <th>Peserta</th><th>Kos</th><th>Status</th>
                  {isAdmin && <th>Tindakan</th>}
                </tr>
              </thead>
              <tbody>
                {activities.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ color: '#8a6040' }}>{i + 1}</td>
                    <td><strong>{a.name}</strong>{a.description && <div style={{ fontSize: '0.8rem', color: '#8a6040' }}>{a.description}</div>}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {a.date ? new Date(a.date + 'T00:00:00').toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      {a.time && <div style={{ fontSize: '0.78rem', color: '#8a6040' }}>{a.time}</div>}
                    </td>
                    <td>{a.place || '—'}</td>
                    <td>{a.participants || '—'}</td>
                    <td>{a.cost || '—'}</td>
                    <td><span className={`badge ${badgeCls[a.status || ''] || 'badge-grey'}`}>{a.status || '—'}</span></td>
                    {isAdmin && (
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn-edit" onClick={() => openEdit(a)}>✏️ Edit</button>
                        <button className="btn-del" onClick={() => del(a.id)}>🗑️</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay open" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#b34700', marginBottom: 18, paddingBottom: 10, borderBottom: '2px solid #fff3e8' }}>
              {editing.id ? 'Edit Aktiviti' : 'Tambah Aktiviti Lepas'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Nama Aktiviti *</label>
                <input className="input" value={editing.name||''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} />
              </div>
              {[
                ['date','Tarikh','date'],['time','Masa','text'],['place','Tempat','text'],
                ['participants','Peserta','text'],['cost','Kos','text'],['organiser','Penganjur','text'],
              ].map(([k, l, t]) => (
                <div key={k}>
                  <label className="label">{l}</label>
                  <input className="input" type={t} value={String((editing as Record<string,unknown>)[k]||'')} onChange={e => setEditing(p => ({ ...p, [k]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="label">Status</label>
                <select className="input" value={editing.status||''} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Penerangan</label>
                <textarea className="input" style={{ minHeight: 60, resize: 'vertical' }} value={editing.description||''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn-cancel" onClick={() => setModal(false)}>Batal</button>
              <button className="btn-save" onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

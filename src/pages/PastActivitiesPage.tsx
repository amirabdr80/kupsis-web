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
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: 'clamp(14px,4vw,28px) clamp(12px,4vw,24px)' }}>
      <div className="section-hero">
        <div style={{ fontSize: 'clamp(1.8rem,6vw,3rem)' }}>📋</div>
        <div>
          <h2 style={{ fontSize: 'clamp(1rem,4vw,1.4rem)', fontWeight: 700 }}>Aktiviti Lepas</h2>
          <p style={{ opacity: 0.85, marginTop: 4, fontSize: 'clamp(0.75rem,3vw,0.9rem)' }}>{activities.length} aktiviti direkodkan · Batch Salahuddin Al-Ayubi 2025–2026</p>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activities.map((a, i) => (
              <div key={a.id} style={{ border: '1px solid #f0d5bc', borderRadius: 10, padding: '12px 14px', background: '#fffaf6', borderLeft: '4px solid #e8671a' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>

                  {/* Poster thumbnail */}
                  {a.poster_url && (
                    <a href={a.poster_url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }} title="Lihat poster">
                      <img
                        src={a.poster_url}
                        alt="Poster"
                        style={{
                          width: 'clamp(50px,12vw,72px)',
                          height: 'clamp(70px,17vw,100px)',
                          objectFit: 'cover',
                          borderRadius: 7,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          border: '2px solid #f0d5bc',
                        }}
                      />
                    </a>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.7rem', color: '#8a6040', fontWeight: 600, background: '#fff3e8', borderRadius: 4, padding: '1px 6px' }}>#{i + 1}</span>
                      <strong style={{ fontSize: 'clamp(0.85rem, 3.5vw, 0.95rem)', color: '#2c1a0e' }}>{a.name}</strong>
                      <span className={`badge ${badgeCls[a.status || ''] || 'badge-grey'}`} style={{ fontSize: '0.68rem' }}>{a.status || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px', fontSize: 'clamp(0.72rem, 2.8vw, 0.8rem)', color: '#6b4c2a' }}>
                      {a.date && <span>📅 {new Date(a.date + 'T00:00:00').toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}{a.time ? ` · ${a.time}` : ''}</span>}
                      {a.place && <span>📍 {a.place}</span>}
                      {a.participants && <span>👥 {a.participants}</span>}
                      {a.cost && <span>💰 {a.cost}</span>}
                      {a.organiser && <span>🏢 {a.organiser}</span>}
                    </div>
                    {a.description && <p style={{ fontSize: '0.78rem', color: '#8a6040', marginTop: 5, lineHeight: 1.4 }}>{a.description}</p>}
                  </div>

                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button className="btn-edit" onClick={() => openEdit(a)}>✏️</button>
                      <button className="btn-del" onClick={() => del(a.id)}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
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

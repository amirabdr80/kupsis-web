import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, X, CalendarDays, ChevronDown, ChevronUp, Upload, ImageOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { FutureActivity } from '../types'

// ─── Status ──────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['Dirancang', 'Sedang Berjalan', 'Selesai', 'Dibatalkan']
const badgeCls: Record<string, string> = {
  'Dirancang': 'badge-orange',
  'Sedang Berjalan': 'badge-blue',
  'Selesai': 'badge-green',
  'Dibatalkan': 'badge-red',
}

// ─── Subject Sections Definition ─────────────────────────────────────────────
interface Section {
  key: string
  emoji: string
  label: string
  borderColor: string
  bgColor: string
  headerBg: string
  champions: string[]
}

const SECTIONS: Section[] = [
  {
    key: 'matematik',
    emoji: '📘',
    label: 'Matematik',
    borderColor: '#1d4ed8',
    bgColor: '#eff6ff',
    headerBg: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    champions: ['Pn. Nur Zuriati Abdullah', 'Pn. Azlindayati Azaharudin'],
  },
  {
    key: 'matematik_tambahan',
    emoji: '📗',
    label: 'Matematik Tambahan',
    borderColor: '#15803d',
    bgColor: '#f0fdf4',
    headerBg: 'linear-gradient(135deg, #15803d, #22c55e)',
    champions: ['Pn. Siti Fatimah Mohd Nasaruddin', 'Dr. Herman Shah Anuar'],
  },
  {
    key: 'biologi',
    emoji: '📙',
    label: 'Biologi',
    borderColor: '#d97706',
    bgColor: '#fffbeb',
    headerBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
    champions: ['Pn. Haryati Timan', 'En. Amir Abd Rahim'],
  },
  {
    key: 'kimia',
    emoji: '📕',
    label: 'Kimia',
    borderColor: '#dc2626',
    bgColor: '#fff1f2',
    headerBg: 'linear-gradient(135deg, #dc2626, #f87171)',
    champions: ['Pn. Sayang Nurshahrizleen Ramlan', 'Pn. Syakimah Abd Ghani'],
  },
  {
    key: 'fizik',
    emoji: '📔',
    label: 'Fizik',
    borderColor: '#0e7490',
    bgColor: '#ecfeff',
    headerBg: 'linear-gradient(135deg, #0e7490, #06b6d4)',
    champions: ['Dr. Salsabila Ahmad', 'En. Azmi Abdul Latip'],
  },
  {
    key: 'peperiksaan',
    emoji: '🎓',
    label: 'Peperiksaan',
    borderColor: '#7c3aed',
    bgColor: '#faf5ff',
    headerBg: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    champions: [],
  },
  {
    key: 'kelas_tambahan',
    emoji: '🏫',
    label: 'Kelas Tambahan Guru KUPSIS',
    borderColor: '#be185d',
    bgColor: '#fdf2f8',
    headerBg: 'linear-gradient(135deg, #be185d, #ec4899)',
    champions: [],
  },
  {
    key: 'general',
    emoji: '📌',
    label: 'General',
    borderColor: '#6b7280',
    bgColor: '#f9fafb',
    headerBg: 'linear-gradient(135deg, #4b5563, #9ca3af)',
    champions: [],
  },
]

const SUBJECT_OPTIONS = SECTIONS.map(s => ({ key: s.key, label: `${s.emoji} ${s.label}` }))

const EMPTY: Partial<FutureActivity> = {
  name: '', description: '', date: '', time: '', place: '',
  participants: '', cost: '', organiser: 'KSIB SAA',
  status: 'Dirancang', subject: 'general',
}

const DAYS_MY = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu']

function getRecurringDates(dayOfWeek: number, from: string, until: string): string[] {
  if (!from || !until) return []
  const dates: string[] = []
  const cur = new Date(from + 'T00:00:00')
  const end = new Date(until + 'T00:00:00')
  while (cur.getDay() !== dayOfWeek) cur.setDate(cur.getDate() + 1)
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 7)
  }
  return dates
}

export default function FutureActivitiesPage() {
  const { isAdmin, canEditSubject } = useAuth()
  const [activities, setActivities] = useState<FutureActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Partial<FutureActivity>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [recur, setRecur] = useState({ enabled: false, day: 6, from: '', until: '' })
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const posterInputRef = useRef<HTMLInputElement>(null)

  async function handlePosterUpload(file: File) {
    if (!file) return
    setUploadingPoster(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `activity-${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('activity-posters')
        .upload(fileName, file, { contentType: file.type, upsert: true })
      if (error) { alert('Upload gagal: ' + error.message); return }
      const { data: { publicUrl } } = supabase.storage.from('activity-posters').getPublicUrl(fileName)
      setEditing(p => ({ ...p, poster_url: publicUrl }))
    } finally {
      setUploadingPoster(false)
    }
  }

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('future_activities')
      .select('*')
      .order('sort_order')
      .order('date')
    setActivities(data || [])
    setLoading(false)
  }

  function openNew(subject = 'general') {
    setEditing({ ...EMPTY, subject })
    setRecur({ enabled: false, day: 6, from: '', until: '' })
    setModal(true)
  }

  function openEdit(a: FutureActivity) {
    setEditing({ ...a })
    setRecur({ enabled: false, day: 6, from: '', until: '' })
    setModal(true)
  }

  async function save() {
    if (!editing.name?.trim()) return
    setSaving(true)
    if (editing.id) {
      // Editing existing — no recurrence
      await supabase.from('future_activities').update(editing).eq('id', editing.id)
    } else if (recur.enabled) {
      // Recurring — insert one record per occurrence
      const dates = getRecurringDates(recur.day, recur.from, recur.until)
      if (dates.length === 0) { alert('Tiada tarikh dijana. Semak semula tarikh mula/akhir.'); setSaving(false); return }
      const base = { ...editing }
      delete base.id
      const records = dates.map((d, i) => ({
        ...base,
        date: d,
        sort_order: activities.length + i,
      }))
      await supabase.from('future_activities').insert(records)
    } else {
      await supabase.from('future_activities').insert({
        ...editing,
        sort_order: activities.length,
      })
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

  function toggleCollapse(key: string) {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Group activities by subject
  function getActivitiesForSection(key: string) {
    return activities.filter(a => (a.subject || 'general') === key)
  }

  const totalCount = activities.length

  if (loading) return (
    <div className="text-center py-20 text-gray-400">Memuatkan...</div>
  )

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(14px,4vw,28px) clamp(12px,4vw,24px)' }}>

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(1.2rem,4vw,1.6rem)', fontWeight: 800, color: '#8a3200', marginBottom: 4 }}>
          🔮 Aktiviti Akan Datang
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
          {totalCount} aktiviti dirancang · Disusun mengikut subjek &amp; champion
        </p>
      </div>

      {/* Sections */}
      {SECTIONS.map(section => {
        const sectionActivities = getActivitiesForSection(section.key)
        const isCollapsed = collapsed[section.key]

        return (
          <div key={section.key} style={{
            marginBottom: 20,
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            border: `1px solid ${section.borderColor}30`,
          }}>
            {/* Section Header */}
            <div
              style={{
                background: section.headerBg,
                padding: 'clamp(10px,3vw,14px) clamp(14px,4vw,20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                cursor: 'pointer',
              }}
              onClick={() => toggleCollapse(section.key)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(0.95rem,3vw,1.1rem)' }}>
                    {section.emoji} {section.label}
                  </span>
                  <span style={{
                    background: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                  }}>
                    {sectionActivities.length} aktiviti
                  </span>
                </div>
                {section.champions.length > 0 && (
                  <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                    {section.champions.map(c => (
                      <span key={c} style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }}>
                        👤 <span style={{ opacity: 0.7, fontWeight: 400 }}>Champion:</span> <span style={{ fontWeight: 600 }}>{c}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {canEditSubject(section.key) && (
                  <button
                    onClick={e => { e.stopPropagation(); openNew(section.key) }}
                    style={{
                      background: 'rgba(255,255,255,0.22)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      color: 'white',
                      borderRadius: 8,
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Plus size={13} /> Tambah
                  </button>
                )}
                <span style={{ color: 'white', opacity: 0.8 }}>
                  {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </span>
              </div>
            </div>

            {/* Section Body */}
            {!isCollapsed && (
              <div style={{ background: section.bgColor, padding: sectionActivities.length === 0 ? '14px 20px' : '12px 16px' }}>
                {sectionActivities.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '8px 0' }}>
                    Tiada aktiviti dirancang lagi untuk bahagian ini.
                    {canEditSubject(section.key) && (
                      <span
                        style={{ color: section.borderColor, cursor: 'pointer', marginLeft: 8, fontWeight: 600 }}
                        onClick={() => openNew(section.key)}
                      >
                        + Tambah sekarang
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sectionActivities.map(a => (
                      <div
                        key={a.id}
                        style={{
                          background: 'white',
                          borderRadius: 10,
                          padding: 'clamp(10px,3vw,14px) clamp(12px,3vw,16px)',
                          borderLeft: `4px solid ${section.borderColor}`,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        {/* Poster Thumbnail */}
                        {a.poster_url && (
                          <a
                            href={a.poster_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ flexShrink: 0, display: 'block' }}
                            title="Lihat poster"
                          >
                            <img
                              src={a.poster_url}
                              alt="Poster"
                              style={{
                                width: 'clamp(54px,14vw,80px)',
                                height: 'clamp(76px,20vw,112px)',
                                objectFit: 'cover',
                                borderRadius: 8,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                border: `2px solid ${section.borderColor}40`,
                              }}
                            />
                          </a>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Name + Status + Calendar link */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, color: '#1f2937', fontSize: 'clamp(0.82rem,2.5vw,0.95rem)' }}>
                              {a.name}
                            </span>
                            {a.status && (
                              <span className={badgeCls[a.status] || 'badge-gray'}>{a.status}</span>
                            )}
                            {a.date && /^\d{4}-\d{2}-\d{2}$/.test(a.date) && (
                              <Link
                                to="/calendar"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', color: '#e8671a', fontWeight: 600, textDecoration: 'none' }}
                                title="Lihat dalam Kalendar"
                              >
                                <CalendarDays size={12} /> Kalendar
                              </Link>
                            )}
                          </div>

                          {/* Detail chips */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', fontSize: 'clamp(0.72rem,2.2vw,0.82rem)', color: '#6b7280' }}>
                            {a.date && <span>📅 {/^\d{4}-\d{2}-\d{2}$/.test(a.date)
                              ? new Date(a.date + 'T00:00:00').toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
                              : a.date}</span>}
                            {a.time        && <span>⏰ {a.time}</span>}
                            {a.place       && <span>📍 {a.place}</span>}
                            {a.participants && <span>👥 {a.participants}</span>}
                            {a.cost        && <span>💰 {a.cost}</span>}
                            {a.organiser   && <span>🏢 {a.organiser}</span>}
                          </div>

                          {a.description && (
                            <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: 6, lineHeight: 1.5 }}>
                              {a.description}
                            </p>
                          )}
                        </div>

                        {canEditSubject(a.subject || 'general') && (
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                            <button
                              onClick={() => openEdit(a)}
                              style={{ padding: '5px 6px', color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6 }}
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => del(a.id)}
                                style={{ padding: '5px 6px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6 }}
                                title="Padam"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* ── Modal ── */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
          onClick={() => setModal(false)}
        >
          <div
            style={{ background: 'white', borderRadius: 16, padding: 'clamp(16px,4vw,24px)', width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, color: '#8a3200', fontSize: '1.05rem' }}>
                {editing.id ? '✏️ Edit Aktiviti' : '➕ Tambah Aktiviti Akan Datang'}
              </h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {/* Subject */}
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Bahagian Subjek</label>
                <select
                  className="input"
                  value={editing.subject || 'general'}
                  onChange={e => setEditing(p => ({ ...p, subject: e.target.value }))}
                >
                  {SUBJECT_OPTIONS.map(o => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Nama Aktiviti *</label>
                <input
                  className="input"
                  value={editing.name || ''}
                  onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                  placeholder="Cth: Kelas Tambahan Matematik"
                />
              </div>

              {/* Date */}
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Tarikh <span style={{ color: '#9ca3af', fontWeight: 400 }}>(pilih tarikh supaya muncul dalam Kalendar)</span></label>
                <input
                  type="date"
                  className="input"
                  value={editing.date || ''}
                  onChange={e => setEditing(p => ({ ...p, date: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">Masa</label>
                <input className="input" value={editing.time || ''} onChange={e => setEditing(p => ({ ...p, time: e.target.value }))} placeholder="cth: 8.00 pagi" />
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
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Penerangan</label>
                <textarea
                  className="input"
                  style={{ height: 80, resize: 'none' }}
                  value={editing.description || ''}
                  onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              {/* ── Poster Upload ── */}
              <div style={{ gridColumn: '1/-1' }}>
                <label className="label">Poster Acara</label>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Preview */}
                  <div style={{
                    width: 80, height: 112, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                    border: '2px dashed #d1d5db', background: '#f9fafb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {editing.poster_url
                      ? <img src={editing.poster_url} alt="Poster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <ImageOff size={28} color="#d1d5db" />
                    }
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      ref={posterInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePosterUpload(f) }}
                    />
                    <button
                      type="button"
                      onClick={() => posterInputRef.current?.click()}
                      disabled={uploadingPoster}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                        background: '#e8671a', color: 'white', border: 'none',
                        fontWeight: 600, fontSize: '0.82rem',
                        opacity: uploadingPoster ? 0.6 : 1,
                      }}
                    >
                      <Upload size={14} />
                      {uploadingPoster ? 'Mengupload...' : editing.poster_url ? 'Tukar Poster' : 'Upload Poster'}
                    </button>
                    {editing.poster_url && (
                      <button
                        type="button"
                        onClick={() => setEditing(p => ({ ...p, poster_url: '' }))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                          background: 'transparent', color: '#ef4444',
                          border: '1px solid #fca5a5', fontWeight: 600, fontSize: '0.8rem',
                        }}
                      >
                        <ImageOff size={13} /> Buang Poster
                      </button>
                    )}
                    <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
                      JPG / PNG · Saiz cadangan: potret (3:4)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Recurring section (new events only) ── */}
            {!editing.id && (
              <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: recur.enabled ? '#fffbeb' : '#f9fafb', border: `1px solid ${recur.enabled ? '#fcd34d' : '#e5e7eb'}`, transition: 'all 0.2s' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={recur.enabled}
                    onChange={e => setRecur(r => ({ ...r, enabled: e.target.checked }))}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#e8671a' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#b34700' }}>🔁 Aktiviti Berulang (Recurring)</span>
                </label>

                {recur.enabled && (
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label className="label">Hari Pengulangan</label>
                      <select
                        className="input"
                        value={recur.day}
                        onChange={e => setRecur(r => ({ ...r, day: Number(e.target.value) }))}
                      >
                        {DAYS_MY.map((d, i) => <option key={i} value={i}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Bermula</label>
                      <input type="date" className="input" value={recur.from} onChange={e => setRecur(r => ({ ...r, from: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Sehingga</label>
                      <input type="date" className="input" value={recur.until} onChange={e => setRecur(r => ({ ...r, until: e.target.value }))} />
                    </div>
                    {recur.from && recur.until && (
                      <div style={{ gridColumn: '1/-1', background: '#fef3c7', borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem', color: '#92400e' }}>
                        📅 Akan mencipta <strong>{getRecurringDates(recur.day, recur.from, recur.until).length}</strong> aktiviti
                        (setiap <strong>{DAYS_MY[recur.day]}</strong> dari {recur.from} hingga {recur.until})
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={save} className="btn-primary" style={{ flex: 1 }} disabled={saving}>
                {saving ? 'Menyimpan...' : recur.enabled ? `Simpan (${getRecurringDates(recur.day, recur.from, recur.until).length} aktiviti)` : 'Simpan'}
              </button>
              <button onClick={() => setModal(false)} className="btn-secondary">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

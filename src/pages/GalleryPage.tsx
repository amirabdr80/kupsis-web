import { useEffect, useState, useRef } from 'react'
import { X, Upload, Trash2, Plus, ChevronLeft, ChevronRight, Pencil, Check } from 'lucide-react'
import { supabase, STORAGE_BUCKET } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { PhotoGroup, Photo } from '../types'

export default function GalleryPage() {
  const { isAdmin } = useAuth()
  const [groups, setGroups] = useState<PhotoGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<{ photos: Photo[]; idx: number } | null>(null)

  // Admin state
  const [newGroupTitle, setNewGroupTitle] = useState('')
  const [newGroupDate, setNewGroupDate] = useState('')
  const [addingGroup, setAddingGroup] = useState(false)
  const [uploadingGroupId, setUploadingGroupId] = useState<string | null>(null)
  const [editingCaption, setEditingCaption] = useState<{ photoId: string; value: string } | null>(null)
  const [editingGroup, setEditingGroup] = useState<{ groupId: string; name: string; date: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadGallery() }, [])

  async function loadGallery() {
    setLoading(true)
    const { data: groupData } = await supabase
      .from('photo_groups')
      .select('*, photos(*)')
      .order('date', { ascending: true, nullsFirst: false })
      .order('sort_order', { ascending: true })
    if (groupData) {
      const sorted = groupData.map(g => ({
        ...g,
        photos: (g.photos || []).sort((a: Photo, b: Photo) => (a.sort_order || 0) - (b.sort_order || 0))
      }))
      setGroups(sorted)
    }
    setLoading(false)
  }

  async function addGroup() {
    if (!newGroupTitle.trim()) return
    const { data } = await supabase.from('photo_groups').insert({
      name: newGroupTitle.trim(),
      date: newGroupDate || null,
      sort_order: groups.length,
    }).select().single()
    if (data) {
      setGroups(prev => [...prev, { ...data, photos: [] }])
      setNewGroupTitle('')
      setNewGroupDate('')
      setAddingGroup(false)
    }
  }

  async function deleteGroup(groupId: string) {
    if (!confirm('Padam kumpulan foto ini dan semua fotonya?')) return
    // Get photos to delete from storage
    const group = groups.find(g => g.id === groupId)
    // storage paths for admin-uploaded photos follow groupId/filename pattern
    if (group?.photos) {
      const paths = group.photos
        .map((ph: Photo) => ph.url)
        .filter((u: string) => u && !u.startsWith('http'))
      if (paths.length) await supabase.storage.from(STORAGE_BUCKET).remove(paths)
    }
    await supabase.from('photo_groups').delete().eq('id', groupId)
    setGroups(prev => prev.filter(g => g.id !== groupId))
  }

  async function uploadPhotos(groupId: string, files: FileList) {
    setUploadingGroupId(groupId)
    const group = groups.find(g => g.id === groupId)
    const existingCount = group?.photos?.length || 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext  = file.name.split('.').pop()
      const path = `${groupId}/${Date.now()}_${i}.${ext}`
      const { error: uploadErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file)
      if (uploadErr) continue
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
      await supabase.from('photos').insert({ group_id: groupId, url: urlData.publicUrl, sort_order: existingCount + i })
    }
    setUploadingGroupId(null)
    loadGallery()
  }

  async function deletePhoto(photoId: string) {
    await supabase.from('photos').delete().eq('id', photoId)
    setGroups(prev => prev.map(g => ({ ...g, photos: (g.photos || []).filter((p: Photo) => p.id !== photoId) })))
  }

  async function saveGroup(groupId: string, name: string, date: string) {
    if (!name.trim()) return
    await supabase.from('photo_groups').update({ name: name.trim(), date: date || null }).eq('id', groupId)
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name: name.trim(), date: date || undefined } : g))
    setEditingGroup(null)
  }

  async function saveCaption(photoId: string, caption: string) {
    await supabase.from('photos').update({ caption: caption.trim() || null }).eq('id', photoId)
    setGroups(prev => prev.map(g => ({
      ...g,
      photos: (g.photos || []).map((p: Photo) => p.id === photoId ? { ...p, caption: caption.trim() || undefined } : p)
    })))
    setEditingCaption(null)
  }

  const openLightbox = (photo: Photo, photos: Photo[]) => {
    setLightbox({ photos, idx: photos.findIndex(p => p.id === photo.id) })
  }
  const nextPhoto = () => {
    if (!lightbox) return
    setLightbox({ ...lightbox, idx: (lightbox.idx + 1) % lightbox.photos.length })
  }
  const prevPhoto = () => {
    if (!lightbox) return
    setLightbox({ ...lightbox, idx: (lightbox.idx - 1 + lightbox.photos.length) % lightbox.photos.length })
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Memuatkan galeri...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">📷 Galeri Foto Aktiviti</h1>
          <p className="text-gray-500 text-sm mt-1">{groups.length} kumpulan foto · Batch Salahuddin Al-Ayubi</p>
        </div>
        {isAdmin && (
          <button onClick={() => setAddingGroup(true)} className="btn-primary flex items-center gap-1">
            <Plus size={16} /> Kumpulan Baru
          </button>
        )}
      </div>

      {/* Add Group Form */}
      {isAdmin && addingGroup && (
        <div className="card mb-6 border-2 border-dashed border-primary/30">
          <h3 className="font-semibold text-primary mb-3">Tambah Kumpulan Foto Baru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="label">Tajuk Kumpulan</label>
              <input className="input" value={newGroupTitle} onChange={e => setNewGroupTitle(e.target.value)} placeholder="cth: Program SULAM bersama UiTM" />
            </div>
            <div>
              <label className="label">Tarikh Acara (pilihan)</label>
              <input className="input" type="date" value={newGroupDate} onChange={e => setNewGroupDate(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addGroup} className="btn-primary">Simpan Kumpulan</button>
            <button onClick={() => setAddingGroup(false)} className="btn-secondary">Batal</button>
          </div>
        </div>
      )}

      {groups.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📷</div>
          <p>Tiada foto lagi. {isAdmin ? 'Klik "Kumpulan Baru" untuk mula menambah foto.' : ''}</p>
        </div>
      )}

      {/* Groups */}
      <div className="space-y-8">
        {groups.map(group => {
          return (
            <div key={group.id} className="card">
              <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
                <div style={{ flex: 1 }}>
                  {/* Editing group title/date */}
                  {isAdmin && editingGroup?.groupId === group.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <input
                        autoFocus
                        value={editingGroup.name}
                        onChange={e => setEditingGroup({ ...editingGroup, name: e.target.value })}
                        onKeyDown={e => { if (e.key === 'Enter') saveGroup(group.id, editingGroup.name, editingGroup.date); if (e.key === 'Escape') setEditingGroup(null) }}
                        placeholder="Tajuk kumpulan..."
                        style={{ fontWeight: 700, fontSize: '1rem', border: '2px solid #f97316', borderRadius: 6, padding: '4px 8px', outline: 'none', color: '#9a3412', width: '100%' }}
                      />
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          type="date"
                          value={editingGroup.date}
                          onChange={e => setEditingGroup({ ...editingGroup, date: e.target.value })}
                          style={{ fontSize: '0.75rem', border: '1px solid #d1d5db', borderRadius: 6, padding: '3px 6px' }}
                        />
                        <button onClick={() => saveGroup(group.id, editingGroup.name, editingGroup.date)} style={{ background: '#16a34a', color: 'white', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Check size={13} /> Simpan
                        </button>
                        <button onClick={() => setEditingGroup(null)} style={{ background: '#6b7280', color: 'white', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem' }}>
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div>
                        <h2 className="font-bold text-primary text-base">{group.name}</h2>
                        {group.date && (
                          <p className="text-gray-400 text-xs mt-0.5">{new Date(group.date + 'T00:00:00').toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        )}
                        <p className="text-gray-400 text-xs">{(group.photos || []).length} foto</p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => setEditingGroup({ groupId: group.id, name: group.name, date: group.date || '' })}
                          title="Edit tajuk"
                          style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '3px 7px', color: '#c2410c', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem' }}
                        >
                          <Pencil size={11} /> Edit
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setUploadingGroupId(group.id); fileRef.current?.click() }}
                      className="btn-secondary flex items-center gap-1 text-xs"
                    >
                      <Upload size={13} />
                      {uploadingGroupId === group.id ? 'Memuat naik...' : 'Tambah Foto'}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files && uploadPhotos(group.id, e.target.files)}
                    />
                    <button onClick={() => deleteGroup(group.id)} className="btn-danger flex items-center gap-1 text-xs">
                      <Trash2 size={13} /> Padam
                    </button>
                  </div>
                )}
              </div>

              {(group.photos || []).length === 0 ? (
                <p className="text-gray-300 text-sm italic">Tiada foto dalam kumpulan ini.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {(group.photos || []).map((ph: Photo) => (
                    <div key={ph.id} className="relative group rounded-lg overflow-hidden bg-gray-100">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={ph.url}
                          alt={ph.caption || ''}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => openLightbox(ph, group.photos || [])}
                          loading="lazy"
                        />
                      </div>
                      {/* Admin controls */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => deletePhoto(ph.id)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={11} />
                          </button>
                          <button
                            onClick={() => setEditingCaption({ photoId: ph.id, value: ph.caption || '' })}
                            className="absolute top-1 left-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Edit caption"
                          >
                            <Pencil size={10} />
                          </button>
                        </>
                      )}
                      {/* Caption display */}
                      {ph.caption && editingCaption?.photoId !== ph.id && (
                        <div style={{ fontSize: '0.65rem', color: '#374151', padding: '3px 5px', background: '#f3f4f6', lineHeight: 1.3 }}>
                          {ph.caption}
                        </div>
                      )}
                      {/* Caption edit inline */}
                      {isAdmin && editingCaption?.photoId === ph.id && (
                        <div style={{ padding: '4px', background: '#eff6ff', display: 'flex', gap: 3, alignItems: 'center' }}>
                          <input
                            autoFocus
                            value={editingCaption.value}
                            onChange={e => setEditingCaption({ ...editingCaption, value: e.target.value })}
                            onKeyDown={e => { if (e.key === 'Enter') saveCaption(ph.id, editingCaption.value); if (e.key === 'Escape') setEditingCaption(null) }}
                            placeholder="Tulis caption..."
                            style={{ fontSize: '0.65rem', flex: 1, border: '1px solid #93c5fd', borderRadius: 4, padding: '2px 4px', outline: 'none' }}
                          />
                          <button onClick={() => saveCaption(ph.id, editingCaption.value)} style={{ background: '#2563eb', color: 'white', borderRadius: 4, padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
                            <Check size={10} />
                          </button>
                          <button onClick={() => setEditingCaption(null)} style={{ background: '#6b7280', color: 'white', borderRadius: 4, padding: '2px 4px', display: 'flex', alignItems: 'center' }}>
                            <X size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (() => {
        const currentPhoto = lightbox.photos[lightbox.idx]
        return (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setLightbox(null)}>
            <button className="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/80" onClick={e => { e.stopPropagation(); prevPhoto() }}>
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <img src={currentPhoto.url} alt={currentPhoto.caption || ''} className="max-h-[82vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" />
              {currentPhoto.caption && (
                <div style={{ marginTop: 12, color: 'white', fontSize: '0.9rem', textAlign: 'center', maxWidth: '80vw', background: 'rgba(0,0,0,0.5)', padding: '6px 16px', borderRadius: 8 }}>
                  {currentPhoto.caption}
                </div>
              )}
            </div>
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/80" onClick={e => { e.stopPropagation(); nextPhoto() }}>
              <ChevronRight size={24} />
            </button>
            <button className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80" onClick={() => setLightbox(null)}>
              <X size={20} />
            </button>
            <div className="absolute bottom-4 text-white/60 text-sm">{lightbox.idx + 1} / {lightbox.photos.length}</div>
          </div>
        )
      })()}
    </div>
  )
}

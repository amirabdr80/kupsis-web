import { useEffect, useState, useRef } from 'react'
import { X, Upload, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase, getPhotoUrl, STORAGE_BUCKET } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { PhotoGroup, Photo } from '../types'

export default function GalleryPage() {
  const { isAdmin } = useAuth()
  const [groups, setGroups] = useState<PhotoGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<{ url: string; idx: number; urls: string[] } | null>(null)

  // Admin state
  const [newGroupTitle, setNewGroupTitle] = useState('')
  const [newGroupDate, setNewGroupDate] = useState('')
  const [addingGroup, setAddingGroup] = useState(false)
  const [uploadingGroupId, setUploadingGroupId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadGallery() }, [])

  async function loadGallery() {
    setLoading(true)
    const { data: groupData } = await supabase
      .from('photo_groups')
      .select('*, photos(*)')
      .order('event_date', { ascending: true, nullsFirst: false })
      .order('sort_order', { ascending: true })
    if (groupData) {
      const withUrls = groupData.map(g => ({
        ...g,
        photos: (g.photos || []).sort((a: Photo, b: Photo) => (a.sort_order || 0) - (b.sort_order || 0)).map((p: Photo) => ({
          ...p,
          url: getPhotoUrl(p.storage_path),
        }))
      }))
      setGroups(withUrls)
    }
    setLoading(false)
  }

  async function addGroup() {
    if (!newGroupTitle.trim()) return
    const { data } = await supabase.from('photo_groups').insert({
      title: newGroupTitle.trim(),
      event_date: newGroupDate || null,
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
    if (group?.photos) {
      for (const ph of group.photos) {
        await supabase.storage.from(STORAGE_BUCKET).remove([ph.storage_path])
      }
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
      await supabase.from('photos').insert({ group_id: groupId, storage_path: path, sort_order: existingCount + i })
    }
    setUploadingGroupId(null)
    loadGallery()
  }

  async function deletePhoto(photoId: string, storagePath: string) {
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
    await supabase.from('photos').delete().eq('id', photoId)
    setGroups(prev => prev.map(g => ({ ...g, photos: (g.photos || []).filter((p: Photo) => p.id !== photoId) })))
  }

  const openLightbox = (url: string, urls: string[]) => {
    setLightbox({ url, idx: urls.indexOf(url), urls })
  }
  const nextPhoto = () => {
    if (!lightbox) return
    const idx = (lightbox.idx + 1) % lightbox.urls.length
    setLightbox({ ...lightbox, url: lightbox.urls[idx], idx })
  }
  const prevPhoto = () => {
    if (!lightbox) return
    const idx = (lightbox.idx - 1 + lightbox.urls.length) % lightbox.urls.length
    setLightbox({ ...lightbox, url: lightbox.urls[idx], idx })
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
          const urls = (group.photos || []).map((p: Photo) => p.url || '')
          return (
            <div key={group.id} className="card">
              <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
                <div>
                  <h2 className="font-bold text-primary text-base">{group.title}</h2>
                  {group.event_date && (
                    <p className="text-gray-400 text-xs mt-0.5">{new Date(group.event_date + 'T00:00:00').toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  )}
                  <p className="text-gray-400 text-xs">{(group.photos || []).length} foto</p>
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
                    <div key={ph.id} className="relative group aspect-square overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={ph.url}
                        alt=""
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={() => openLightbox(ph.url || '', urls)}
                        loading="lazy"
                      />
                      {isAdmin && (
                        <button
                          onClick={() => deletePhoto(ph.id, ph.storage_path)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={11} />
                        </button>
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
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setLightbox(null)}>
          <button className="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/80" onClick={e => { e.stopPropagation(); prevPhoto() }}>
            <ChevronLeft size={24} />
          </button>
          <img src={lightbox.url} alt="" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/80" onClick={e => { e.stopPropagation(); nextPhoto() }}>
            <ChevronRight size={24} />
          </button>
          <button className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80" onClick={() => setLightbox(null)}>
            <X size={20} />
          </button>
          <div className="absolute bottom-4 text-white/60 text-sm">{lightbox.idx + 1} / {lightbox.urls.length}</div>
        </div>
      )}
    </div>
  )
}

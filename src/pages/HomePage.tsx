import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { fmtDate } from '../lib/dateUtils'

function calcCountdown(dateStr: string) {
  const target = new Date(dateStr + 'T00:00:00')
  const now  = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000)  / 60000)
  const seconds = Math.floor((diff % 60000)    / 1000)
  return { days, hours, minutes, seconds, done: false }
}


type Poster = { id: string; title: string | null; image_url: string }

export default function HomePage() {
  const { loggedIn, isAdmin } = useAuth()

  const [spmDate,   setSpmDate]   = useState('2026-11-09')
  const [trialDate, setTrialDate] = useState('2026-07-13')
  const [countdown,      setCountdown] = useState(calcCountdown('2026-11-09'))
  const [trialCountdown, setTrial]     = useState(calcCountdown('2026-07-13'))
  const [stats, setStats] = useState({ past: 0, future: 0, photos: 0, donations: 0, perbelanjaan: 0 })

  // Edit dates modal
  const [editDatesModal, setEditDatesModal] = useState(false)
  const [editSpm,   setEditSpm]   = useState('')
  const [editTrial, setEditTrial] = useState('')
  const [savingDates, setSavingDates] = useState(false)

  // Poster carousel
  const [posters,        setPosters]        = useState<Poster[]>([])
  const [posterIdx,      setPosterIdx]      = useState(0)
  const [uploadingPoster, setUploadingPoster] = useState(false)

  // Load posters
  useEffect(() => {
    async function loadPosters() {
      const { data } = await supabase
        .from('homepage_posters')
        .select('id, title, image_url')
        .eq('is_active', true)
        .order('sort_order')
      if (data) setPosters(data)
    }
    loadPosters()
  }, [])

  // Auto-rotate posters every 5 seconds
  useEffect(() => {
    if (posters.length <= 1) return
    const t = setInterval(() => setPosterIdx(i => (i + 1) % posters.length), 5000)
    return () => clearInterval(t)
  }, [posters.length])

  async function uploadPoster(file: File) {
    setUploadingPoster(true)
    const ext = file.name.split('.').pop()
    const fileName = `homepage-poster-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('activity-posters')
      .upload(fileName, file, { contentType: file.type, upsert: false })
    if (upErr) { alert('Upload gagal: ' + upErr.message); setUploadingPoster(false); return }
    const { data: { publicUrl } } = supabase.storage.from('activity-posters').getPublicUrl(fileName)
    await supabase.from('homepage_posters').insert({
      image_url: publicUrl,
      title: file.name.replace(/\.[^.]+$/, ''),
      is_active: true,
      sort_order: posters.length,
    })
    const { data } = await supabase.from('homepage_posters').select('id, title, image_url').eq('is_active', true).order('sort_order')
    if (data) { setPosters(data); setPosterIdx(data.length - 1) }
    setUploadingPoster(false)
  }

  async function deletePoster(id: string) {
    if (!confirm('Padam poster ini?')) return
    await supabase.from('homepage_posters').delete().eq('id', id)
    setPosters(p => {
      const next = p.filter(x => x.id !== id)
      setPosterIdx(i => Math.min(i, Math.max(0, next.length - 1)))
      return next
    })
  }

  // Load dates from site_settings
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('site_settings').select('key, value')
      if (data) {
        const spm   = data.find((r: {key:string,value:string}) => r.key === 'spm_date')?.value
        const trial = data.find((r: {key:string,value:string}) => r.key === 'trial_date')?.value
        if (spm)   setSpmDate(spm)
        if (trial) setTrialDate(trial)
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(calcCountdown(spmDate))
      setTrial(calcCountdown(trialDate))
    }, 1000)
    setCountdown(calcCountdown(spmDate))
    setTrial(calcCountdown(trialDate))
    return () => clearInterval(t)
  }, [spmDate, trialDate])

  async function saveDates() {
    setSavingDates(true)
    await supabase.from('site_settings').upsert([
      { key: 'spm_date',   value: editSpm },
      { key: 'trial_date', value: editTrial },
    ], { onConflict: 'key' })
    setSpmDate(editSpm)
    setTrialDate(editTrial)
    setSavingDates(false)
    setEditDatesModal(false)
  }

  useEffect(() => {
    async function load() {
      const [past, future, photos, donations] = await Promise.all([
        supabase.from('past_activities').select('id', { count: 'exact', head: true }),
        supabase.from('future_activities').select('id', { count: 'exact', head: true }),
        supabase.from('photo_groups').select('id', { count: 'exact', head: true }),
        supabase.from('donations').select('amount, type, category'),
      ])
      const rows = donations.data || []
      // Match DonationsPage: kutipan_bulanan + infaq masuk only (excludes kutipan_2025 info records, cikgu_alam, lebihan_sumbangan)
      const total = rows
        .filter((d: { amount: number; type?: string; category?: string }) =>
          (d.category === 'kutipan_bulanan' || d.category === 'infaq') && d.type === 'masuk')
        .reduce((s: number, d: { amount: number }) => s + Number(d.amount), 0)
      const belanja = rows
        .filter((d: { amount: number; type?: string; category?: string }) => d.type === 'keluar' && d.category !== 'cikgu_alam')
        .reduce((s: number, d: { amount: number }) => s + Number(d.amount), 0)
      setStats({ past: past.count ?? 0, future: future.count ?? 0, photos: photos.count ?? 0, donations: total, perbelanjaan: belanja })
    }
    load()
  }, [])

  const TARGET_DONATIONS = 100000
  const danaBaki    = stats.donations - stats.perbelanjaan
  const donationPct = Math.min(100, (stats.donations / TARGET_DONATIONS) * 100)
  const fmtRM = (n: number) => 'RM ' + n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: 'clamp(14px, 4vw, 28px) clamp(12px, 4vw, 24px)' }}>

      {/* School hero photo */}
      <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, position: 'relative', height: 'clamp(140px, 40vw, 220px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <img
          src="/sekolah-kupsis.jpg"
          alt="SM Sains Kubang Pasu"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(140,50,0,0.75) 0%, rgba(0,0,0,0.1) 60%)',
          display: 'flex', alignItems: 'center', padding: '0 clamp(16px, 5vw, 32px)'
        }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: 'clamp(1rem, 5vw, 1.5rem)', fontWeight: 800, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              SM Sains Kubang Pasu
            </div>
            <div style={{ fontSize: 'clamp(0.72rem, 3vw, 0.9rem)', opacity: 0.9, marginTop: 4, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              Batch Salahuddin Al-Ayubi · SPM 2026
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', opacity: 0.75, marginTop: 2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              Batu 19, Jalan Kodiang, Jitra, Kedah
            </div>
          </div>
        </div>
      </div>

      {/* Motivational banner */}
      <div className="moti-banner mb-5">
        <blockquote>"Sesungguhnya bersama kesusahan itu ada kemudahan. Maka apabila engkau telah selesai (dari sesuatu urusan), tetaplah bekerja keras."</blockquote>
        <cite>— Al-Inshirah 94:6-7 · Semoga ALLAH permudahkan perjalanan SPM 2026 kita</cite>
      </div>

      {/* ── Poster Carousel ── */}
      {(posters.length > 0 || loggedIn) && (
        <div style={{ marginBottom: 20, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', background: '#1a1a1a' }}>
          {posters.length > 0 ? (
            <>
              {/* Image area */}
              <div style={{ position: 'relative', width: '100%', maxHeight: 520, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#111', overflow: 'hidden' }}>
                <img
                  key={posters[posterIdx]?.id}
                  src={posters[posterIdx]?.image_url}
                  alt={posters[posterIdx]?.title || 'Poster'}
                  style={{ width: '100%', maxHeight: 520, objectFit: 'contain', display: 'block', transition: 'opacity 0.4s ease' }}
                />
                {/* Left arrow */}
                {posters.length > 1 && (
                  <button onClick={() => setPosterIdx(i => (i - 1 + posters.length) % posters.length)}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: 'white', border: 'none', borderRadius: '50%', width: 38, height: 38, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>‹</button>
                )}
                {/* Right arrow */}
                {posters.length > 1 && (
                  <button onClick={() => setPosterIdx(i => (i + 1) % posters.length)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: 'white', border: 'none', borderRadius: '50%', width: 38, height: 38, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>›</button>
                )}
                {/* Dots */}
                {posters.length > 1 && (
                  <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 2 }}>
                    {posters.map((_, i) => (
                      <button key={i} onClick={() => setPosterIdx(i)}
                        style={{ width: i === posterIdx ? 20 : 8, height: 8, borderRadius: 4, border: 'none', background: i === posterIdx ? '#f97316' : 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, transition: 'width 0.3s, background 0.3s' }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Controls bar for logged-in users */}
              {loggedIn && (
                <div style={{ background: 'white', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, borderTop: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                    {posterIdx + 1} / {posters.length} · {posters[posterIdx]?.title || 'Poster'}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => deletePoster(posters[posterIdx].id)}
                      style={{ padding: '4px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                      🗑️ Padam
                    </button>
                    <label style={{ padding: '4px 12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: uploadingPoster ? 'wait' : 'pointer', display: 'inline-block' }}>
                      {uploadingPoster ? '⏳ Mengupload...' : '📤 Tambah Poster'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingPoster}
                        onChange={e => { if (e.target.files?.[0]) uploadPoster(e.target.files[0]) }} />
                    </label>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty state — only visible to logged-in users */
            <div style={{ padding: '28px 20px', background: '#fff7ed', borderRadius: 14, textAlign: 'center', border: '2px dashed #fed7aa' }}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>🖼️</div>
              <div style={{ fontSize: '0.85rem', color: '#9a3412', fontWeight: 600, marginBottom: 4 }}>Tiada poster lagi</div>
              <div style={{ fontSize: '0.75rem', color: '#c2410c', marginBottom: 12 }}>Upload poster pertama untuk dipaparkan di sini</div>
              <label style={{ padding: '8px 20px', background: '#b34700', color: 'white', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: uploadingPoster ? 'wait' : 'pointer', display: 'inline-block' }}>
                {uploadingPoster ? '⏳ Mengupload...' : '📤 Upload Poster'}
                <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingPoster}
                  onChange={e => { if (e.target.files?.[0]) uploadPoster(e.target.files[0]) }} />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Countdowns side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 16 }}>

        {/* SPM Trial Countdown */}
        <div className="card" style={{ borderTop: '4px solid #e8671a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="card-title" style={{ fontSize: 'clamp(0.78rem, 3vw, 0.9rem)', margin: 0 }}>
              <span>📝</span> Percubaan SPM — {fmtDate(trialDate)}
            </div>
            {isAdmin && (
              <button onClick={() => { setEditSpm(spmDate); setEditTrial(trialDate); setEditDatesModal(true) }}
                style={{ background: 'none', border: '1px solid #fed7aa', borderRadius: 6, padding: '3px 8px', fontSize: '0.68rem', color: '#b34700', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                ✏️ Edit Tarikh
              </button>
            )}
          </div>
          {trialCountdown.done ? (
            <div style={{ textAlign: 'center', color: '#1e8449', fontWeight: 700, fontSize: '1rem', padding: '8px 0' }}>✅ Peperiksaan Percubaan Telah Berlangsung</div>
          ) : (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {[{ num: trialCountdown.days, lbl: 'Hari' }, { num: trialCountdown.hours, lbl: 'Jam' }, { num: trialCountdown.minutes, lbl: 'Minit' }, { num: trialCountdown.seconds, lbl: 'Saat' }].map(b => (
                <div key={b.lbl} style={{ background: '#e8671a', color: 'white', borderRadius: 10, padding: 'clamp(8px,2vw,14px) clamp(10px,3vw,18px)', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 'clamp(1.2rem, 5vw, 1.9rem)', fontWeight: 800, lineHeight: 1 }}>{String(b.num).padStart(2, '0')}</div>
                  <div style={{ fontSize: 'clamp(0.58rem, 2vw, 0.68rem)', opacity: 0.85, textTransform: 'uppercase', marginTop: 3 }}>{b.lbl}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#8a6040', marginTop: 8 }}>Angkaan Percubaan SPM · {fmtDate(trialDate)}</div>
        </div>

        {/* SPM Countdown */}
        <div className="card" style={{ borderTop: '4px solid #b34700' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="card-title" style={{ fontSize: 'clamp(0.78rem, 3vw, 0.9rem)', margin: 0 }}>
              <span>⏳</span> SPM 2026 — {fmtDate(spmDate)}
            </div>
            {isAdmin && (
              <button onClick={() => { setEditSpm(spmDate); setEditTrial(trialDate); setEditDatesModal(true) }}
                style={{ background: 'none', border: '1px solid #fed7aa', borderRadius: 6, padding: '3px 8px', fontSize: '0.68rem', color: '#b34700', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                ✏️ Edit Tarikh
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {[{ num: countdown.days, lbl: 'Hari' }, { num: countdown.hours, lbl: 'Jam' }, { num: countdown.minutes, lbl: 'Minit' }, { num: countdown.seconds, lbl: 'Saat' }].map(b => (
              <div key={b.lbl} style={{ background: '#b34700', color: 'white', borderRadius: 10, padding: 'clamp(8px,2vw,14px) clamp(10px,3vw,18px)', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 'clamp(1.2rem, 5vw, 1.9rem)', fontWeight: 800, lineHeight: 1 }}>{String(b.num).padStart(2, '0')}</div>
                <div style={{ fontSize: 'clamp(0.58rem, 2vw, 0.68rem)', opacity: 0.85, textTransform: 'uppercase', marginTop: 3 }}>{b.lbl}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#8a6040', marginTop: 8 }}>SPM 2026 · Batch Salahuddin Al-Ayubi · KUPSIS · {fmtDate(spmDate)}</div>
        </div>
      </div>

      {/* Edit Dates Modal */}
      {editDatesModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
          onClick={() => setEditDatesModal(false)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 380 }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 800, color: '#9a3412', fontSize: '1rem', marginBottom: 16 }}>✏️ Edit Tarikh Peperiksaan</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>📝 Tarikh Percubaan SPM</label>
                <input type="date" value={editTrial} onChange={e => setEditTrial(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>⏳ Tarikh SPM 2026</label>
                <input type="date" value={editSpm} onChange={e => setEditSpm(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button onClick={saveDates} disabled={savingDates}
                style={{ flex: 1, padding: '9px 0', background: '#b34700', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
                {savingDates ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button onClick={() => setEditDatesModal(false)}
                style={{ padding: '9px 16px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stat boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="stat-box">
          <div className="stat-num">{countdown.days}</div>
          <div className="stat-label">⏳ Hari Sebelum SPM</div>
        </div>
        <div className="stat-box green">
          <div className="stat-num">{stats.past}</div>
          <div className="stat-label">✅ Aktiviti Selesai</div>
        </div>
        <div className="stat-box orange">
          <div className="stat-num">{stats.future}</div>
          <div className="stat-label">🔮 Aktiviti Akan Datang</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{stats.photos}</div>
          <div className="stat-label">📷 Album Foto</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>

        {/* Donation progress */}
        <div className="card">
          <div className="card-title"><span className="icon">💚</span> Dana SAA 2026</div>

          {loggedIn ? (
            <>
              {/* 3 stat boxes — all link to Dana SAA page */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 14 }}>
                {[
                  { to: '/donations', bg: '#f0fdf4', bgHover: '#dcfce7', border: '#16a34a', label: '📥 Terkumpul', amount: fmtRM(stats.donations), sub: 'Bulanan + Infaq', color: '#15803d' },
                  { to: '/donations', bg: '#fef2f2', bgHover: '#fee2e2', border: '#dc2626', label: '📤 Belanja',    amount: fmtRM(stats.perbelanjaan), sub: 'Perbelanjaan', color: '#dc2626' },
                  { to: '/donations', bg: danaBaki >= 0 ? '#f0fdf4' : '#fef2f2', bgHover: danaBaki >= 0 ? '#dcfce7' : '#fee2e2', border: danaBaki >= 0 ? '#16a34a' : '#dc2626', label: danaBaki >= 0 ? '💰 Baki' : '⚠️ Defisit', amount: fmtRM(Math.abs(danaBaki)), sub: 'Terkumpul − Belanja', color: danaBaki >= 0 ? '#15803d' : '#dc2626' },
                ].map((item, idx) => (
                  <Link key={idx} to={item.to} style={{ textDecoration: 'none', minWidth: 0 }}>
                    <div style={{
                      background: item.bg, borderRadius: 10,
                      padding: 'clamp(7px, 2vw, 10px) clamp(6px, 2vw, 10px)',
                      borderLeft: `3px solid ${item.border}`, cursor: 'pointer',
                      transition: 'background 0.15s', height: '100%', boxSizing: 'border-box',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = item.bgHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = item.bg)}>
                      <div style={{ fontSize: 'clamp(0.55rem, 2vw, 0.65rem)', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 'clamp(0.72rem, 3.2vw, 1rem)', fontWeight: 800, color: item.color, marginTop: 2, wordBreak: 'break-all', lineHeight: 1.2 }}>
                        {item.amount}
                      </div>
                      <div style={{ fontSize: 'clamp(0.55rem, 1.8vw, 0.65rem)', color: '#9ca3af', marginTop: 2, lineHeight: 1.3 }}>
                        {item.sub}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Progress toward target */}
              <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', marginBottom: 5, color: '#2c1a0e' }}>
                <span style={{ color: '#8a6040' }}>Sasaran kutipan keseluruhan</span>
                <span><strong>{donationPct.toFixed(1)}%</strong> daripada <strong>RM 100,000</strong></span>
              </div>
              <div className="progress-bar"><div className="progress-fill green" style={{ width: `${donationPct}%` }} /></div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '18px 12px', color: '#9ca3af' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>🔒</div>
              <div style={{ fontSize: '0.8rem', color: '#b34700', fontWeight: 600 }}>Log masuk untuk melihat maklumat kewangan</div>
              <Link to="/login" style={{ display: 'inline-block', marginTop: 10, padding: '6px 16px', borderRadius: 8, background: '#b34700', color: '#fff', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>Log Masuk →</Link>
            </div>
          )}

          <Link to="/donations" className="btn-add mt-4 text-xs" style={{ display: 'inline-flex' }}>Lihat Dana SAA →</Link>
        </div>

        {/* Quick links */}
        <div className="card">
          <div className="card-title"><span className="icon">🔗</span> Navigasi Pantas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { to: '/calendar',   label: '📅 Kalendar PB / OT / LW 2026' },
              { to: '/activities', label: '📋 Senarai Aktiviti Lepas' },
              { to: '/upcoming',   label: '🔮 Aktiviti Akan Datang' },
              { to: '/gallery',    label: '📷 Galeri Foto Aktiviti' },
              { to: '/donations',  label: '💚 Dana SAA' },
            ].map(l => (
              <Link key={l.to} to={l.to}
                style={{ display: 'block', padding: '8px 14px', borderRadius: 8, background: '#fff3e8', color: '#b34700', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#ffe5c8')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff3e8')}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Info + Batch Photo */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title"><span className="icon">ℹ️</span> Maklumat Batch</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              ['Nama Batch', 'Salahuddin Al-Ayubi'],
              ['Tahun Peperiksaan', 'SPM 2026'],
              ['Sekolah', 'SM Sains Kubang Pasu (KUPSIS)'],
              ['Lokasi', 'Batu 19, Jalan Kodiang, Jitra, Kedah'],
              ['Badan Ibu Bapa', 'KSIB (Kelab Sokongan Ibu Bapa)'],
              ['Tarikh SPM', '9 November 2026'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', gap: 6, fontSize: 'clamp(0.78rem, 3vw, 0.9rem)', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#b34700', minWidth: 'clamp(110px, 30vw, 160px)', flexShrink: 0 }}>{label}:</span>
                <span style={{ color: '#2c1a0e', flex: 1, minWidth: 0 }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', position: 'relative' }}>
            <img
              src="/batch-saa-2026.jpg"
              alt="Batch Salahuddin Al-Ayyubi 2026"
              style={{ width: '100%', display: 'block', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(100,30,0,0.85) 0%, transparent 100%)',
              padding: '16px 12px 10px',
              color: 'white', textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: 0.5 }}>Salahuddin Al-Ayyubi Generation</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.85, marginTop: 2 }}>WE ARE UNSTOPPABLE · WE RISE FOR EXCELLENCE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

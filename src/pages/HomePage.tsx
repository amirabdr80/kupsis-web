import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SPM_DATE   = new Date('2026-11-09T00:00:00')
const TRIAL_DATE = new Date('2026-07-13T00:00:00')   // SPM Trial – mid July 2026 (est.)

function calcCountdown(target: Date) {
  const now  = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000)  / 60000)
  const seconds = Math.floor((diff % 60000)    / 1000)
  return { days, hours, minutes, seconds, done: false }
}

function getCountdown() { return calcCountdown(SPM_DATE) }
function getTrialCountdown() { return calcCountdown(TRIAL_DATE) }

export default function HomePage() {
  const [countdown, setCountdown]      = useState(getCountdown())
  const [trialCountdown, setTrial]     = useState(getTrialCountdown())
  const [stats, setStats] = useState({ past: 0, future: 0, photos: 0, donations: 0, perbelanjaan: 0 })

  useEffect(() => {
    const t = setInterval(() => { setCountdown(getCountdown()); setTrial(getTrialCountdown()) }, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function load() {
      const [past, future, photos, donations] = await Promise.all([
        supabase.from('past_activities').select('id', { count: 'exact', head: true }),
        supabase.from('future_activities').select('id', { count: 'exact', head: true }),
        supabase.from('photo_groups').select('id', { count: 'exact', head: true }),
        supabase.from('donations').select('amount, type'),
      ])
      const rows = donations.data || []
      const total = rows
        .filter((d: { amount: number; type?: string }) => d.type !== 'keluar')
        .reduce((s: number, d: { amount: number }) => s + Number(d.amount), 0)
      const belanja = rows
        .filter((d: { amount: number; type?: string }) => d.type === 'keluar')
        .reduce((s: number, d: { amount: number }) => s + Number(d.amount), 0)
      setStats({ past: past.count ?? 0, future: future.count ?? 0, photos: photos.count ?? 0, donations: total, perbelanjaan: belanja })
    }
    load()
  }, [])

  const TARGET_DONATIONS = 100000
  const danaBaki    = stats.donations - stats.perbelanjaan
  const donationPct = Math.min(100, (stats.donations / TARGET_DONATIONS) * 100)
  const fmtRM = (n: number) => 'RM ' + n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const countdownBoxes = [
    { num: countdown.days,    lbl: 'Hari' },
    { num: countdown.hours,   lbl: 'Jam' },
    { num: countdown.minutes, lbl: 'Minit' },
    { num: countdown.seconds, lbl: 'Saat' },
  ]

  const trialBoxes = [
    { num: trialCountdown.days,    lbl: 'Hari' },
    { num: trialCountdown.hours,   lbl: 'Jam' },
    { num: trialCountdown.minutes, lbl: 'Minit' },
    { num: trialCountdown.seconds, lbl: 'Saat' },
  ]

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 24px' }}>

      {/* Motivational banner */}
      <div className="moti-banner mb-5">
        <blockquote>"Sesungguhnya bersama kesusahan itu ada kemudahan. Maka apabila engkau telah selesai (dari sesuatu urusan), tetaplah bekerja keras."</blockquote>
        <cite>— Al-Inshirah 94:5-7 · Semoga ALLAH permudahkan perjalanan SPM 2026 kita</cite>
      </div>

      {/* Countdowns side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>

        {/* SPM Trial Countdown */}
        <div className="card" style={{ borderTop: '4px solid #e8671a' }}>
          <div className="card-title"><span className="icon">📝</span> Kiraan Masa ke Peperiksaan Percubaan SPM — Julai 2026</div>
          {trialCountdown.done ? (
            <div style={{ textAlign: 'center', color: '#1e8449', fontWeight: 700, fontSize: '1.1rem', padding: '12px 0' }}>✅ Peperiksaan Percubaan Telah Berlangsung</div>
          ) : (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {trialBoxes.map(b => (
                <div key={b.lbl} style={{ background: '#e8671a', color: 'white', borderRadius: 12, padding: '14px 18px', textAlign: 'center', minWidth: 70 }}>
                  <div style={{ fontSize: '1.9rem', fontWeight: 800 }}>{String(b.num).padStart(2, '0')}</div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>{b.lbl}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#8a6040', marginTop: 10 }}>Angkaan Percubaan SPM · Julai 2026</div>
        </div>

        {/* SPM Countdown */}
        <div className="card" style={{ borderTop: '4px solid #b34700' }}>
          <div className="card-title"><span className="icon">⏳</span> Kiraan Masa ke SPM 2026 — 9 November 2026</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {countdownBoxes.map(b => (
              <div key={b.lbl} style={{ background: '#b34700', color: 'white', borderRadius: 12, padding: '14px 18px', textAlign: 'center', minWidth: 70 }}>
                <div style={{ fontSize: '1.9rem', fontWeight: 800 }}>{String(b.num).padStart(2, '0')}</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>{b.lbl}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#8a6040', marginTop: 10 }}>SPM 2026 · Batch Salahuddin Al-Ayubi · KUPSIS</div>
        </div>
      </div>

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
        <div className="stat-box green">
          <div className="stat-num" style={{ fontSize: '1.4rem' }}>RM {stats.donations.toFixed(0)}</div>
          <div className="stat-label">💚 Dana SAA Terkumpul</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>

        {/* Donation progress */}
        <div className="card">
          <div className="card-title"><span className="icon">💚</span> Dana SAA 2026</div>

          {/* 3 stat boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 12px', borderLeft: '3px solid #16a34a' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>📥 Terkumpul</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#15803d', marginTop: 3 }}>{fmtRM(stats.donations)}</div>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: 1 }}>Kutipan Bulanan + Infaq</div>
            </div>
            <div style={{ background: '#fef2f2', borderRadius: 10, padding: '10px 12px', borderLeft: '3px solid #dc2626' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>📤 Perbelanjaan</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626', marginTop: 3 }}>{fmtRM(stats.perbelanjaan)}</div>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: 1 }}>Hadiah, tuition, lain-lain</div>
            </div>
            <div style={{
              background: danaBaki >= 0 ? '#f0fdf4' : '#fef2f2',
              borderRadius: 10, padding: '10px 12px',
              borderLeft: `3px solid ${danaBaki >= 0 ? '#16a34a' : '#dc2626'}`,
            }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {danaBaki >= 0 ? '💰 Baki' : '⚠️ Defisit'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: danaBaki >= 0 ? '#15803d' : '#dc2626', marginTop: 3 }}>
                {fmtRM(Math.abs(danaBaki))}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: 1 }}>Terkumpul − Perbelanjaan</div>
            </div>
          </div>

          {/* Progress toward target */}
          <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', marginBottom: 5, color: '#2c1a0e' }}>
            <span style={{ color: '#8a6040' }}>Sasaran kutipan keseluruhan</span>
            <span><strong>{donationPct.toFixed(1)}%</strong> daripada <strong>RM 100,000</strong></span>
          </div>
          <div className="progress-bar"><div className="progress-fill green" style={{ width: `${donationPct}%` }} /></div>

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

      {/* Info */}
      <div className="card">
        <div className="card-title"><span className="icon">ℹ️</span> Maklumat Batch</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8 }}>
          {[
            ['Nama Batch', 'Salahuddin Al-Ayubi'],
            ['Tahun Peperiksaan', 'SPM 2026'],
            ['Sekolah', 'SM Sains Kubang Pasu (KUPSIS)'],
            ['Lokasi', 'Batu 19, Jalan Kodiang, Jitra, Kedah'],
            ['Badan Ibu Bapa', 'KSIB (Kelab Sokongan Ibu Bapa)'],
            ['Tarikh SPM', '9 November 2026'],
          ].map(([label, val]) => (
            <div key={label} className="info-row" style={{ display: 'flex', gap: 8, fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 600, color: '#b34700', minWidth: 160, flexShrink: 0 }}>{label}:</span>
              <span style={{ color: '#2c1a0e' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

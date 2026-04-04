import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SPM_DATE = new Date('2026-11-09T00:00:00')

function getCountdown() {
  const now  = new Date()
  const diff = SPM_DATE.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000)  / 60000)
  const seconds = Math.floor((diff % 60000)    / 1000)
  return { days, hours, minutes, seconds }
}

export default function HomePage() {
  const [countdown, setCountdown] = useState(getCountdown())
  const [stats, setStats] = useState({ past: 0, future: 0, photos: 0, donations: 0 })

  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function load() {
      const [past, future, photos, donations] = await Promise.all([
        supabase.from('past_activities').select('id', { count: 'exact', head: true }),
        supabase.from('future_activities').select('id', { count: 'exact', head: true }),
        supabase.from('photo_groups').select('id', { count: 'exact', head: true }),
        supabase.from('donations').select('amount'),
      ])
      const total = (donations.data || []).reduce((s: number, d: { amount: number }) => s + Number(d.amount), 0)
      setStats({ past: past.count ?? 0, future: future.count ?? 0, photos: photos.count ?? 0, donations: total })
    }
    load()
  }, [])

  const TARGET_DONATIONS = 5000
  const donationPct = Math.min(100, (stats.donations / TARGET_DONATIONS) * 100)

  const countdownBoxes = [
    { num: countdown.days,    lbl: 'Hari' },
    { num: countdown.hours,   lbl: 'Jam' },
    { num: countdown.minutes, lbl: 'Minit' },
    { num: countdown.seconds, lbl: 'Saat' },
  ]

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 24px' }}>

      {/* Motivational banner */}
      <div className="moti-banner mb-5">
        <blockquote>"Sesungguhnya bersama kesusahan itu ada kemudahan. Maka apabila engkau telah selesai (dari sesuatu urusan), tetaplah bekerja keras."</blockquote>
        <cite>— Al-Inshirah 94:5-7 · Semoga ALLAH permudahkan perjalanan SPM 2026 kita</cite>
      </div>

      {/* Countdown */}
      <div className="card mb-5">
        <div className="card-title"><span className="icon">⏳</span> Kiraan Masa ke SPM 2026 — 9 November 2026</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {countdownBoxes.map(b => (
            <div key={b.lbl} style={{ background: '#b34700', color: 'white', borderRadius: 12, padding: '16px 22px', textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{String(b.num).padStart(2, '0')}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.75, textTransform: 'uppercase', letterSpacing: 1 }}>{b.lbl}</div>
            </div>
          ))}
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
          <div className="stat-label">💚 Tabung Infaq Terkumpul</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>

        {/* Donation progress */}
        <div className="card">
          <div className="card-title"><span className="icon">💚</span> Tabung Infaq SAA 2026</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4, color: '#2c1a0e' }}>
            <span>Terkumpul: <strong>RM {stats.donations.toFixed(2)}</strong></span>
            <span>Sasaran: <strong>RM {TARGET_DONATIONS.toLocaleString()}</strong></span>
          </div>
          <div className="progress-bar"><div className="progress-fill green" style={{ width: `${donationPct}%` }} /></div>
          <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#8a6040', marginTop: 4 }}>{donationPct.toFixed(1)}% daripada sasaran</div>
          <Link to="/donations" className="btn-add mt-4 text-xs" style={{ display: 'inline-flex' }}>Lihat Rekod Derma →</Link>
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
              { to: '/donations',  label: '💚 Tabung Infaq SAA 2026' },
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

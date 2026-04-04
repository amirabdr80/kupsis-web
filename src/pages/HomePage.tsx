import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Stats {
  pastCount: number
  futureCount: number
  photoGroupCount: number
  totalDonations: number
  daysToSpm: number
}

const SPM_DATE = new Date('2026-11-09')

import { supabase } from '../lib/supabase'

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    pastCount: 0, futureCount: 0, photoGroupCount: 0, totalDonations: 0,
    daysToSpm: Math.ceil((SPM_DATE.getTime() - Date.now()) / 86400000),
  })

  useEffect(() => {
    async function load() {
      const [past, future, groups, donations] = await Promise.all([
        supabase.from('past_activities').select('id', { count: 'exact', head: true }),
        supabase.from('future_activities').select('id', { count: 'exact', head: true }),
        supabase.from('photo_groups').select('id', { count: 'exact', head: true }),
        supabase.from('donations').select('amount'),
      ])
      const total = (donations.data || []).reduce((s, d) => s + Number(d.amount), 0)
      setStats(prev => ({
        ...prev,
        pastCount:       past.count    ?? 0,
        futureCount:     future.count  ?? 0,
        photoGroupCount: groups.count  ?? 0,
        totalDonations:  total,
      }))
    }
    load()
  }, [])

  const statCards = [
    { value: stats.daysToSpm, label: 'Hari Sebelum SPM', sub: '9 November 2026', color: 'border-t-red-500',    icon: '⏳' },
    { value: stats.pastCount,       label: 'Aktiviti Selesai',     sub: 'Sepanjang 2025–2026', color: 'border-t-green-500',  icon: '✅' },
    { value: stats.futureCount,     label: 'Aktiviti Akan Datang', sub: 'Dirancang',            color: 'border-t-orange-500', icon: '🔮' },
    { value: stats.photoGroupCount, label: 'Album Foto',           sub: 'Galeri aktiviti',      color: 'border-t-secondary',  icon: '📷' },
    { value: `RM ${stats.totalDonations.toFixed(2)}`, label: 'Tabung Infaq', sub: 'Terkumpul', color: 'border-t-primary',   icon: '💚' },
  ]

  const quickLinks = [
    { to: '/calendar',   label: '📅 Kalendar PB/OT/LW' },
    { to: '/activities', label: '📋 Aktiviti Lepas' },
    { to: '/upcoming',   label: '🔮 Akan Datang' },
    { to: '/gallery',    label: '📷 Galeri Foto' },
    { to: '/donations',  label: '💚 Tabung Infaq' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Hero banner */}
      <div className="rounded-xl text-white p-7 mb-8 shadow-lg" style={{ background: 'linear-gradient(135deg, #8a3200 0%, #e8671a 60%, #f5a623 100%)' }}>
        <div className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">KUPSIS · F5 Salahuddin Al-Ayubi · KSIB</div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-1">🎓 Road to SPM 2026</h1>
        <p className="text-white/80 text-sm max-w-xl">
          Dashboard pemantauan aktiviti, kalendar persekolahan, galeri foto dan tabung infaq pelajar Batch Salahuddin Al-Ayubi.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((c, i) => (
          <div key={i} className={`card border-t-4 ${c.color} text-center`}>
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-2xl font-extrabold text-primary">{c.value}</div>
            <div className="text-xs font-bold text-gray-700 mt-1">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="card mb-8">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
          🔗 Navigasi Pantas
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map(l => (
            <Link key={l.to} to={l.to} className="btn-primary">{l.label}</Link>
          ))}
        </div>
      </div>

      {/* Motivation */}
      <div className="rounded-xl p-6 text-center border-2 border-accent bg-light">
        <div className="text-3xl mb-2">💪</div>
        <p className="font-bold text-lg text-primary">"Berusaha, Berdoa, Bertawakkal"</p>
        <p className="text-gray-500 text-sm mt-1">Semoga cemerlang dalam SPM 2026 — Batch Salahuddin Al-Ayubi</p>
      </div>
    </div>
  )
}

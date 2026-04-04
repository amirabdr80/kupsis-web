import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, BookOpen, Image, TrendingUp, Clock, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Stats {
  pastCount: number
  futureCount: number
  photoGroupCount: number
  totalDonations: number
  daysToSpm: number
}

const SPM_DATE = new Date('2026-11-09')

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

  const cards = [
    { icon: <Clock size={28} className="text-red-500" />, value: stats.daysToSpm, label: 'Hari Sebelum SPM', sub: '9 November 2026', bg: 'border-red-200' },
    { icon: <BookOpen size={28} className="text-blue-500" />, value: stats.pastCount, label: 'Aktiviti Selesai', sub: 'Sepanjang 2025–2026', bg: 'border-blue-200' },
    { icon: <CalendarDays size={28} className="text-orange-500" />, value: stats.futureCount, label: 'Aktiviti Akan Datang', sub: 'Dirancang', bg: 'border-orange-200' },
    { icon: <Image size={28} className="text-green-500" />, value: stats.photoGroupCount, label: 'Album Foto', sub: 'Galeri aktiviti', bg: 'border-green-200' },
    { icon: <TrendingUp size={28} className="text-purple-500" />, value: `RM ${stats.totalDonations.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}`, label: 'Tabung Infaq', sub: 'Terkumpul', bg: 'border-purple-200' },
  ]

  const quickLinks = [
    { to: '/calendar',   label: '📅 Kalendar PB/OT/LW' },
    { to: '/activities', label: '📋 Aktiviti Lepas' },
    { to: '/upcoming',   label: '🔮 Aktiviti Akan Datang' },
    { to: '/gallery',    label: '📷 Galeri Foto' },
    { to: '/donations',  label: '💚 Tabung Infaq' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
          KUPSIS · F5 Salahuddin Al-Ayubi
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">🎓 Road to SPM 2026</h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Dashboard pemantauan KSIB — aktiviti, kalendar persekolahan, galeri foto dan tabung infaq pelajar Batch Salahuddin Al-Ayubi.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {cards.map((c, i) => (
          <div key={i} className={`card border-2 ${c.bg} text-center`}>
            <div className="flex justify-center mb-2">{c.icon}</div>
            <div className="text-2xl font-bold text-gray-800">{c.value}</div>
            <div className="text-xs font-semibold text-gray-700 mt-1">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="card mb-8">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
          <Users size={16} /> Navigasi Pantas
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map(l => (
            <Link key={l.to} to={l.to} className="btn-secondary">{l.label}</Link>
          ))}
        </div>
      </div>

      {/* Motivational banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-secondary text-white p-6 text-center">
        <div className="text-2xl mb-1">💪</div>
        <p className="font-bold text-lg">"Berusaha, Berdoa, Bertawakkal"</p>
        <p className="text-white/70 text-sm mt-1">Semoga cemerlang dalam SPM 2026 — Batch Salahuddin Al-Ayubi</p>
      </div>
    </div>
  )
}

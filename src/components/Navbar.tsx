import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const tabs = [
  { to: '/',           label: '🏠 Utama' },
  { to: '/calendar',   label: '📅 Kalendar PB/OT/LW' },
  { to: '/activities', label: '📋 Aktiviti Lepas' },
  { to: '/upcoming',   label: '🔮 Aktiviti Akan Datang' },
  { to: '/gallery',    label: '📷 Galeri Foto' },
  { to: '/donations',  label: '💚 Dana SAA' },
]


export default function Navbar() {
  const { isAdmin, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => { await signOut(); navigate('/') }

  return (
    <header style={{ background: 'linear-gradient(135deg, #8a3200 0%, #e8671a 60%, #f5a623 100%)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} className="sticky top-0 z-50">

      {/* Top bar: logo + school name + SPM badge */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/15">
        <div className="flex items-center gap-4">
          <div style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>
            <img src="/logo-kupsis.png" alt="Logo KUPSIS" width="75" height="75" style={{ objectFit: 'contain' }} />
          </div>
          <div className="text-white">
            <div className="font-bold text-base leading-tight">SM Sains Kubang Pasu — Batch Salahuddin Al-Ayubi</div>
            <div className="text-white/80 text-xs mt-0.5">Sekolah Menengah Sains Kubang Pasu (KUPSIS) &nbsp;|&nbsp; Batu 19, Jalan Kodiang, Jitra, Kedah &nbsp;|&nbsp; SPM 2026</div>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <div style={{ background: '#f5a623' }} className="text-white font-bold px-5 py-2 rounded-full text-center shadow-md">
              SPM 2026
              <span className="block text-xs font-normal opacity-80">Countdown Aktif ⏳</span>
            </div>
            {isAdmin ? (
              <button onClick={handleSignOut} className="text-white/70 hover:text-white text-xs border border-white/30 px-3 py-1 rounded-full">
                🔒 Log Keluar
              </button>
            ) : (
              <Link to="/login" className="text-white/70 hover:text-white text-xs border border-white/30 px-3 py-1 rounded-full">
                🔑 Admin
              </Link>
            )}
          </div>
        </div>
        {/* Mobile hamburger */}
        <button className="md:hidden text-white text-2xl" onClick={() => setMobileOpen(o => !o)}>☰</button>
      </div>

      {/* Tab navigation */}
      <nav className="flex overflow-x-auto px-6 gap-1" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `px-5 py-3 text-sm font-medium whitespace-nowrap border-b-4 transition-all cursor-pointer ` +
              (isActive
                ? 'text-white font-bold border-accent'
                : 'text-white/75 border-transparent hover:text-white hover:border-white/40')
            }
          >
            {t.label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `px-5 py-3 text-sm font-medium whitespace-nowrap border-b-4 transition-all cursor-pointer ` +
              (isActive ? 'text-white font-bold border-accent' : 'text-white/75 border-transparent hover:text-white hover:border-white/40')
            }
          >
            ⚙️ Admin
          </NavLink>
        )}
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden flex flex-col px-4 pb-3 gap-2" style={{ background: 'rgba(0,0,0,0.2)' }}>
          {tabs.map(t => (
            <NavLink key={t.to} to={t.to} end={t.to === '/'} className="text-white/80 text-sm py-1" onClick={() => setMobileOpen(false)}>
              {t.label}
            </NavLink>
          ))}
          {isAdmin
            ? <button onClick={handleSignOut} className="text-white/70 text-sm text-left">🔒 Log Keluar</button>
            : <Link to="/login" className="text-white/70 text-sm" onClick={() => setMobileOpen(false)}>🔑 Log Masuk Admin</Link>
          }
        </div>
      )}
    </header>
  )
}

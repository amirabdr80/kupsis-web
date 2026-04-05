import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const tabs = [
  { to: '/',           label: '🏠 Utama' },
  { to: '/calendar',   label: '📅 Kalendar PB/OT/LW' },
  { to: '/activities', label: '📋 Aktiviti Lepas' },
  { to: '/upcoming',   label: '🔮 Akan Datang' },
  { to: '/gallery',    label: '📷 Galeri Foto' },
  { to: '/donations',  label: '💚 Dana SAA' },
]

function KupsisLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 145" width="60" height="73">
      <defs>
        <clipPath id="shield-clip">
          <path d="M60 3 L112 22 L112 85 Q112 130 60 145 Q8 130 8 85 L8 22 Z"/>
        </clipPath>
      </defs>
      <path d="M60 3 L112 22 L112 85 Q112 130 60 145 Q8 130 8 85 L8 22 Z" fill="#E8671A"/>
      <g clipPath="url(#shield-clip)">
        {[20,36,52,68,84,100].map(x => (
          <rect key={x} x={x} y="0" width="8" height="150" fill="white" opacity="0.35"/>
        ))}
      </g>
      <path d="M60 3 L112 22 L112 85 Q112 130 60 145 Q8 130 8 85 L8 22 Z" fill="none" stroke="white" strokeWidth="2.5" opacity="0.6"/>
      <path d="M18 26 Q60 14 102 26 L98 36 Q60 24 22 36 Z" fill="#e8c44a"/>
      <text x="60" y="33" textAnchor="middle" fontSize="6.2" fill="#5a3a00" fontFamily="serif" fontWeight="bold" letterSpacing="0.5">KREATIF • SUKSES • PRODUKTIF</text>
      <circle cx="60" cy="82" r="30" fill="white"/>
      <polygon points="60,56 64,70 60,68 56,70" fill="#e74c3c"/>
      <polygon points="60,56 73,65 70,68 68,65" fill="#e91e8c"/>
      <polygon points="73,65 83,75 80,78 77,75" fill="#3498db"/>
      <polygon points="83,82 83,95 79,93 79,90" fill="#27ae60"/>
      <polygon points="72,100 60,108 60,104 63,100" fill="#f1c40f"/>
      <polygon points="48,100 38,93 41,90 44,95" fill="#e8671a"/>
      <polygon points="37,82 37,70 41,72 42,76" fill="#9b59b6"/>
      <polygon points="47,65 60,56 60,60 57,65" fill="#1abc9c"/>
      <rect x="52" y="76" width="16" height="12" rx="1" fill="#7d4e24"/>
      <rect x="52" y="76" width="8" height="12" rx="1" fill="#a0622b"/>
      <line x1="60" y1="76" x2="60" y2="88" stroke="white" strokeWidth="1"/>
      <path d="M18 112 Q22 108 28 110 L92 110 Q98 108 102 112 Q98 118 92 116 L28 116 Q22 118 18 112 Z" fill="#f5c518"/>
      <text x="60" y="115.5" textAnchor="middle" fontSize="6" fill="#3a2400" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.3">SM SAINS KUBANG PASU</text>
    </svg>
  )
}

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
            <KupsisLogo />
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

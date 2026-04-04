import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/',           label: '🏠 Utama' },
  { to: '/calendar',   label: '📅 Kalendar' },
  { to: '/activities', label: '📋 Aktiviti Lepas' },
  { to: '/upcoming',   label: '🔮 Akan Datang' },
  { to: '/gallery',    label: '📷 Galeri Foto' },
  { to: '/donations',  label: '💚 Tabung Infaq' },
]

export default function Navbar() {
  const { isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors whitespace-nowrap ${isActive ? 'text-white font-bold border-b-2 border-white' : 'text-white/80 hover:text-white'}`

  return (
    <nav className="sticky top-0 z-50 shadow-lg" style={{ background: 'linear-gradient(135deg, #8a3200 0%, #e8671a 60%, #f5a623 100%)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-white font-extrabold text-lg leading-none tracking-tight">KUPSIS</span>
            <span className="text-white/70 text-xs hidden sm:block">Road to SPM 2026</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-5">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} className={navCls} end={l.to === '/'}>
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Admin / Login */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {isAdmin ? (
              <>
                <Link to="/admin" className="flex items-center gap-1 text-white text-sm font-semibold bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
                  <ShieldCheck size={14} /> Admin
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors">
                  <LogOut size={14} /> Keluar
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors">
                <ShieldCheck size={14} /> Log Masuk
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden text-white p-1" onClick={() => setOpen(o => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-white/20 px-4 pb-4 flex flex-col gap-3 pt-3" style={{ background: 'rgba(0,0,0,0.15)' }}>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={navCls} end={l.to === '/'} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {isAdmin ? (
            <>
              <Link to="/admin" className="text-white font-semibold text-sm flex items-center gap-1" onClick={() => setOpen(false)}>
                <ShieldCheck size={14} /> Admin Panel
              </Link>
              <button onClick={handleSignOut} className="text-white/80 text-sm text-left flex items-center gap-1">
                <LogOut size={14} /> Log Keluar
              </button>
            </>
          ) : (
            <Link to="/login" className="text-white/80 text-sm flex items-center gap-1" onClick={() => setOpen(false)}>
              <ShieldCheck size={14} /> Log Masuk Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

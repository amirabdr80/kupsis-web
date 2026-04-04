import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/',           label: 'Utama' },
  { to: '/calendar',   label: 'Kalendar' },
  { to: '/activities', label: 'Aktiviti Lepas' },
  { to: '/upcoming',   label: 'Akan Datang' },
  { to: '/gallery',    label: 'Galeri Foto' },
  { to: '/donations',  label: 'Tabung Infaq' },
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
    `text-sm font-medium transition-colors ${isActive ? 'text-accent' : 'text-white/80 hover:text-white'}`

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-accent font-bold text-lg leading-none">KUPSIS</span>
            <span className="text-white/60 text-xs hidden sm:block">Road to SPM 2026</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => <NavLink key={l.to} to={l.to} className={navCls} end={l.to === '/'}>{l.label}</NavLink>)}
          </div>

          {/* Admin / Login */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin ? (
              <>
                <Link to="/admin" className="flex items-center gap-1 text-accent text-sm font-semibold hover:text-white transition-colors">
                  <ShieldCheck size={15} /> Admin
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors ml-3">
                  <LogOut size={14} /> Keluar
                </button>
              </>
            ) : (
              <Link to="/login" className="text-white/70 hover:text-white text-sm transition-colors flex items-center gap-1">
                <ShieldCheck size={14} /> Admin
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-white" onClick={() => setOpen(o => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-primary border-t border-white/10 px-4 pb-4 flex flex-col gap-3">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={navCls} end={l.to === '/'} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {isAdmin ? (
            <>
              <Link to="/admin" className="text-accent text-sm font-semibold flex items-center gap-1" onClick={() => setOpen(false)}>
                <ShieldCheck size={14} /> Admin
              </Link>
              <button onClick={handleSignOut} className="text-white/70 text-sm text-left flex items-center gap-1">
                <LogOut size={14} /> Keluar
              </button>
            </>
          ) : (
            <Link to="/login" className="text-white/70 text-sm flex items-center gap-1" onClick={() => setOpen(false)}>
              <ShieldCheck size={14} /> Log Masuk Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

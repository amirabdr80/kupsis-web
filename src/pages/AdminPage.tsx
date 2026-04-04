import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, LogOut, CalendarDays, BookOpen, Clock, Image, DollarSign } from 'lucide-react'

export default function AdminPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const sections = [
    { to: '/calendar',   icon: <CalendarDays size={22} className="text-blue-500" />,   label: 'Kalendar', desc: 'Edit jadual PB / OT / LW / Cuti' },
    { to: '/activities', icon: <BookOpen size={22} className="text-green-500" />,       label: 'Aktiviti Lepas', desc: 'Tambah, edit atau padam aktiviti lepas' },
    { to: '/upcoming',   icon: <Clock size={22} className="text-orange-500" />,         label: 'Aktiviti Akan Datang', desc: 'Urus aktiviti yang dirancang' },
    { to: '/gallery',    icon: <Image size={22} className="text-purple-500" />,         label: 'Galeri Foto', desc: 'Muat naik dan urus kumpulan foto' },
    { to: '/donations',  icon: <DollarSign size={22} className="text-emerald-500" />,  label: 'Tabung Infaq', desc: 'Rekod dan pantau kutipan derma' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="card mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck size={24} className="text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary">Panel Admin</h1>
          <p className="text-gray-400 text-sm">KUPSIS · KSIB F5 Salahuddin Al-Ayubi</p>
        </div>
        <button onClick={handleSignOut} className="btn-secondary flex items-center gap-1 text-xs">
          <LogOut size={14} /> Log Keluar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(s => (
          <Link key={s.to} to={s.to} className="card hover:shadow-md hover:border-primary/20 border-2 border-transparent transition-all flex items-start gap-3">
            <div className="mt-0.5">{s.icon}</div>
            <div>
              <div className="font-bold text-gray-800">{s.label}</div>
              <div className="text-gray-400 text-sm">{s.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800">
        <strong>💡 Cara Edit:</strong> Pergi ke mana-mana halaman dan anda akan nampak butang edit (✏️ Tambah, Padam, dll) apabila anda log masuk sebagai admin.
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { signIn, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAdmin) {
    navigate('/admin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('E-mel atau kata laluan tidak sah.')
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="card w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
            <ShieldCheck size={28} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-primary">Log Masuk Admin</h1>
          <p className="text-gray-400 text-xs mt-1">KUPSIS · KSIB Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">E-mel</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@email.com" />
          </div>
          <div>
            <label className="label">Kata Laluan</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Sedang log masuk...' : 'Log Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}

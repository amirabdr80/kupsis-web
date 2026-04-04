import { useEffect, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Donation } from '../types'

const TARGET = 5000

export default function DonationsPage() {
  const { isAdmin } = useAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ donor_name: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('donations').select('*').order('date', { ascending: false })
    setDonations(data || [])
    setLoading(false)
  }

  async function save() {
    if (!form.amount || isNaN(Number(form.amount))) return
    setSaving(true)
    await supabase.from('donations').insert({ donor_name: form.donor_name || 'Tanpa Nama', amount: Number(form.amount), date: form.date, note: form.note })
    setSaving(false)
    setModal(false)
    setForm({ donor_name: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' })
    load()
  }

  async function del(id: string) {
    if (!confirm('Padam rekod derma ini?')) return
    await supabase.from('donations').delete().eq('id', id)
    setDonations(prev => prev.filter(d => d.id !== id))
  }

  const total = donations.reduce((s, d) => s + Number(d.amount), 0)
  const progress = Math.min(100, (total / TARGET) * 100)

  if (loading) return <div className="text-center py-20 text-gray-400">Memuatkan...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">💚 Tabung Infaq SAA 2026</h1>
          <p className="text-gray-500 text-sm mt-1">Kutipan dana KSIB F5 Salahuddin Al-Ayubi</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-1">
            <Plus size={16} /> Tambah Derma
          </button>
        )}
      </div>

      {/* Progress card */}
      <div className="card mb-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <div className="text-3xl font-bold text-primary">RM {total.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}</div>
            <div className="text-gray-400 text-sm">daripada sasaran RM {TARGET.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-accent">{progress.toFixed(1)}%</div>
            <div className="text-gray-400 text-xs">{donations.length} penderma</div>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Donation list */}
      {donations.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">💚</div>
          <p>Belum ada rekod derma.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {donations.map(d => (
            <div key={d.id} className="card flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-800">{d.donor_name || 'Tanpa Nama'}</div>
                <div className="text-gray-400 text-xs">{d.date && new Date(d.date + 'T00:00:00').toLocaleDateString('ms-MY', { day:'numeric', month:'short', year:'numeric' })}{d.note ? ` · ${d.note}` : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-700 text-lg">RM {Number(d.amount).toFixed(2)}</span>
                {isAdmin && (
                  <button onClick={() => del(d.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-primary text-lg">Tambah Rekod Derma</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="label">Nama Penderma</label>
                <input className="input" value={form.donor_name} onChange={e => setForm(f => ({ ...f, donor_name: e.target.value }))} placeholder="Tanpa Nama" />
              </div>
              <div>
                <label className="label">Jumlah (RM) *</label>
                <input className="input" type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="50.00" />
              </div>
              <div>
                <label className="label">Tarikh</label>
                <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Nota</label>
                <input className="input" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="cth: Derma untuk program..." />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={save} className="btn-primary flex-1" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              <button onClick={() => setModal(false)} className="btn-secondary">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

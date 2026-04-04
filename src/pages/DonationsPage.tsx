import { useEffect, useState } from 'react'
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
    setSaving(false); setModal(false)
    setForm({ donor_name: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' })
    load()
  }

  async function del(id: string) {
    if (!confirm('Padam rekod derma ini?')) return
    await supabase.from('donations').delete().eq('id', id)
    setDonations(prev => prev.filter(d => d.id !== id))
  }

  const total = donations.reduce((s, d) => s + Number(d.amount), 0)
  const pct   = Math.min(100, (total / TARGET) * 100)

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0', color: '#8a6040' }}>Memuatkan...</div>

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 24px' }}>
      <div className="section-hero">
        <div style={{ fontSize: '3rem' }}>💚</div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Tabung Infaq SAA 2026</h2>
          <p style={{ opacity: 0.85, marginTop: 6, fontSize: '0.9rem' }}>Kutipan dana KSIB F5 Salahuddin Al-Ayubi · Sasaran: RM {TARGET.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Summary */}
        <div className="card donation-card">
          <div className="card-title"><span className="icon">📊</span> Ringkasan Tabung</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e8449' }}>RM {total.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}</div>
          <div style={{ fontSize: '0.85rem', color: '#8a6040' }}>daripada sasaran RM {TARGET.toLocaleString()}</div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
              <span>Kemajuan</span><span>{pct.toFixed(1)}%</span>
            </div>
            <div className="progress-bar"><div className="progress-fill green" style={{ width: `${pct}%` }} /></div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.85rem', color: '#8a6040' }}>
            <span>👥 {donations.length} penderma</span>
            <span>💰 Baki: RM {Math.max(0, TARGET - total).toFixed(2)}</span>
          </div>
        </div>

        {/* Action */}
        <div className="card">
          <div className="card-title"><span className="icon">➕</span> Rekod Derma Baru</div>
          {isAdmin ? (
            <button className="btn-add" onClick={() => setModal(true)}>💚 Tambah Rekod Derma</button>
          ) : (
            <p style={{ color: '#8a6040', fontSize: '0.9rem' }}>Log masuk sebagai admin untuk menambah rekod derma.</p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-title"><span className="icon">📋</span> Senarai Derma</div>
        {donations.length === 0 ? (
          <p style={{ color: '#8a6040', textAlign: 'center', padding: '40px 0' }}>Tiada rekod derma lagi.</p>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>#</th><th>Nama Penderma</th><th>Jumlah</th><th>Tarikh</th><th>Nota</th>{isAdmin && <th>Tindakan</th>}</tr>
              </thead>
              <tbody>
                {donations.map((d, i) => (
                  <tr key={d.id}>
                    <td style={{ color: '#8a6040' }}>{i + 1}</td>
                    <td><strong>{d.donor_name || 'Tanpa Nama'}</strong></td>
                    <td><strong style={{ color: '#1e8449' }}>RM {Number(d.amount).toFixed(2)}</strong></td>
                    <td>{d.date ? new Date(d.date + 'T00:00:00').toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td style={{ color: '#8a6040' }}>{d.note || '—'}</td>
                    {isAdmin && (
                      <td><button className="btn-del" onClick={() => del(d.id)}>🗑️ Padam</button></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay open" onClick={() => setModal(false)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#b34700', marginBottom: 18, paddingBottom: 10, borderBottom: '2px solid #fff3e8' }}>
              Tambah Rekod Derma
            </div>
            {[
              { k: 'donor_name', l: 'Nama Penderma', t: 'text', ph: 'Tanpa Nama' },
              { k: 'amount',     l: 'Jumlah (RM) *', t: 'number', ph: '50.00' },
              { k: 'date',       l: 'Tarikh',        t: 'date', ph: '' },
              { k: 'note',       l: 'Nota',          t: 'text', ph: 'Derma untuk program...' },
            ].map(({ k, l, t, ph }) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <label className="label">{l}</label>
                <input className="input" type={t} placeholder={ph} value={String((form as Record<string,string>)[k])} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn-cancel" onClick={() => setModal(false)}>Batal</button>
              <button className="btn-save" onClick={save} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

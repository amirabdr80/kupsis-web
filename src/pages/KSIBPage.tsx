export default function KSIBPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(14px, 4vw, 28px) clamp(12px, 4vw, 24px)' }}>

      {/* ── Page Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #8a3200 0%, #e8671a 60%, #f5a623 100%)',
        borderRadius: 16, padding: 'clamp(20px, 5vw, 36px) clamp(20px, 5vw, 40px)',
        marginBottom: 28, textAlign: 'center', color: 'white',
        boxShadow: '0 4px 20px rgba(140,50,0,0.25)',
      }}>
        <div style={{ fontSize: 'clamp(2rem, 8vw, 3.2rem)', fontWeight: 900, letterSpacing: 2, lineHeight: 1 }}>KSIB SAA</div>
        <div style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)', fontWeight: 700, marginTop: 6, opacity: 0.95 }}>Salahuddin Al-Ayubi</div>
        <div style={{ fontSize: 'clamp(0.75rem, 3vw, 0.9rem)', marginTop: 4, opacity: 0.8 }}>Sekolah Menengah Sains Kubang Pasu</div>
        <div style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.82rem)', marginTop: 2, opacity: 0.7 }}>Kumpulan Sokongan Ibu Bapa · SPM 2026</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          {['KUPSIS', 'SPM 2026', 'TINGKATAN 5'].map(tag => (
            <span key={tag} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 1 }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          BAHAGIAN 1: BARISAN KEPIMPINAN
      ══════════════════════════════════════════════ */}
      <div className="card" style={{ marginBottom: 24 }}>
        <SectionTitle icon="👑" label="Barisan Kepimpinan" />

        {/* Row 1: Guru advisors */}
        <OrgRow>
          <OrgCard role="Guru Penasihat Batch" name="Pn. Marhaini Mohamed @ Nik Mohamed" icon="🏫" color="#1e6091" />
          <OrgCard role="Guru Penyelaras Batch" name="Pn. Aimi Fatihah Muhammad Fauzi" icon="🏫" color="#1e6091" />
        </OrgRow>

        {/* Connector */}
        <ConnectorLine />

        {/* Row 2: Penasihat + Pengerusi */}
        <OrgRow>
          <OrgCard role="Penasihat" name="En. Azmi Abdul Latip" icon="🌟" color="#6d28d9" />
          <OrgCard role="Pengerusi" name="En. Amir Abd Rahim" icon="👑" color="#b34700" highlight />
        </OrgRow>

        <ConnectorLine />

        {/* Row 3: Timbalan + Naib Pengerusi */}
        <OrgRow>
          <OrgCard role="Timbalan Pengerusi" name="Dr. Herman Shah Anuar" icon="⭐" color="#0e7490" />
          <OrgCard role="Naib Pengerusi" name="Dr. Julinawati Suanda" icon="⭐" color="#0e7490" />
        </OrgRow>

        <ConnectorLine />

        {/* Row 4: Bendahari + Setiausaha + Naib Setiausaha */}
        <OrgRow three>
          <OrgCard role="Bendahari" name="En. Amir Abd Rahim" icon="💰" color="#166534" small />
          <OrgCard role="Setiausaha" name="Pn. Nur Zuriati Abdullah" icon="📋" color="#166534" small />
          <OrgCard role="Naib Setiausaha" name="Pn. Siti Fatimah Mohd Nasaruddin" icon="📋" color="#166534" small />
        </OrgRow>

      </div>

      {/* ══════════════════════════════════════════════
          BAHAGIAN 2: KOORDINATOR KELAS
      ══════════════════════════════════════════════ */}
      <div className="card" style={{ marginBottom: 24 }}>
        <SectionTitle icon="🏫" label="Koordinator Kelas" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { kelas: '5 Juara', persons: ['Pn. Azlindayati Azaharudin', 'Pn. Nur Zuraiti Abdullah'] },
            { kelas: '5 Rajin', persons: ['Pn. Habibah Zainuddin', 'Pn. Saidatun Atikah', 'Pn. Fauzana Nadiah Hussain'] },
            { kelas: '5 Fikir', persons: ['Dr. Julinawati Suanda'] },
            { kelas: '5 Waja',  persons: ['Pn. Syakimah Abd Ghani', 'Pn. Sayang Nurshahrizleen Ramlan'] },
            { kelas: '5 Nekad', persons: ['Pn. Siti Fatimah Mohd Nasaruddin'] },
          ].map(({ kelas, persons }) => (
            <div key={kelas} style={{
              background: 'linear-gradient(135deg, #fff7ed, #fff)',
              border: '1px solid #fed7aa', borderRadius: 12, padding: '14px 16px',
              borderTop: '3px solid #e8671a',
            }}>
              <div style={{ fontWeight: 800, color: '#b34700', fontSize: '0.88rem', marginBottom: 8 }}>🏫 {kelas}</div>
              {persons.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#374151', marginBottom: 4 }}>
                  <span style={{ color: '#e8671a', fontSize: '0.6rem' }}>●</span> {p}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          BAHAGIAN 3: CHAMPION SUBJEK
      ══════════════════════════════════════════════ */}
      <div className="card" style={{ marginBottom: 24 }}>
        <SectionTitle icon="🏆" label="Champion Subjek" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { subject: 'Matematik',           icon: '📘', color: '#1e6091', persons: ['Pn. Nur Zuriati Abdullah', 'Pn. Azlindayati Azaharudin'] },
            { subject: 'Matematik Tambahan',  icon: '📗', color: '#6d28d9', persons: ['Pn. Siti Fatimah Mohd Nasaruddin', 'Dr. Herman Shah Anuar'] },
            { subject: 'Biologi',             icon: '📙', color: '#166534', persons: ['Pn. Yati Timan', 'En. Amir Abd Rahim'] },
            { subject: 'Kimia',               icon: '📕', color: '#0e7490', persons: ['Pn. Sayang Nurshahrizleen Ramlan', 'Pn. Syakimah Abd Ghani'] },
            { subject: 'Fizik',               icon: '📔', color: '#92400e', persons: ['Dr. Salsabila Ahmad', 'En. Azmi Abdul Latip'] },
          ].map(({ subject, icon, color, persons }) => (
            <div key={subject} style={{
              background: '#fff', borderRadius: 12, padding: '14px 16px',
              border: '1px solid #e5e7eb', borderTop: `3px solid ${color}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontWeight: 800, color, fontSize: '0.88rem', marginBottom: 8 }}>
                {icon} {subject}
              </div>
              {persons.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#374151', marginBottom: 4 }}>
                  <span style={{ color, fontSize: '0.6rem' }}>●</span> {p}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer tagline ── */}
      <div style={{
        textAlign: 'center', padding: '20px 0 8px', color: '#b34700',
        fontWeight: 800, fontSize: 'clamp(0.85rem, 3vw, 1rem)', letterSpacing: 1,
      }}>
        KECEMERLANGAN SPM 2026
        <div style={{ fontWeight: 500, fontSize: '0.75rem', color: '#8a6040', marginTop: 4, letterSpacing: 2 }}>
          #KSIBSAA2026 · #KUPSIS · #SPM2026
        </div>
      </div>

    </div>
  )
}

/* ── Helpers ── */

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      fontWeight: 800, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', color: '#b34700',
      marginBottom: 20, paddingBottom: 10,
      borderBottom: '2px solid #fed7aa', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span>{icon}</span> {label}
    </div>
  )
}

function ConnectorLine() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
      <div style={{ width: 2, height: 20, background: '#fed7aa' }} />
    </div>
  )
}

function OrgRow({ children, three }: { children: React.ReactNode; three?: boolean }) {
  return (
    <div style={{
      display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
      marginBottom: 4,
      ...(three ? { gap: 10 } : {}),
    }}>
      {children}
    </div>
  )
}

function OrgCard({
  role, name, icon, color, highlight, small,
}: {
  role: string; name: string; icon: string; color: string; highlight?: boolean; small?: boolean;
}) {
  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${color}15, ${color}08)` : '#fff',
      border: `1.5px solid ${color}40`,
      borderTop: `3px solid ${color}`,
      borderRadius: 12,
      padding: small ? '10px 14px' : '14px 20px',
      textAlign: 'center',
      minWidth: small ? 140 : 180,
      maxWidth: small ? 200 : 260,
      flex: '1 1 auto',
      boxShadow: highlight ? `0 4px 14px ${color}20` : '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: small ? '1.1rem' : '1.4rem', marginBottom: 4 }}>{icon}</div>
      <div style={{
        fontSize: small ? '0.65rem' : '0.7rem', fontWeight: 700, color,
        textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4,
        background: `${color}15`, borderRadius: 20, padding: '2px 10px', display: 'inline-block',
      }}>
        {role}
      </div>
      <div style={{
        fontWeight: 700, color: '#1f2937',
        fontSize: small ? '0.78rem' : 'clamp(0.82rem, 2.5vw, 0.92rem)',
        lineHeight: 1.3, marginTop: 4,
      }}>
        {name}
      </div>
    </div>
  )
}

export default function BIJAKPage() {
  const tiangData = [
    {
      letter: 'B',
      title: 'Bersama Guru',
      subtitle: 'Rakan Kongsi Sekolah',
      color: '#1e6091',
      bg: '#eff6ff',
      border: '#bfdbfe',
      icon: '🏫',
      matlamat: 'Bina hubungan mesra & saling percaya antara KSIB dan guru — tujuan utama adalah menyokong.',
      tindakan: [
        'Mesyuarat bersama untuk faham keperluan guru dan macam mana KSIB boleh bantu.',
        'Hadiah penghargaan pada Hari Guru dan majlis sekolah.',
        'Tawarkan bantuan logistik bagi program sekolah (kelas tambahan, seminar, klinik SPM).',
        'Dengar dulu, sebelum mencadang — guru paling tahu keperluan pelajar.',
        'Harmoni; semua maklum balas disalurkan secara rasmi & beradab.',
      ],
      quote: '"Guru yang dihormati adalah guru yang bersemangat mendidik."',
    },
    {
      letter: 'I',
      title: 'Inspirasi Pelajar',
      subtitle: 'Motivasi & Semangat',
      color: '#6d28d9',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      icon: '🌟',
      matlamat: 'Bakar semangat pelajar Salahuddin Al-Ayubi untuk berjuang menempuh SPM 2026 dengan yakin.',
      tindakan: [
        "Bengkel motivasi & 'Majlis Bicara SPM' bersama alumni cemerlang KUPSIS.",
        'Hadiah kecil tapi konsisten: token kepada pelajar cemerlang dan lonjakan prestasi.',
        'Melakukan beberapa jenis kelas tambahan:',
        'Bersama cikgu sekolah — fokus subjek teras dan elektif.',
        'Cikgu luar dijemput khas untuk subjek yang perlukan bantuan khusus.',
        'Kelas tuition group kecil dianjurkan oleh ibu bapa sendiri (hanya maklum kepada KSIB).',
      ],
      quote: '"Pelajar yang bermotivasi tidak perlu dipaksa belajar — dia mencari ilmu sendiri."',
    },
    {
      letter: 'J',
      title: 'Jaringan Sahabat',
      subtitle: 'Pelajar Bantu Pelajar',
      color: '#166534',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      icon: '🤝',
      matlamat: 'Bina budaya ukhuwah — pelajar saling menguatkan, bukan bersaing secara tidak sihat.',
      tindakan: [
        "'Study Buddy' — setiap pelajar ada pasangan belajar tetap (kuat + lemah).",
        'Kumpulan ulangkaji mingguan (3–5 orang) dipantau ringan oleh KSIB.',
        "'Abang Angkat / Kakak Angkat' dari bekas pelajar cemerlang sebagai mentor.",
        "Program 'Sahabat Doa' — sahabat saling doakan sebelum peperiksaan.",
        "Galakkan perkongsian nota & soalan — tiada istilah 'Berjaya sendiri'.",
      ],
      quote: '"Seorang mukmin itu cermin bagi mukmin yang lain." — HR. Abu Daud',
    },
    {
      letter: 'A',
      title: 'Amalan Ibadah',
      subtitle: 'Rohani & Keberkatan',
      color: '#92400e',
      bg: '#fff7ed',
      border: '#fed7aa',
      icon: '🤲',
      matlamat: 'Padukan usaha akademik dengan kekuatan rohani — ilmu yang berkat lebih tahan lama.',
      tindakan: [
        'Program Qiamullail & Solat Hajat berkala menjelang SPM (anjuran KSIB–sekolah).',
        'Bacaan Yasin & doa beramai-ramai setiap malam Jumaat secara online.',
        'Sesi bacaan doa ringkas 5 minit sebelum kelas tambahan.',
        'Majlis doa khas ibu bapa untuk anak-anak Batch Salahuddin Al-Ayubi.',
      ],
      quote: '"Ilmu itu cahaya, dan cahaya Allah tidak diberi kepada ahli maksiat." — Imam Syafie',
    },
    {
      letter: 'K',
      title: 'Kasih Keluarga',
      subtitle: 'Ibu Bapa & Rumah',
      color: '#0e7490',
      bg: '#ecfeff',
      border: '#a5f3fc',
      icon: '🏠',
      matlamat: 'Rumah adalah madrasah pertama — KSIB membantu ibu bapa jadi pendorong, "biggest supporter".',
      tindakan: [
        "'Ibu Bapa Penyokong SPM' — panduan ringkas apa yang patut & tidak patut dibuat.",
        'Kumpulan WhatsApp KSIB yang positif — kongsi tip, bukan gosip.',
        "'Parent Talk' — pakar dijemput untuk isu tekanan remaja & peperiksaan.",
        'Galak ibu bapa hadir majlis sekolah — kehadiran tanda sokongan.',
        'Budaya doa ibu bapa — peringatan berkala: doa ibu bapa paling mustajab.',
      ],
      quote: '"Doa ibu bapa untuk anaknya adalah doa yang tidak tertolak." — HR. Tirmidzi',
    },
  ]

  const pelanTindakan = [
    { tempoh: 'Jan – Mac',  fokus: 'B • Bersama Guru',      program: 'Mesyuarat santai, tawaran logistik',          color: '#1e6091' },
    { tempoh: 'Apr – Jun',  fokus: 'I • Inspirasi Pelajar',  program: 'Kelas Tambahan, Motivasi',                    color: '#6d28d9' },
    { tempoh: 'Jul – Ogos', fokus: 'J • Jaringan Sahabat',   program: 'Study Buddy, Mentor Abang/Kakak',             color: '#166534' },
    { tempoh: 'Sept – Okt', fokus: 'A • Amalan Ibadah',      program: 'Qiamullail, Solat Hajat, Yasin',              color: '#92400e' },
    { tempoh: 'Nov (SPM)',  fokus: 'K • Kasih Keluarga',     program: 'Doa ibu bapa, sokongan rumah',                color: '#0e7490' },
  ]

  const kejayaan = [
    { pct: '100%',   label: 'Pelajar ada Study Buddy & mentor',         icon: '🤝', color: '#166534' },
    { pct: '≥ 80%',  label: 'Kehadiran ibu bapa di majlis KSIB',        icon: '👨‍👩‍👧', color: '#1e6091' },
    { pct: '≥ 1x',   label: 'Program motivasi & tazkirah setiap bulan', icon: '🌟', color: '#6d28d9' },
    { pct: 'Sifar',  label: 'Tiada Konflik',                             icon: '☮️', color: '#0e7490' },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(14px, 4vw, 28px) clamp(12px, 4vw, 24px)' }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #8a3200 0%, #e8671a 55%, #f5a623 100%)',
        borderRadius: 16, padding: 'clamp(24px, 5vw, 44px) clamp(20px, 5vw, 48px)',
        marginBottom: 28, textAlign: 'center', color: 'white',
        boxShadow: '0 6px 24px rgba(140,50,0,0.3)',
      }}>
        <div style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)', fontWeight: 700, letterSpacing: 3, opacity: 0.85, marginBottom: 8, textTransform: 'uppercase' }}>
          KSIB Salahuddin Al-Ayubi · SPM 2026
        </div>
        <div style={{ fontSize: 'clamp(2.4rem, 10vw, 4rem)', fontWeight: 900, letterSpacing: 6, lineHeight: 1 }}>STRATEGI</div>
        <div style={{
          fontSize: 'clamp(3rem, 12vw, 5rem)', fontWeight: 900, letterSpacing: 12, lineHeight: 1,
          background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '4px 24px',
          display: 'inline-block', margin: '8px 0',
        }}>BIJAK</div>
        <div style={{ fontSize: 'clamp(0.85rem, 3vw, 1.05rem)', marginTop: 12, opacity: 0.9, fontWeight: 500 }}>
          5 Tiang KSIB Membina Kecemerlangan Pelajar & Sekolah
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {['KUPSIS', 'SPM 2026', 'BATCH SALAHUDDIN AL-AYUBI'].map(t => (
            <span key={t} style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Mukadimah ── */}
      <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid #e8671a' }}>
        <div style={{ fontWeight: 800, color: '#b34700', fontSize: 'clamp(0.9rem, 3vw, 1rem)', marginBottom: 12 }}>📖 Mukadimah — Kenapa Perlu KSIB?</div>
        <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', marginBottom: 12 }}>
          KSIB adalah <strong>rakan strategik kepada pihak sekolah</strong> dalam membentuk pelajar Salahuddin Al-Ayubi yang cemerlang dunia dan akhirat.
        </p>
        <p style={{ color: '#374151', lineHeight: 1.7, fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', marginBottom: 14 }}>
          Dengan Strategi BIJAK, kita bergerak: <strong>Bersama · Terancang · Berkesan</strong>
        </p>
        <blockquote style={{
          margin: 0, padding: '12px 18px',
          background: '#fff7ed', borderLeft: '3px solid #e8671a', borderRadius: '0 8px 8px 0',
          fontStyle: 'italic', color: '#92400e', fontSize: '0.88rem', lineHeight: 1.6,
        }}>
          "Sebaik-baik manusia adalah yang paling bermanfaat kepada manusia lain." <br />
          <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>— HR. Ahmad, Thabrani</span>
        </blockquote>
      </div>

      {/* ── BIJAK Overview Cards ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 800, color: '#b34700', fontSize: 'clamp(0.9rem, 3vw, 1rem)', marginBottom: 18, paddingBottom: 10, borderBottom: '2px solid #fed7aa' }}>
          ⭐ Strategi BIJAK — 5 Tiang Kecemerlangan KSIB
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {tiangData.map((t, i) => (
            <div key={t.letter} style={{
              background: t.bg, border: `1.5px solid ${t.border}`,
              borderTop: `4px solid ${t.color}`, borderRadius: 12,
              padding: '16px 14px', textAlign: 'center',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: t.color,
                color: 'white', fontWeight: 900, fontSize: '1.4rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px',
              }}>{t.letter}</div>
              <div style={{ fontWeight: 800, color: t.color, fontSize: '0.88rem', marginBottom: 2 }}>{t.title}</div>
              <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{t.subtitle}</div>
              <div style={{ fontSize: '1.2rem', marginTop: 8 }}>{t.icon}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, fontWeight: 700, color: '#b34700', fontSize: '0.85rem', letterSpacing: 1 }}>
          B • I • J • A • K = Pelajar Cemerlang, Sekolah Terbilang
        </div>
      </div>

      {/* ── Each Tiang Detail ── */}
      {tiangData.map((t, idx) => (
        <div key={t.letter} className="card" style={{ marginBottom: 20, borderTop: `4px solid ${t.color}` }}>
          {/* Tiang header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: t.color,
              color: 'white', fontWeight: 900, fontSize: '1.6rem', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{t.letter}</div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.color, textTransform: 'uppercase', letterSpacing: 1 }}>
                TIANG {idx + 1}
              </div>
              <div style={{ fontWeight: 800, color: '#1f2937', fontSize: 'clamp(1rem, 3vw, 1.15rem)', lineHeight: 1.2 }}>
                {t.icon} {t.title}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>{t.subtitle}</div>
            </div>
          </div>

          {/* Matlamat */}
          <div style={{
            background: t.bg, border: `1px solid ${t.border}`,
            borderRadius: 10, padding: '12px 16px', marginBottom: 14,
          }}>
            <div style={{ fontWeight: 700, color: t.color, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>🎯 Matlamat</div>
            <p style={{ margin: 0, color: '#374151', fontSize: '0.88rem', lineHeight: 1.7 }}>{t.matlamat}</p>
          </div>

          {/* Tindakan */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
              📌 Tindakan & Cadangan KSIB
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {t.tindakan.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: t.color,
                    color: 'white', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                  }}>{i + 1}</div>
                  <span style={{ color: '#374151', fontSize: '0.86rem', lineHeight: 1.6, flex: 1 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <blockquote style={{
            margin: 0, padding: '10px 16px',
            background: t.bg, borderLeft: `3px solid ${t.color}`, borderRadius: '0 8px 8px 0',
            fontStyle: 'italic', color: t.color, fontSize: '0.83rem', lineHeight: 1.6,
          }}>
            {t.quote}
          </blockquote>
        </div>
      ))}

      {/* ── Pelan Tindakan ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 800, color: '#b34700', fontSize: 'clamp(0.9rem, 3vw, 1rem)', marginBottom: 4, paddingBottom: 10, borderBottom: '2px solid #fed7aa' }}>
          📅 Pelan Tindakan — Jadual Ringkas Strategi BIJAK 2026
        </div>
        <p style={{ fontSize: '0.78rem', color: '#8a6040', marginBottom: 16, marginTop: 8 }}>
          Nota: Kelima-lima tiang berjalan serentak sepanjang tahun — fokus utama berubah mengikut tempoh.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #8a3200, #e8671a)', color: 'white' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, borderRadius: '8px 0 0 0' }}>Tempoh</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700 }}>Fokus Utama</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, borderRadius: '0 8px 0 0' }}>Program Teras</th>
              </tr>
            </thead>
            <tbody>
              {pelanTindakan.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fff7ed' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #f0d5bc', whiteSpace: 'nowrap' }}>
                    {row.tempoh}
                  </td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0d5bc' }}>
                    <span style={{
                      fontWeight: 700, color: row.color,
                      background: row.color + '15', borderRadius: 20,
                      padding: '3px 10px', fontSize: '0.8rem',
                    }}>{row.fokus}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#374151', borderBottom: '1px solid #f0d5bc' }}>{row.program}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Petunjuk Kejayaan ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 800, color: '#b34700', fontSize: 'clamp(0.9rem, 3vw, 1rem)', marginBottom: 6, paddingBottom: 10, borderBottom: '2px solid #fed7aa' }}>
          📊 Petunjuk Kejayaan — Bagaimana Kita Tahu BIJAK Berjaya?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 16 }}>
          {kejayaan.map((k, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '20px 16px',
              background: k.color + '08', border: `1.5px solid ${k.color}30`,
              borderTop: `4px solid ${k.color}`, borderRadius: 12,
            }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{k.icon}</div>
              <div style={{ fontSize: 'clamp(1.6rem, 6vw, 2.2rem)', fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.pct}</div>
              <div style={{ fontSize: '0.8rem', color: '#374151', marginTop: 8, lineHeight: 1.5 }}>{k.label}</div>
            </div>
          ))}
        </div>
        <div style={{
          textAlign: 'center', marginTop: 18, padding: '14px 20px',
          background: '#fff7ed', borderRadius: 10, color: '#92400e',
          fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.7,
        }}>
          Kejayaan diukur bukan semata-semata pada keputusan — tetapi pada <strong>proses yang kita bina bersama</strong>.
        </div>
      </div>

      {/* ── Closing ── */}
      <div style={{
        background: 'linear-gradient(135deg, #8a3200 0%, #b34700 50%, #e8671a 100%)',
        borderRadius: 16, padding: 'clamp(24px, 5vw, 40px)', textAlign: 'center', color: 'white',
        boxShadow: '0 4px 20px rgba(140,50,0,0.25)', marginBottom: 8,
      }}>
        <div style={{ fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', fontWeight: 900, letterSpacing: 2 }}>BERSAMA KITA BIJAK</div>
        <div style={{ fontSize: 'clamp(0.8rem, 3vw, 1rem)', marginTop: 6, opacity: 0.9, fontWeight: 600 }}>
          Bina Pelajar. Bantu Guru. Berkat Rumah.
        </div>
        <blockquote style={{
          margin: '18px auto 0', maxWidth: 560, fontStyle: 'italic',
          fontSize: 'clamp(0.8rem, 2.5vw, 0.92rem)', lineHeight: 1.8, opacity: 0.92,
          borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: 16,
        }}>
          "Ya Allah, mudahkanlah urusan anak-anak kami,<br />
          terangkanlah hati mereka, dan berkatilah usaha mereka."
        </blockquote>
        <div style={{ marginTop: 18, fontSize: '0.8rem', opacity: 0.75, letterSpacing: 1 }}>
          KSIB Salahuddin Al-Ayubi · KUPSIS · SPM 2026
        </div>
        <div style={{ marginTop: 8, fontWeight: 900, fontSize: 'clamp(1rem, 4vw, 1.4rem)', letterSpacing: 8, opacity: 0.95 }}>
          B · I · J · A · K
        </div>
      </div>

    </div>
  )
}

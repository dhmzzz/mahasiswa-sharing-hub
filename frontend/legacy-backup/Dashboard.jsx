const features = [
  { icon: '✦', title: 'Confession', description: 'Bagikan cerita atau pendapat secara aman.', page: 'confessions' },
  { icon: '▤', title: 'Materi Kuliah', description: 'Temukan dan bagikan materi pembelajaran.', page: 'materials' },
  { icon: '?', title: 'Bank Soal', description: 'Kumpulkan soal untuk persiapan ujian.' },
  { icon: '↗', title: 'Info Magang', description: 'Bagikan kesempatan magang dan pengalaman.' },
  { icon: '⌁', title: 'Teman', description: 'Terhubung dengan mahasiswa lain melalui QR code.' },
]

function Dashboard({ user, onNavigate }) {
  return (
    <section className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Selamat datang, {user.name}.</h1>
          <p>Mulai jelajahi ruang berbagi untuk komunitas mahasiswa.</p>
        </div>
        <div className="profile-card">
          <span className="avatar" aria-hidden="true">{user.name?.charAt(0).toUpperCase()}</span>
          <div><strong>{user.name}</strong><span>{user.email}</span></div>
        </div>
      </div>

      <section className="dashboard-section" aria-labelledby="mulai-title">
        <h2 id="mulai-title">Mulai berbagi</h2>
        <p className="section-intro">Fitur-fitur berikut akan dibuat satu per satu pada langkah selanjutnya.</p>
        <div className="dashboard-grid">
          {features.map((feature) => (
            <article className="dashboard-feature" key={feature.title}>
              <span className="feature-icon" aria-hidden="true">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              {feature.page ? <button className="feature-link" type="button" onClick={() => onNavigate(feature.page)}>Buka {feature.title} →</button> : <span className="coming-soon">Segera hadir</span>}
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export default Dashboard

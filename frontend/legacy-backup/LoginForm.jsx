import { useState } from 'react'
import { api } from '../services/api'

function LoginForm({ onLogin, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const data = await api.post('/login', { email, password })
      await onLogin(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <button className="back-button" type="button" onClick={onBack}>← Kembali</button>
        <p className="eyebrow">Akun mahasiswa</p>
        <h1>Masuk</h1>
        <p className="form-intro">Gunakan email dan password yang sudah terdaftar.</p>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" autoComplete="email" required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Memeriksa akun...' : 'Masuk'}</button>
      </form>
    </section>
  )
}

export default LoginForm

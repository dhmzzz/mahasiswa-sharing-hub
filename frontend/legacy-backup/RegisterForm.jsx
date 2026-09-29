import { useState } from 'react'
import { api } from '../services/api'

function RegisterForm({ onRegister, onBack, onGoToLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (password !== passwordConfirmation) {
      setError('Konfirmasi password harus sama dengan password.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await api.post('/register', { name, email, password, password_confirmation: passwordConfirmation })
      await onRegister(data)
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
        <h1>Buat akun</h1>
        <p className="form-intro">Daftar untuk mulai berbagi bersama mahasiswa lain.</p>
        <label htmlFor="name">Nama lengkap</label>
        <input id="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" autoComplete="email" required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength="8" required />
        <label htmlFor="password-confirmation">Konfirmasi password</label>
        <input id="password-confirmation" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} autoComplete="new-password" minLength="8" required />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Membuat akun...' : 'Daftar'}</button>
        <p className="form-switch">Sudah punya akun? <button className="inline-button" type="button" onClick={onGoToLogin}>Masuk</button></p>
      </form>
    </section>
  )
}

export default RegisterForm

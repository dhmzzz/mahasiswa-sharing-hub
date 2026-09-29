import { useState } from "react";
import { api } from "../services/api";
import "./RegisterPage.css";

function RegisterPage({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await api.post("/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });

      console.log("Response register:", result.data);

      /*
       * PERBAIKAN:
       * api.js saat ini mengembalikan response.data,
       * jadi token berada di result.token,
       * bukan result.data.token.
       */
      const token =
        result.token ||
        result.access_token;

      const registeredUser = result.user;

      if (!token) {
        throw new Error(
          "Server berhasil memproses registrasi, tetapi token tidak ditemukan."
        );
      }

      localStorage.setItem("auth_token", token);

      if (onRegister) {
        onRegister(registeredUser);
      }

      window.location.href = "/dashboard";
    } catch (requestError) {
      console.error(
        "Registrasi gagal:",
        requestError
      );

      const validationErrors =
        requestError.response?.data?.errors;

      if (validationErrors) {
        const messages =
          Object.values(validationErrors)
            .flat()
            .join(" ");

        setError(messages);
      } else {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Registrasi gagal."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="register-page">
      <div className="register-card">

        <div className="register-header">
          <h1>Buat Akun</h1>

          <p>
            Bergabung dengan Mahasiswa Hub
          </p>
        </div>

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          <label htmlFor="register-name">
            Nama
          </label>

          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Nama lengkap"
            autoComplete="name"
            required
          />

          <label htmlFor="register-email">
            Email
          </label>

          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="nama@email.com"
            autoComplete="email"
            required
          />

          <label htmlFor="register-password">
            Password
          </label>

          <div className="password-input-wrapper">

            <input
              id="register-password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              aria-label={
                showPassword
                  ? "Sembunyikan password"
                  : "Tampilkan password"
              }
            >
              {showPassword ? "🙈" : "👁️"}
            </button>

          </div>

          <label htmlFor="register-password-confirmation">
            Konfirmasi Password
          </label>

          <div className="password-input-wrapper">

            <input
              id="register-password-confirmation"
              type={
                showPasswordConfirmation
                  ? "text"
                  : "password"
              }
              value={passwordConfirmation}
              onChange={(event) =>
                setPasswordConfirmation(
                  event.target.value
                )
              }
              placeholder="Ulangi password"
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPasswordConfirmation(
                  (current) => !current
                )
              }
              aria-label={
                showPasswordConfirmation
                  ? "Sembunyikan konfirmasi password"
                  : "Tampilkan konfirmasi password"
              }
            >
              {showPasswordConfirmation
                ? "🙈"
                : "👁️"}
            </button>

          </div>

          {error && (
            <div
              className="register-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Membuat akun..."
              : "Daftar"}
          </button>

        </form>

        <p className="register-login">
          Sudah punya akun?{" "}

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/login";
            }}
          >
            Masuk
          </button>
        </p>

      </div>
    </main>
  );
}

export default RegisterPage;
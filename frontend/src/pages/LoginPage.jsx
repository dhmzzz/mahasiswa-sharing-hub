import { useState } from "react";
import { api } from "../services/api";
import "./LoginPage.css";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSubmitting(true);
    setError("");

    try {
      const result = await api.post("/login", {
        email,
        password,
      });

      const token = result.token;
      const loggedInUser = result.user;

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan."
        );
      }

      localStorage.setItem(
        "auth_token",
        token
      );

      onLogin(loggedInUser);

      window.location.href = "/dashboard";
    } catch (requestError) {
      console.error(
        "Login gagal:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Email atau password salah."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">

      <div className="login-card">

        <div className="login-header">
          <h1>
            Mahasiswa Hub
          </h1>

          <p>
            Masuk ke akun kamu
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <label htmlFor="login-email">
            Email
          </label>

          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="nama@email.com"
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">
            Password
          </label>

          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Masukkan password"
            autoComplete="current-password"
            required
          />

          {error && (
            <div
              className="login-error"
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
              ? "Memproses..."
              : "Masuk"}
          </button>

        </form>

        <p className="login-register">
          Belum punya akun?{" "}
          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/register";
            }}
          >
            Daftar
          </button>
        </p>

      </div>

    </main>
  );
}

export default LoginPage;
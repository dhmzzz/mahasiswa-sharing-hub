import { useState } from "react";
import { api } from "../services/api";
import "./ConfessionsPage.css";

function ConfessionsPage() {
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!content.trim()) {
      setError("Confession tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      await api.post("/confessions", {
        content: content.trim(),
        is_anonymous: isAnonymous,
      });

      setContent("");
      setIsAnonymous(false);

      setSuccessMessage(
        "Confession berhasil dikirim."
      );
    } catch (requestError) {
      console.error(
        "Gagal mengirim confession:",
        requestError
      );

      const validationErrors =
        requestError.response?.data?.errors;

      if (validationErrors) {
        const messages = Object.values(
          validationErrors
        )
          .flat()
          .join(" ");

        setError(messages);
      } else {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Gagal mengirim confession."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="confession-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-heading">
        <p className="eyebrow">
          KOMUNITAS
        </p>

        <h1>
          Buat Confession
        </h1>

        <p>
          Bagikan cerita, pengalaman, keluh kesah,
          atau pendapatmu tentang kehidupan
          perkuliahan.
        </p>
      </div>

      {/* =========================
          CONFESSION CARD
      ========================= */}

      <div className="confession-create-wrapper">

        <form
          className="confession-form"
          onSubmit={handleSubmit}
        >

          {/* FORM HEADER */}

          <div className="confession-form-header">

            <div className="confession-form-icon">
              💬
            </div>

            <div>
              <h2>
                Tulis Confession
              </h2>

              <p>
                Ceritakan apa yang ingin kamu
                bagikan kepada mahasiswa lainnya.
              </p>
            </div>

          </div>

          {/* TEXTAREA */}

          <div className="confession-field">

            <label htmlFor="confession-content">
              Apa yang ingin kamu ceritakan?
            </label>

            <textarea
              id="confession-content"
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="Tulis confession kamu di sini..."
              rows={8}
              disabled={isSubmitting}
              required
            />

            <div className="character-info">
              {content.length} karakter
            </div>

          </div>

          {/* ANONYMOUS */}

          <label className="checkbox-label">

            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(event) =>
                setIsAnonymous(
                  event.target.checked
                )
              }
              disabled={isSubmitting}
            />

            <span>
              Kirim sebagai anonim
            </span>

          </label>

          <p className="confession-helper">
            {isAnonymous
              ? "Nama kamu tidak akan ditampilkan pada confession."
              : "Nama kamu akan ditampilkan pada confession."}
          </p>

          {/* SUCCESS */}

          {successMessage && (
            <div
              className="form-success"
              role="status"
            >
              ✓ {successMessage}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div
              className="form-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* BUTTON */}

          <button
            className="confession-submit-button"
            type="submit"
            disabled={
              isSubmitting ||
              !content.trim()
            }
          >
            {isSubmitting
              ? "Mengirim..."
              : "Kirim Confession"}
          </button>

        </form>

      </div>

    </section>
  );
}

export default ConfessionsPage;
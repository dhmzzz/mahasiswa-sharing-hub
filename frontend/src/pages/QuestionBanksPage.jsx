import { useEffect, useState } from "react";
import { api } from "../services/api";
import "./QuestionBanksPage.css";

function QuestionBanksPage({ user }) {
  const [questionBanks, setQuestionBanks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("UTS");
  const [selectedFile, setSelectedFile] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadQuestionBanks() {
    setIsLoading(true);
    setError("");

    try {
      const result = await api.get("/question-banks");

      setQuestionBanks(result.data ?? []);
    } catch (requestError) {
      console.error(
        "Gagal mengambil bank soal:",
        requestError
      );

      setError(
        requestError.message ||
          "Gagal mengambil daftar bank soal."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadQuestionBanks();
  }, []);

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Judul bank soal wajib diisi.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "subject",
        subject.trim()
      );

      formData.append(
        "exam_type",
        examType
      );

      if (selectedFile) {
        formData.append(
          "file",
          selectedFile
        );
      }

      const result = await api.post(
        "/question-banks",
        formData
      );

      setTitle("");
      setDescription("");
      setSubject("");
      setExamType("UTS");
      setSelectedFile(null);

      const fileInput =
        document.getElementById(
          "question-file"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      setSuccess(
        "Bank soal berhasil dibagikan."
      );

      if (result.data) {
        setQuestionBanks((current) => [
          result.data,
          ...current,
        ]);
      } else {
        await loadQuestionBanks();
      }
    } catch (requestError) {
      console.error(
        "Gagal membuat bank soal:",
        requestError
      );

      setError(
        requestError.message ||
          "Gagal membuat bank soal."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(questionBank) {
    const confirmed = window.confirm(
      `Hapus bank soal "${questionBank.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(questionBank.id);
    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/question-banks/${questionBank.id}`
      );

      setQuestionBanks((current) =>
        current.filter(
          (item) =>
            item.id !== questionBank.id
        )
      );

      setSuccess(
        "Bank soal berhasil dihapus."
      );
    } catch (requestError) {
      console.error(
        "Gagal menghapus bank soal:",
        requestError
      );

      setError(
        requestError.message ||
          "Gagal menghapus bank soal."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  if (isLoading) {
    return (
      <div className="question-banks-page">
        <div className="question-banks-loading">
          Memuat bank soal...
        </div>
      </div>
    );
  }

  return (
    <div className="question-banks-page">
      <div className="question-banks-header">
        <div>
          <p className="question-banks-eyebrow">
            SHARING HUB
          </p>

          <h1>Question Banks</h1>

          <p>
            Temukan dan bagikan bank soal UTS
            maupun UAS bersama mahasiswa
            lainnya.
          </p>
        </div>
      </div>

      {error && (
        <div className="question-banks-error">
          {error}
        </div>
      )}

      {success && (
        <div className="question-banks-success">
          ✓ {success}
        </div>
      )}

      <section className="question-bank-form-card">
        <div className="question-bank-form-header">
          <h2>Bagikan Bank Soal</h2>

          <p>
            Tambahkan bank soal yang ingin kamu
            bagikan kepada mahasiswa lain.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="question-bank-form-grid">
            <div className="question-bank-field">
              <label htmlFor="question-title">
                Judul Bank Soal
              </label>

              <input
                id="question-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Contoh: Bank Soal Pemrograman Web"
                disabled={isSaving}
                required
              />
            </div>

            <div className="question-bank-field">
              <label htmlFor="question-subject">
                Mata Kuliah
              </label>

              <input
                id="question-subject"
                type="text"
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                placeholder="Contoh: Pemrograman Web"
                disabled={isSaving}
              />
            </div>

            <div className="question-bank-field">
              <label htmlFor="question-exam-type">
                Jenis Ujian
              </label>

              <select
                id="question-exam-type"
                value={examType}
                onChange={(event) =>
                  setExamType(
                    event.target.value
                  )
                }
                disabled={isSaving}
              >
                <option value="UTS">
                  UTS
                </option>

                <option value="UAS">
                  UAS
                </option>
              </select>
            </div>

            <div className="question-bank-field">
              <label htmlFor="question-file">
                File Bank Soal
              </label>

              <input
                id="question-file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                onChange={handleFileChange}
                disabled={isSaving}
              />

              <span className="question-bank-helper">
                Format: PDF, DOC, DOCX, PPT, PPTX,
                XLS, XLSX. Maksimal 10 MB.
              </span>

              {selectedFile && (
                <span className="question-bank-selected-file">
                  File dipilih:{" "}
                  <strong>
                    {selectedFile.name}
                  </strong>
                </span>
              )}
            </div>
          </div>

          <div className="question-bank-field">
            <label htmlFor="question-description">
              Deskripsi
            </label>

            <textarea
              id="question-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Jelaskan isi atau informasi tentang bank soal ini..."
              rows="5"
              disabled={isSaving}
            />
          </div>

          <button
            type="submit"
            className="question-bank-submit"
            disabled={
              isSaving ||
              !title.trim()
            }
          >
            {isSaving
              ? "Mengunggah..."
              : "Bagikan Bank Soal"}
          </button>
        </form>
      </section>

      <section className="question-banks-list-section">
        <div className="question-banks-list-header">
          <div>
            <h2>Bank Soal Tersedia</h2>

            <p>
              Koleksi bank soal yang dibagikan
              mahasiswa.
            </p>
          </div>

          <button
            type="button"
            className="question-banks-refresh"
            onClick={loadQuestionBanks}
            disabled={isLoading}
          >
            {isLoading
              ? "Memuat..."
              : "Refresh"}
          </button>
        </div>

        {questionBanks.length === 0 ? (
          <div className="question-banks-empty">
            <div>📚</div>

            <h3>
              Belum ada bank soal
            </h3>

            <p>
              Jadilah mahasiswa pertama yang
              membagikan bank soal.
            </p>
          </div>
        ) : (
          <div className="question-banks-list">
            {questionBanks.map(
              (questionBank) => {
                const ownerId =
                  Number(
                    questionBank.user_id
                  );

                const currentUserId =
                  Number(user?.id);

                const isOwner =
                  ownerId === currentUserId;

                return (
                  <article
                    className="question-bank-card"
                    key={questionBank.id}
                  >
                    <div className="question-bank-card-top">
                      <div>
                        <span className="question-bank-exam-badge">
                          {questionBank.exam_type}
                        </span>

                        {questionBank.subject && (
                          <span className="question-bank-subject">
                            {questionBank.subject}
                          </span>
                        )}
                      </div>

                      {isOwner && (
                        <button
                          type="button"
                          className="question-bank-delete"
                          disabled={
                            deletingId ===
                            questionBank.id
                          }
                          onClick={() =>
                            handleDelete(
                              questionBank
                            )
                          }
                        >
                          {deletingId ===
                          questionBank.id
                            ? "Menghapus..."
                            : "Hapus"}
                        </button>
                      )}
                    </div>

                    <h3>
                      {questionBank.title}
                    </h3>

                    {questionBank.description && (
                      <p className="question-bank-description">
                        {questionBank.description}
                      </p>
                    )}

                    <div className="question-bank-card-footer">
                      <div className="question-bank-author">
                        <strong>
                          {questionBank.user
                            ?.name ||
                            "Mahasiswa"}
                        </strong>

                        <span>
                          {formatDate(
                            questionBank.created_at
                          )}
                        </span>
                      </div>

                      {questionBank.file_url && (
                        <a
                          href={
                            questionBank.file_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="question-bank-link"
                        >
                          📄 Lihat Bank Soal
                        </a>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default QuestionBanksPage;
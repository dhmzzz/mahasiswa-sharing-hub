import { useEffect, useState } from "react";
import { api } from "../services/api";
import "./InternshipPage.css";

function InternshipPage({ user }) {
  const [internships, setInternships] = useState([]);

  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [deadline, setDeadline] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadInternships() {
    setIsLoading(true);
    setError("");

    try {
      const result = await api.get("/internships");

      setInternships(result.data ?? []);
    } catch (requestError) {
      console.error(
        "Gagal mengambil informasi magang:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Gagal mengambil informasi magang."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInternships();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/internships", {
        company_name: companyName,
        position,
        description,
        location,
        application_url: applicationUrl,
        deadline: deadline || null,
      });

      setCompanyName("");
      setPosition("");
      setDescription("");
      setLocation("");
      setApplicationUrl("");
      setDeadline("");

      setSuccess(
        "Informasi magang berhasil dibagikan."
      );

      await loadInternships();
    } catch (requestError) {
      console.error(
        "Gagal membuat informasi magang:",
        requestError
      );

      setError(
        requestError.message ||
          "Gagal membagikan informasi magang."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(internship) {
    const confirmed = window.confirm(
      `Hapus informasi magang di ${internship.company_name}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/internships/${internship.id}`
      );

      setSuccess(
        "Informasi magang berhasil dihapus."
      );

      await loadInternships();
    } catch (requestError) {
      console.error(
        "Gagal menghapus informasi magang:",
        requestError
      );

      setError(
        requestError.message ||
          "Gagal menghapus informasi magang."
      );
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

  function isDeadlinePassed(deadlineDate) {
    if (!deadlineDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineValue = new Date(deadlineDate);
    deadlineValue.setHours(0, 0, 0, 0);

    return deadlineValue < today;
  }

  if (isLoading) {
    return (
      <div className="internship-page">
        <div className="internship-loading">
          Memuat informasi magang...
        </div>
      </div>
    );
  }

  return (
    <div className="internship-page">

      <div className="internship-header">
        <p className="internship-eyebrow">
          SHARING HUB
        </p>

        <h1>Internship</h1>

        <p>
          Temukan dan bagikan informasi kesempatan
          magang untuk mahasiswa.
        </p>
      </div>

      {error && (
        <div className="internship-error">
          {error}
        </div>
      )}

      {success && (
        <div className="internship-success">
          {success}
        </div>
      )}

      <section className="internship-form-card">

        <div className="internship-form-header">
          <h2>Bagikan Informasi Magang</h2>

          <p>
            Bantu mahasiswa lain menemukan kesempatan
            magang yang menarik.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="internship-form-grid">

            <div className="internship-field">
              <label htmlFor="company-name">
                Nama Perusahaan
              </label>

              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(event) =>
                  setCompanyName(event.target.value)
                }
                placeholder="Contoh: PT Teknologi Indonesia"
                required
              />
            </div>

            <div className="internship-field">
              <label htmlFor="internship-position">
                Posisi
              </label>

              <input
                id="internship-position"
                type="text"
                value={position}
                onChange={(event) =>
                  setPosition(event.target.value)
                }
                placeholder="Contoh: Frontend Developer Intern"
                required
              />
            </div>

            <div className="internship-field">
              <label htmlFor="internship-location">
                Lokasi
              </label>

              <input
                id="internship-location"
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="Contoh: Jakarta / Remote"
              />
            </div>

            <div className="internship-field">
              <label htmlFor="internship-deadline">
                Deadline
              </label>

              <input
                id="internship-deadline"
                type="date"
                value={deadline}
                onChange={(event) =>
                  setDeadline(event.target.value)
                }
              />
            </div>

          </div>

          <div className="internship-field">
            <label htmlFor="application-url">
              Link Pendaftaran
            </label>

            <input
              id="application-url"
              type="url"
              value={applicationUrl}
              onChange={(event) =>
                setApplicationUrl(event.target.value)
              }
              placeholder="https://..."
            />
          </div>

          <div className="internship-field">
            <label htmlFor="internship-description">
              Deskripsi
            </label>

            <textarea
              id="internship-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Jelaskan informasi magang..."
              rows="5"
            />
          </div>

          <button
            type="submit"
            className="internship-submit"
            disabled={isSaving}
          >
            {isSaving
              ? "Menyimpan..."
              : "Bagikan Informasi Magang"}
          </button>

        </form>
      </section>

      <section className="internship-list-section">

        <div className="internship-list-header">

          <div>
            <h2>Magang Terbaru</h2>

            <p>
              Kesempatan magang yang dibagikan
              mahasiswa.
            </p>
          </div>

          <button
            type="button"
            className="internship-refresh"
            onClick={loadInternships}
          >
            Refresh
          </button>

        </div>

        {internships.length === 0 ? (
          <div className="internship-empty">

            <div>💼</div>

            <h3>
              Belum ada informasi magang
            </h3>

            <p>
              Jadilah mahasiswa pertama yang membagikan
              kesempatan magang.
            </p>

          </div>
        ) : (
          <div className="internship-list">

            {internships.map((internship) => {
              const ownerId =
                Number(internship.user_id);

              const currentUserId =
                Number(user?.id);

              const isOwner =
                ownerId === currentUserId;

              const deadlinePassed =
                isDeadlinePassed(
                  internship.deadline
                );

              return (
                <article
                  className="internship-card"
                  key={internship.id}
                >

                  <div className="internship-card-top">

                    <div>
                      <span className="internship-badge">
                        MAGANG
                      </span>

                      {internship.location && (
                        <span className="internship-location">
                          {internship.location}
                        </span>
                      )}
                    </div>

                    {isOwner && (
                      <button
                        type="button"
                        className="internship-delete"
                        onClick={() =>
                          handleDelete(internship)
                        }
                      >
                        Hapus
                      </button>
                    )}

                  </div>

                  <h3>
                    {internship.position}
                  </h3>

                  <p className="internship-company">
                    {internship.company_name}
                  </p>

                  {internship.description && (
                    <p className="internship-description">
                      {internship.description}
                    </p>
                  )}

                  <div className="internship-meta">

                    <div className="internship-deadline">

                      <span>
                        Deadline
                      </span>

                      <strong
                        className={
                          deadlinePassed
                            ? "deadline-passed"
                            : ""
                        }
                      >
                        {internship.deadline
                          ? formatDate(
                              internship.deadline
                            )
                          : "Tidak ditentukan"}
                      </strong>

                    </div>

                    <div className="internship-author">

                      <strong>
                        {internship.user?.name ||
                          "Mahasiswa"}
                      </strong>

                      <span>
                        Dibagikan{" "}
                        {formatDate(
                          internship.created_at
                        )}
                      </span>

                    </div>

                  </div>

                  {internship.application_url && (
                    <a
                      href={internship.application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="internship-apply"
                    >
                      Lihat Pendaftaran
                    </a>
                  )}

                </article>
              );
            })}

          </div>
        )}

      </section>

    </div>
  );
}

export default InternshipPage;
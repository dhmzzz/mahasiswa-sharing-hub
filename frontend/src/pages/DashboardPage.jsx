import { useEffect, useState } from "react";
import { api } from "../services/api";
import "./DashboardPage.css";

function DashboardPage({ user }) {
  const [confessions, setConfessions] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setIsLoading(true);
    setError("");

    try {
      const [confessionsResult, materialsResult] =
        await Promise.all([
          api.get("/confessions"),
          api.get("/materials"),
        ]);

      setConfessions(confessionsResult.data ?? []);
      setMaterials(materialsResult.data ?? []);
    } catch (requestError) {
      console.error(
        "Gagal mengambil data dashboard:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Gagal mengambil data dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleDeleteConfession(id) {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus confession ini?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/confessions/${id}`);

      setConfessions((current) =>
        current.filter(
          (confession) => confession.id !== id
        )
      );
    } catch (requestError) {
      console.error(
        "Gagal menghapus confession:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Gagal menghapus confession."
      );
    }
  }

  async function handleDeleteMaterial(id) {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus materi ini?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/materials/${id}`);

      setMaterials((current) =>
        current.filter(
          (material) => material.id !== id
        )
      );
    } catch (requestError) {
      console.error(
        "Gagal menghapus materi:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Gagal menghapus materi."
      );
    }
  }

  return (
    <section className="dashboard-page">

      {/* Welcome */}

      <div className="dashboard-welcome">
        <p className="dashboard-eyebrow">
          BERANDA
        </p>

        <h1>
          Halo, {user?.name || "Mahasiswa"} 👋
        </h1>

        <p>
          Bagikan cerita, pengalaman, dan informasi
          seputar kehidupan perkuliahan.
        </p>
      </div>

      {/* Create Post */}

      <div className="create-post-card">

        <div className="create-post-avatar">
          {user?.name
            ? user.name.charAt(0).toUpperCase()
            : "M"}
        </div>

        <div className="create-post-content">

          <button
            type="button"
            onClick={() => {
              window.location.href = "/confession";
            }}
          >
            Apa yang ingin kamu ceritakan?
          </button>

          <div className="create-post-info">
            <span>
              💬 Buat Confession
            </span>

            <span>
              🔒 Bisa anonim
            </span>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/materials";
              }}
            >
              📚 Bagikan Materi
            </button>
          </div>

        </div>

      </div>

      {/* Feed Header */}

      <div className="feed-header">

        <div>
          <h2>Beranda</h2>

          <p>
            Cerita dan informasi terbaru dari mahasiswa
          </p>
        </div>

        <button
          className="refresh-button"
          type="button"
          onClick={loadDashboard}
          disabled={isLoading}
        >
          {isLoading
            ? "Memuat..."
            : "↻ Refresh"}
        </button>

      </div>

      {/* Error */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* Loading */}

      {isLoading && (
        <div className="feed-loading">
          <div className="loading-spinner"></div>

          <p>
            Memuat postingan...
          </p>
        </div>
      )}

      {!isLoading && (
        <>
          {/* =========================
              CONFESSION SECTION
          ========================== */}

          {confessions.length > 0 && (
            <section className="dashboard-feed-section">

              <div className="dashboard-section-heading">
                <div>
                  <span className="dashboard-section-icon">
                    💬
                  </span>

                  <div>
                    <h2>
                      Confession Terbaru
                    </h2>

                    <p>
                      Cerita dan keluh kesah mahasiswa
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      "/confession";
                  }}
                >
                  Buat Confession
                </button>
              </div>

              <div className="social-feed">

                {confessions.map((confession) => {

                  const isOwner =
                    user &&
                    Number(confession.user_id) ===
                      Number(user.id);

                  const authorName =
                    confession.is_anonymous
                      ? "Anonim"
                      : confession.user?.name ||
                        "Mahasiswa";

                  const authorInitial =
                    confession.is_anonymous
                      ? "A"
                      : authorName
                          .charAt(0)
                          .toUpperCase();

                  const createdAt =
                    confession.created_at
                      ? new Date(
                          confession.created_at
                        ).toLocaleString("id-ID")
                      : "";

                  return (
                    <article
                      className="social-post"
                      key={confession.id}
                    >

                      <div className="post-header">

                        <div className="post-user">

                          <div className="post-avatar">
                            {authorInitial}
                          </div>

                          <div className="post-user-info">

                            <strong>
                              {authorName}
                            </strong>

                            <span>
                              {createdAt}
                            </span>

                          </div>

                        </div>

                        {isOwner && (
                          <button
                            className="post-menu"
                            type="button"
                            onClick={() =>
                              handleDeleteConfession(
                                confession.id
                              )
                            }
                            title="Hapus confession"
                          >
                            ⋯
                          </button>
                        )}

                      </div>

                      <div className="post-content">
                        <p>
                          {confession.content}
                        </p>
                      </div>

                      <div className="post-footer">

                        <button
                          type="button"
                          className="post-action"
                        >
                          ♡
                          <span>
                            Suka
                          </span>
                        </button>

                        <button
                          type="button"
                          className="post-action"
                        >
                          💬
                          <span>
                            Komentar
                          </span>
                        </button>

                        <button
                          type="button"
                          className="post-action"
                        >
                          ↗
                          <span>
                            Bagikan
                          </span>
                        </button>

                      </div>

                    </article>
                  );
                })}

              </div>

            </section>
          )}

          {/* =========================
              MATERIAL SECTION
          ========================== */}

          {materials.length > 0 && (
            <section className="dashboard-feed-section">

              <div className="dashboard-section-heading">
                <div>
                  <span className="dashboard-section-icon">
                    📚
                  </span>

                  <div>
                    <h2>
                      Materi Kuliah Terbaru
                    </h2>

                    <p>
                      Bahan belajar yang dibagikan mahasiswa
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      "/materials";
                  }}
                >
                  Lihat Semua
                </button>
              </div>

              <div className="materials-dashboard-list">

                {materials.map((material) => {

                  const isOwner =
                    user &&
                    Number(material.user_id) ===
                      Number(user.id);

                  const createdAt =
                    material.created_at
                      ? new Date(
                          material.created_at
                        ).toLocaleString("id-ID")
                      : "";

                  const materialAuthor =
                    material.user?.name ||
                    "Mahasiswa";

                  return (
                    <article
                      className="dashboard-material-card"
                      key={material.id}
                    >

                      <div className="dashboard-material-top">

                        <div className="dashboard-material-icon">
                          📚
                        </div>

                        <div className="dashboard-material-info">

                          <h3>
                            {material.title}
                          </h3>

                          <span className="dashboard-material-subject">
                            {material.subject ||
                              "Tanpa mata kuliah"}
                          </span>

                        </div>

                      </div>

                      {material.description && (
                        <p className="dashboard-material-description">
                          {material.description}
                        </p>
                      )}

                      <div className="dashboard-material-meta">

                        <span>
                          👤 {materialAuthor}
                        </span>

                        {createdAt && (
                          <span>
                            🕒 {createdAt}
                          </span>
                        )}

                      </div>

                      <div className="dashboard-material-footer">

                        {material.file_url ? (
                          <a
                            href={material.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="dashboard-material-link"
                          >
                            Buka Materi ↗
                          </a>
                        ) : (
                          <span className="dashboard-material-no-link">
                            Tidak ada tautan
                          </span>
                        )}

                        {isOwner && (
                          <button
                            type="button"
                            className="dashboard-material-delete"
                            onClick={() =>
                              handleDeleteMaterial(
                                material.id
                              )
                            }
                          >
                            Hapus
                          </button>
                        )}

                      </div>

                    </article>
                  );
                })}

              </div>

            </section>
          )}

          {/* =========================
              EMPTY STATE
          ========================== */}

          {confessions.length === 0 &&
            materials.length === 0 && (
              <div className="empty-feed">

                <div className="empty-feed-icon">
                  💬
                </div>

                <h3>
                  Belum ada postingan
                </h3>

                <p>
                  Jadilah mahasiswa pertama yang
                  membagikan cerita atau materi.
                </p>

                <div className="empty-feed-actions">

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "/confession";
                    }}
                  >
                    Buat Confession
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "/materials";
                    }}
                  >
                    Bagikan Materi
                  </button>

                </div>

              </div>
            )}

        </>
      )}

    </section>
  );
}

export default DashboardPage;
import { useEffect, useState } from "react";
import { api } from "../services/api";
import "./MaterialsPage.css";

function MaterialsPage() {
  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [materials, setMaterials] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadMaterials() {
    setIsLoading(true);
    setError("");

    try {
      const result = await api.get("/materials");

      setMaterials(result.data ?? []);
    } catch (requestError) {
      console.error(
        "Gagal mengambil daftar materi:",
        requestError
      );

      setError(
        requestError.message ||
          "Gagal mengambil daftar materi."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    setError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Judul materi wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const formData = new FormData();

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "subject",
        form.subject.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const result = await api.post(
        "/materials",
        formData
      );

      setForm({
        title: "",
        subject: "",
        description: "",
      });

      setSelectedFile(null);

      const fileInput =
        document.getElementById("material-file");

      if (fileInput) {
        fileInput.value = "";
      }

      setSuccessMessage(
        "Materi berhasil dibagikan."
      );

      if (result.data) {
        setMaterials((current) => [
          result.data,
          ...current,
        ]);
      } else {
        await loadMaterials();
      }
    } catch (requestError) {
      console.error(
        "Gagal membagikan materi:",
        requestError
      );

      setError(
        requestError.message ||
          "Gagal membagikan materi."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(materialId) {
    const confirmed = window.confirm(
      "Yakin ingin menghapus materi ini?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(materialId);
    setError("");
    setSuccessMessage("");

    try {
      await api.delete(
        `/materials/${materialId}`
      );

      setMaterials((current) =>
        current.filter(
          (material) =>
            material.id !== materialId
        )
      );

      setSuccessMessage(
        "Materi berhasil dihapus."
      );
    } catch (requestError) {
      console.error(
        "Gagal menghapus materi:",
        requestError
      );

      setError(
        requestError.message ||
          "Gagal menghapus materi."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="materials-page">
      <div className="materials-heading">
        <div>
          <p className="materials-eyebrow">
            PEMBELAJARAN
          </p>

          <h1>Materi Kuliah</h1>

          <p>
            Bagikan bahan belajar yang bermanfaat
            untuk mahasiswa lainnya.
          </p>
        </div>
      </div>

      {error && (
        <div
          className="materials-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          className="materials-success"
          role="status"
        >
          ✓ {successMessage}
        </div>
      )}

      <div className="materials-create-wrapper">
        <form
          className="materials-form"
          onSubmit={handleSubmit}
        >
          <div className="materials-form-header">
            <div className="materials-icon">
              📚
            </div>

            <div>
              <h2>Bagikan Materi</h2>

              <p>
                Bantu mahasiswa lain dengan
                membagikan bahan belajar.
              </p>
            </div>
          </div>

          <div className="materials-field">
            <label htmlFor="material-title">
              Judul materi
            </label>

            <input
              id="material-title"
              name="title"
              type="text"
              value={form.title}
              onChange={updateField}
              placeholder="Contoh: Modul Pemrograman Web"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="materials-field">
            <label htmlFor="material-subject">
              Mata kuliah
            </label>

            <input
              id="material-subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={updateField}
              placeholder="Contoh: Pemrograman Web"
              disabled={isSubmitting}
            />
          </div>

          <div className="materials-field">
            <label htmlFor="material-description">
              Deskripsi
            </label>

            <textarea
              id="material-description"
              name="description"
              value={form.description}
              onChange={updateField}
              placeholder="Jelaskan isi materi secara singkat..."
              rows={6}
              disabled={isSubmitting}
            />
          </div>

          <div className="materials-field">
            <label htmlFor="material-file">
              File materi
            </label>

            <input
              id="material-file"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />

            <span className="materials-helper">
              Format: PDF, DOC, DOCX, PPT, PPTX,
              XLS, XLSX. Maksimal 10 MB.
            </span>

            {selectedFile && (
              <span className="materials-selected-file">
                File dipilih:{" "}
                <strong>
                  {selectedFile.name}
                </strong>
              </span>
            )}
          </div>

          <button
            className="materials-submit-button"
            type="submit"
            disabled={
              isSubmitting ||
              !form.title.trim()
            }
          >
            {isSubmitting
              ? "Mengunggah..."
              : "Bagikan Materi"}
          </button>
        </form>
      </div>

      <section className="materials-list-section">
        <div className="materials-list-header">
          <div>
            <h2>Materi Tersedia</h2>

            <p>
              Bahan belajar yang telah dibagikan
              oleh mahasiswa.
            </p>
          </div>

          <button
            type="button"
            className="materials-refresh-button"
            onClick={loadMaterials}
            disabled={isLoading}
          >
            {isLoading
              ? "Memuat..."
              : "Refresh"}
          </button>
        </div>

        {isLoading ? (
          <div className="materials-empty">
            Memuat materi...
          </div>
        ) : materials.length === 0 ? (
          <div className="materials-empty">
            <div className="materials-empty-icon">
              📚
            </div>

            <h3>
              Belum ada materi
            </h3>

            <p>
              Jadilah mahasiswa pertama yang
              membagikan materi.
            </p>
          </div>
        ) : (
          <div className="materials-list">
            {materials.map((material) => (
              <article
                className="material-card"
                key={material.id}
              >
                <div className="material-card-content">
                  <div className="material-card-icon">
                    📄
                  </div>

                  <div className="material-card-info">
                    <h3>
                      {material.title}
                    </h3>

                    {material.subject && (
                      <p className="material-subject">
                        {material.subject}
                      </p>
                    )}

                    {material.description && (
                      <p className="material-description">
                        {material.description}
                      </p>
                    )}

                    {material.user && (
                      <span className="material-author">
                        Dibagikan oleh{" "}
                        <strong>
                          {material.user.name}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="material-card-actions">
                  {material.file_url && (
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="material-file-button"
                    >
                      📄 Lihat File
                    </a>
                  )}

                  {Number(material.user_id) ===
                    Number(
                      JSON.parse(
                        localStorage.getItem(
                          "user"
                        ) || "null"
                      )?.id
                    ) && (
                    <button
                      type="button"
                      className="material-delete-button"
                      disabled={
                        deletingId ===
                        material.id
                      }
                      onClick={() =>
                        handleDelete(
                          material.id
                        )
                      }
                    >
                      {deletingId ===
                      material.id
                        ? "Menghapus..."
                        : "Hapus"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default MaterialsPage;
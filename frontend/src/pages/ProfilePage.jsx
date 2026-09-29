import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { api } from "../services/api";
import "./ProfilePage.css";

function ProfilePage({ onProfileUpdated }) {
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [studentId, setStudentId] = useState("");
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [major, setMajor] = useState("");
  const [semester, setSemester] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [confessions, setConfessions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [internships, setInternships] = useState([]);

  const [activeTab, setActiveTab] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================
     PHOTO CROPPER
  ========================== */

  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState("");

  async function loadProfileData() {
    setIsLoading(true);
    setError("");

    try {
      const profileResult = await api.get("/profile");

      const profile = profileResult.data?.user;
      const studentProfile = profileResult.data?.profile;

      setUser(profile);

      setName(profile?.name || "");
      setEmail(profile?.email || "");

      setStudentId(studentProfile?.student_id || "");
      setUniversity(studentProfile?.university || "");
      setFaculty(studentProfile?.faculty || "");
      setMajor(studentProfile?.major || "");
      setSemester(studentProfile?.semester || "");
      setBio(studentProfile?.bio || "");

      setPhotoPreview(studentProfile?.photo_url || "");

      if (onProfileUpdated) {
        onProfileUpdated(profile);
      }

      const [
        confessionsResult,
        materialsResult,
        questionBanksResult,
        internshipsResult,
      ] = await Promise.all([
        api.get("/confessions"),
        api.get("/materials"),
        api.get("/question-banks"),
        api.get("/internships"),
      ]);

      const currentUserId = Number(profile?.id);

      const allConfessions =
        confessionsResult.data ?? [];

      const allMaterials =
        materialsResult.data ?? [];

      const allQuestionBanks =
        questionBanksResult.data ?? [];

      const allInternships =
        internshipsResult.data ?? [];

      setConfessions(
        allConfessions.filter(
          (item) =>
            Number(item.user_id) === currentUserId
        )
      );

      setMaterials(
        allMaterials.filter(
          (item) =>
            Number(item.user_id) === currentUserId
        )
      );

      setQuestionBanks(
        allQuestionBanks.filter(
          (item) =>
            Number(item.user_id) === currentUserId
        )
      );

      setInternships(
        allInternships.filter(
          (item) =>
            Number(item.user_id) === currentUserId
        )
      );
    } catch (requestError) {
      console.error(
        "Gagal mengambil data profil:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Gagal mengambil data profil."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProfileData();
  }, []);

  /* =========================
     PHOTO SELECTION
  ========================== */

  function handlePhotoChange(event) {
    const selectedPhoto =
      event.target.files?.[0];

    if (!selectedPhoto) {
      return;
    }

    const previewUrl =
      URL.createObjectURL(selectedPhoto);

    setSelectedPhotoUrl(previewUrl);
    setShowCropper(true);

    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);
  }

  function handleCropComplete(
    _,
    croppedPixels
  ) {
    setCroppedAreaPixels(croppedPixels);
  }

  async function createCroppedImage() {
    if (
      !selectedPhotoUrl ||
      !croppedAreaPixels
    ) {
      return;
    }

    const image = new Image();

    image.src = selectedPhotoUrl;

    await new Promise(
      (resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      }
    );

    const canvas =
      document.createElement("canvas");

    const size = 500;

    canvas.width = size;
    canvas.height = size;

    const context =
      canvas.getContext("2d");

    context.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      size,
      size
    );

    return new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new Error(
                  "Gagal membuat foto hasil crop."
                )
              );

              return;
            }

            resolve(blob);
          },
          "image/jpeg",
          0.9
        );
      }
    );
  }

  async function handleApplyCrop() {
    try {
      const croppedBlob =
        await createCroppedImage();

      if (!croppedBlob) {
        return;
      }

      const croppedFile =
        new File(
          [croppedBlob],
          "profile-photo.jpg",
          {
            type: "image/jpeg",
          }
        );

      const croppedPreviewUrl =
        URL.createObjectURL(
          croppedBlob
        );

      setPhoto(croppedFile);
      setPhotoPreview(
        croppedPreviewUrl
      );

      setShowCropper(false);

      if (selectedPhotoUrl) {
        URL.revokeObjectURL(
          selectedPhotoUrl
        );
      }

      setSelectedPhotoUrl("");
    } catch (error) {
      console.error(
        "Gagal melakukan crop foto:",
        error
      );
    }
  }

  function handleCancelCrop() {
    setShowCropper(false);

    if (selectedPhotoUrl) {
      URL.revokeObjectURL(
        selectedPhotoUrl
      );
    }

    setSelectedPhotoUrl("");

    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);
  }

  /* =========================
     PROFILE SUBMIT
  ========================== */

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const formData =
        new FormData();

      formData.append(
        "name",
        name
      );

      formData.append(
        "student_id",
        studentId
      );

      formData.append(
        "university",
        university
      );

      formData.append(
        "faculty",
        faculty
      );

      formData.append(
        "major",
        major
      );

      formData.append(
        "semester",
        semester
      );

      formData.append(
        "bio",
        bio
      );

      if (photo) {
        formData.append(
          "photo",
          photo
        );
      }

      const result =
        await api.post(
          "/profile",
          formData
        );

      const updatedUser =
        result.data?.user;

      const updatedProfile =
        result.data?.profile;

      setUser(updatedUser);

      setName(
        updatedUser?.name || ""
      );

      setEmail(
        updatedUser?.email || ""
      );

      setStudentId(
        updatedProfile?.student_id ||
          ""
      );

      setUniversity(
        updatedProfile?.university ||
          ""
      );

      setFaculty(
        updatedProfile?.faculty ||
          ""
      );

      setMajor(
        updatedProfile?.major ||
          ""
      );

      setSemester(
        updatedProfile?.semester ||
          ""
      );

      setBio(
        updatedProfile?.bio || ""
      );

      setPhoto(null);

      setPhotoPreview(
        updatedProfile?.photo_url ||
          ""
      );

      if (onProfileUpdated) {
        onProfileUpdated(
          updatedUser
        );
      }

      setSuccess(
        "Profil berhasil diperbarui."
      );
    } catch (requestError) {
      console.error(
        "Gagal memperbarui profil:",
        requestError
      );

      const validationErrors =
        requestError.response?.data
          ?.errors;

      if (validationErrors) {
        const messages =
          Object.values(
            validationErrors
          )
            .flat()
            .join(" ");

        setError(messages);
      } else {
        setError(
          requestError.response?.data
            ?.message ||
            requestError.message ||
            "Gagal memperbarui profil."
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  /* =========================
     DELETE CONFESSION
  ========================== */

  async function handleDeleteConfession(
    id
  ) {
    const confirmed =
      window.confirm(
        "Hapus confession ini?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/confessions/${id}`
      );

      setConfessions(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
          )
      );

      setSuccess(
        "Confession berhasil dihapus."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          requestError.message ||
          "Gagal menghapus confession."
      );
    }
  }

  /* =========================
     DELETE MATERIAL
  ========================== */

  async function handleDeleteMaterial(
    id
  ) {
    const confirmed =
      window.confirm(
        "Hapus materi ini?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/materials/${id}`
      );

      setMaterials(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
          )
      );

      setSuccess(
        "Materi berhasil dihapus."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          requestError.message ||
          "Gagal menghapus materi."
      );
    }
  }

  /* =========================
     LOGOUT
  ========================== */

function handleLogout() {
  const confirmed = window.confirm(
    "Apakah kamu yakin ingin keluar dari akun?"
  );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem("auth_token");

  window.location.href = "/login";
}

  const totalContributions =
    confessions.length +
    materials.length +
    questionBanks.length +
    internships.length;

  if (isLoading) {
    return (
      <section className="profile-page">
        <div className="profile-loading">
          Memuat profil...
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">

      {/* =========================
          PROFILE HEADER
      ========================== */}

      <div className="profile-header">

        <div>
          <p className="profile-eyebrow">
            AKUN
          </p>

          <h1>
            Profil Saya
          </h1>

          <p>
            Kelola informasi akun dan lihat
            semua kontribusi yang kamu bagikan.
          </p>
        </div>

      </div>

      {/* =========================
          PROFILE CARD
      ========================== */}

      <div className="profile-card">

        <div className="profile-avatar-large">

          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Foto profil"
            />
          ) : (
            name
              ? name
                  .charAt(0)
                  .toUpperCase()
              : "M"
          )}

        </div>

        <h2>
          {user?.name ||
            "Mahasiswa"}
        </h2>

        <p>
          {user?.email || "-"}
        </p>

        <label
          htmlFor="profile-photo"
          className="profile-photo-button"
        >
          Pilih Foto Profil
        </label>

        <input
          id="profile-photo"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          hidden
        />

        <div className="profile-contribution-count">

          <strong>
            {totalContributions}
          </strong>

          <span>
            Kontribusi
          </span>

        </div>

      </div>

      {/* =========================
          PROFILE FORM
      ========================== */}

      <form
        className="profile-form"
        onSubmit={handleSubmit}
      >

        <h2>
          Informasi Profil
        </h2>

        <label htmlFor="profile-name">
          Nama
        </label>

        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          required
        />

        <label htmlFor="profile-student-id">
          NIM
        </label>

        <input
          id="profile-student-id"
          type="text"
          value={studentId}
          onChange={(event) =>
            setStudentId(
              event.target.value
            )
          }
          placeholder="Masukkan NIM"
        />

        <label htmlFor="profile-university">
          Universitas
        </label>

        <input
          id="profile-university"
          type="text"
          value={university}
          onChange={(event) =>
            setUniversity(
              event.target.value
            )
          }
          placeholder="Nama universitas"
        />

        <label htmlFor="profile-faculty">
          Fakultas
        </label>

        <input
          id="profile-faculty"
          type="text"
          value={faculty}
          onChange={(event) =>
            setFaculty(
              event.target.value
            )
          }
          placeholder="Nama fakultas"
        />

        <label htmlFor="profile-major">
          Jurusan
        </label>

        <input
          id="profile-major"
          type="text"
          value={major}
          onChange={(event) =>
            setMajor(
              event.target.value
            )
          }
          placeholder="Nama jurusan"
        />

        <label htmlFor="profile-semester">
          Semester
        </label>

        <input
          id="profile-semester"
          type="text"
          value={semester}
          onChange={(event) =>
            setSemester(
              event.target.value
            )
          }
          placeholder="Contoh: 5"
        />

        <label htmlFor="profile-bio">
          Bio
        </label>

        <textarea
          id="profile-bio"
          value={bio}
          onChange={(event) =>
            setBio(
              event.target.value
            )
          }
          placeholder="Ceritakan sedikit tentang dirimu..."
          rows={4}
        />

        <label htmlFor="profile-email">
          Email
        </label>

        <input
          id="profile-email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          required
        />

        {error && (
          <div
            className="profile-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div className="profile-success">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
        >
          {isSaving
            ? "Menyimpan..."
            : "Simpan Perubahan"}
        </button>

      </form>

      {/* =========================
          MY CONTRIBUTIONS
      ========================== */}

      <section className="profile-contributions">

        <div className="profile-contributions-header">

          <div>
            <p className="profile-eyebrow">
              SHARING SAYA
            </p>

            <h2>
              Kontribusi Saya
            </h2>

            <p>
              Semua konten yang pernah kamu
              bagikan di Mahasiswa Hub.
            </p>
          </div>

        </div>

        {/* Tabs */}

        <div className="profile-tabs">

          <button
            type="button"
            className={
              activeTab === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("all")
            }
          >
            Semua
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "confessions"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "confessions"
              )
            }
          >
            💬 Confession
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "materials"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "materials"
              )
            }
          >
            📚 Materi
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "question-banks"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "question-banks"
              )
            }
          >
            📝 Question Bank
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "internships"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "internships"
              )
            }
          >
            💼 Internship
          </button>

        </div>

        {/* =========================
            ALL
        ========================== */}

        {activeTab === "all" && (
          <div className="profile-content-list">

            {totalContributions ===
            0 ? (
              <div className="profile-empty">

                <div>
                  📭
                </div>

                <h3>
                  Belum ada kontribusi
                </h3>

                <p>
                  Konten yang kamu bagikan akan
                  muncul di sini.
                </p>

              </div>
            ) : (
              <>

                {confessions.map(
                  (confession) => (
                    <article
                      className="profile-content-card"
                      key={`confession-${confession.id}`}
                    >

                      <div className="profile-content-card-header">

                        <span className="profile-content-type">
                          💬 Confession
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteConfession(
                              confession.id
                            )
                          }
                        >
                          Hapus
                        </button>

                      </div>

                      <p className="profile-content-text">
                        {
                          confession.content
                        }
                      </p>

                      <span className="profile-content-date">
                        {confession.created_at
                          ? new Date(
                              confession.created_at
                            ).toLocaleString(
                              "id-ID"
                            )
                          : ""}
                      </span>

                    </article>
                  )
                )}

                {materials.map(
                  (material) => (
                    <article
                      className="profile-content-card"
                      key={`material-${material.id}`}
                    >

                      <div className="profile-content-card-header">

                        <span className="profile-content-type">
                          📚 Materi Kuliah
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteMaterial(
                              material.id
                            )
                          }
                        >
                          Hapus
                        </button>

                      </div>

                      <h3>
                        {material.title}
                      </h3>

                      <span className="profile-content-subject">
                        {material.subject ||
                          "Tanpa mata kuliah"}
                      </span>

                      {material.description && (
                        <p className="profile-content-text">
                          {
                            material.description
                          }
                        </p>
                      )}

                     {material.file_url && (
                        <a
                          href={material.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="profile-content-link"
                        >
                          Buka Materi ↗
                        </a>
                      )}

                      <span className="profile-content-date">
                        {material.created_at
                          ? new Date(
                              material.created_at
                            ).toLocaleString(
                              "id-ID"
                            )
                          : ""}
                      </span>

                    </article>
                  )
                )}

                {questionBanks.map(
                  (questionBank) => (
                    <article
                      className="profile-content-card"
                      key={`question-bank-${questionBank.id}`}
                    >

                      <div className="profile-content-card-header">

                        <span className="profile-content-type">
                          📝 Question Bank
                        </span>

                      </div>

                      <h3>
                        {questionBank.title ||
                          questionBank.name ||
                          "Question Bank"}
                      </h3>

                      {questionBank.description && (
                        <p className="profile-content-text">
                          {
                            questionBank.description
                          }
                        </p>
                      )}

                      <span className="profile-content-date">
                        {questionBank.created_at
                          ? new Date(
                              questionBank.created_at
                            ).toLocaleString(
                              "id-ID"
                            )
                          : ""}
                      </span>

                    </article>
                  )
                )}

                {internships.map(
                  (internship) => (
                    <article
                      className="profile-content-card"
                      key={`internship-${internship.id}`}
                    >

                      <div className="profile-content-card-header">

                        <span className="profile-content-type">
                          💼 Internship
                        </span>

                      </div>

                      <h3>
                        {internship.title ||
                          internship.company ||
                          "Informasi Internship"}
                      </h3>

                      {internship.description && (
                        <p className="profile-content-text">
                          {
                            internship.description
                          }
                        </p>
                      )}

                      <span className="profile-content-date">
                        {internship.created_at
                          ? new Date(
                              internship.created_at
                            ).toLocaleString(
                              "id-ID"
                            )
                          : ""}
                      </span>

                    </article>
                  )
                )}

              </>
            )}

          </div>
        )}

        {/* =========================
            CONFESSIONS
        ========================== */}

        {activeTab === "confessions" && (
          <div className="profile-content-list">

            {confessions.length ===
            0 ? (
              <div className="profile-empty">

                <div>
                  💬
                </div>

                <h3>
                  Belum ada confession
                </h3>

                <p>
                  Confession yang kamu buat akan
                  muncul di sini.
                </p>

              </div>
            ) : (
              confessions.map(
                (confession) => (
                  <article
                    className="profile-content-card"
                    key={confession.id}
                  >

                    <div className="profile-content-card-header">

                      <span className="profile-content-type">
                        💬 Confession
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteConfession(
                            confession.id
                          )
                        }
                      >
                        Hapus
                      </button>

                    </div>

                    <p className="profile-content-text">
                      {
                        confession.content
                      }
                    </p>

                    <span className="profile-content-date">
                      {confession.created_at
                        ? new Date(
                            confession.created_at
                          ).toLocaleString(
                            "id-ID"
                          )
                        : ""}
                    </span>

                  </article>
                )
              )
            )}

          </div>
        )}

        {/* =========================
            MATERIALS
        ========================== */}

        {activeTab === "materials" && (
          <div className="profile-content-list">

            {materials.length ===
            0 ? (
              <div className="profile-empty">

                <div>
                  📚
                </div>

                <h3>
                  Belum ada materi
                </h3>

                <p>
                  Materi yang kamu bagikan akan
                  muncul di sini.
                </p>

              </div>
            ) : (
              materials.map(
                (material) => (
                  <article
                    className="profile-content-card"
                    key={material.id}
                  >

                    <div className="profile-content-card-header">

                      <span className="profile-content-type">
                        📚 Materi Kuliah
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteMaterial(
                            material.id
                          )
                        }
                      >
                        Hapus
                      </button>

                    </div>

                    <h3>
                      {material.title}
                    </h3>

                    <span className="profile-content-subject">
                      {material.subject ||
                        "Tanpa mata kuliah"}
                    </span>

                    {material.description && (
                      <p className="profile-content-text">
                        {
                          material.description
                        }
                      </p>
                    )}

                    {material.file_path && (
                      <a
                        href={
                          material.file_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="profile-content-link"
                      >
                        Buka Materi ↗
                      </a>
                    )}

                    <span className="profile-content-date">
                      {material.created_at
                        ? new Date(
                            material.created_at
                          ).toLocaleString(
                            "id-ID"
                          )
                        : ""}
                    </span>

                  </article>
                )
              )
            )}

          </div>
        )}

        {/* =========================
            QUESTION BANK
        ========================== */}

        {activeTab ===
          "question-banks" && (
          <div className="profile-content-list">

            {questionBanks.length ===
            0 ? (
              <div className="profile-empty">

                <div>
                  📝
                </div>

                <h3>
                  Belum ada question bank
                </h3>

                <p>
                  Question bank yang kamu bagikan
                  akan muncul di sini.
                </p>

              </div>
            ) : (
              questionBanks.map(
                (questionBank) => (
                  <article
                    className="profile-content-card"
                    key={questionBank.id}
                  >

                    <div className="profile-content-card-header">

                      <span className="profile-content-type">
                        📝 Question Bank
                      </span>

                    </div>

                    <h3>
                      {questionBank.title ||
                        questionBank.name ||
                        "Question Bank"}
                    </h3>

                    {questionBank.description && (
                      <p className="profile-content-text">
                        {
                          questionBank.description
                        }
                      </p>
                    )}

                    <span className="profile-content-date">
                      {questionBank.created_at
                        ? new Date(
                            questionBank.created_at
                          ).toLocaleString(
                            "id-ID"
                          )
                        : ""}
                    </span>

                  </article>
                )
              )
            )}

          </div>
        )}

        {/* =========================
            INTERNSHIPS
        ========================== */}

        {activeTab ===
          "internships" && (
          <div className="profile-content-list">

            {internships.length ===
            0 ? (
              <div className="profile-empty">

                <div>
                  💼
                </div>

                <h3>
                  Belum ada informasi internship
                </h3>

                <p>
                  Informasi internship yang kamu
                  bagikan akan muncul di sini.
                </p>

              </div>
            ) : (
              internships.map(
                (internship) => (
                  <article
                    className="profile-content-card"
                    key={internship.id}
                  >

                    <div className="profile-content-card-header">

                      <span className="profile-content-type">
                        💼 Internship
                      </span>

                    </div>

                    <h3>
                      {internship.title ||
                        internship.company ||
                        "Informasi Internship"}
                    </h3>

                    {internship.description && (
                      <p className="profile-content-text">
                        {
                          internship.description
                        }
                      </p>
                    )}

                    <span className="profile-content-date">
                      {internship.created_at
                        ? new Date(
                            internship.created_at
                          ).toLocaleString(
                            "id-ID"
                          )
                        : ""}
                    </span>

                  </article>
                )
              )
            )}

          </div>
        )}

      </section>

      {/* =========================
          PHOTO CROPPER MODAL
      ========================== */}

      {showCropper && (
        <div className="cropper-overlay">

          <div className="cropper-modal">

            <h3>
              Atur Foto Profil
            </h3>

            <div className="cropper-container">

              <Cropper
                image={
                  selectedPhotoUrl
                }
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={
                  setCrop
                }
                onCropComplete={
                  handleCropComplete
                }
                onZoomChange={
                  setZoom
                }
              />

            </div>

            <div className="cropper-zoom">

              <span>
                Zoom
              </span>

              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) =>
                  setZoom(
                    Number(
                      event.target.value
                    )
                  )
                }
              />

            </div>

            <div className="cropper-actions">

              <button
                type="button"
                onClick={
                  handleCancelCrop
                }
                className="cropper-cancel-button"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  handleApplyCrop
                }
                className="cropper-apply-button"
              >
                Pakai Foto
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          LOGOUT
      ========================== */}

      <div className="profile-logout">

        <button
          type="button"
          onClick={
            handleLogout
          }
        >
          Keluar dari Akun
        </button>

      </div>

    </section>
  );
}

export default ProfilePage;
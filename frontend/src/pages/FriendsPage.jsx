import { useEffect, useState } from "react";
import { api } from "../services/api";
import "./FriendsPage.css";

function FriendsPage({ user }) {
  const [friendships, setFriendships] = useState([]);

  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingFriendId, setAddingFriendId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

async function loadFriends() {
  setIsLoading(true);
  setError("");

  try {
    const result = await api.get("/friends");

    const sentRequests = result.sent_requests ?? [];
    const receivedRequests = result.received_requests ?? [];

    const allFriendships = [
      ...sentRequests,
      ...receivedRequests,
    ];

    setFriendships(allFriendships);
  } catch (requestError) {
    console.error(
      "Gagal mengambil daftar teman:",
      requestError
    );

    setError(
      requestError.message ||
        "Gagal mengambil daftar teman."
    );
  } finally {
    setIsLoading(false);
  }
}

async function loadQrCode() {
  if (!user?.id) {
    return;
  }

  try {
    const token = localStorage.getItem("auth_token");

    const response = await fetch(
      `http://127.0.0.1:8000/api/qr-code/profile/${user.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "image/png,image/svg+xml",
        },
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    console.log("QR Status:", response.status);
    console.log("QR Content-Type:", contentType);

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Response QR:",
        errorText
      );

      throw new Error(
        `Gagal mengambil QR Profile. Status ${response.status}`
      );
    }

    if (
      !contentType.includes("image/png") &&
      !contentType.includes("image/svg+xml") &&
      !contentType.includes("image/jpeg")
    ) {
      const responseText = await response.text();

      console.error(
        "Response QR bukan gambar:",
        responseText
      );

      throw new Error(
        "Server tidak mengembalikan gambar QR."
      );
    }

    const blob = await response.blob();

    const url = URL.createObjectURL(blob);

    setQrCodeUrl(url);
  } catch (requestError) {
    console.error(
      "Gagal mengambil QR Profile:",
      requestError
    );

    setQrCodeUrl("");
  }
}

useEffect(() => {
  loadFriends();
  loadQrCode();

  return () => {
    if (qrCodeUrl) {
      URL.revokeObjectURL(qrCodeUrl);
    }
  };
}, [user?.id]);

  async function handleSearch(event) {
    event.preventDefault();

    const keyword = searchName.trim();

    if (!keyword) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError("");
    setSuccess("");

    try {
      const result = await api.get(
        `/users/search?name=${encodeURIComponent(keyword)}`
      );

      setSearchResults(result.data ?? []);
    } catch (requestError) {
      console.error(
        "Gagal mencari user:",
        requestError
      );

      setError(
        requestError.message ||
          "Gagal mencari mahasiswa."
      );

      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleAddFriend(targetUser) {
    setAddingFriendId(targetUser.id);
    setError("");
    setSuccess("");

    try {
      await api.post("/friends", {
        friend_id: targetUser.id,
      });

      setSuccess(
        `Permintaan pertemanan ke ${targetUser.name} berhasil dikirim.`
      );

      setSearchResults((currentResults) =>
        currentResults.filter(
          (item) => item.id !== targetUser.id
        )
      );

      await loadFriends();
    } catch (requestError) {
      console.error(
        "Gagal menambahkan teman:",
        requestError
      );

      setError(
        requestError.message ||
          "Gagal menambahkan teman."
      );
    } finally {
      setAddingFriendId(null);
    }
  }

  async function handleAccept(friendshipId) {
    setProcessingId(friendshipId);
    setError("");
    setSuccess("");

    try {
      await api.put(
        `/friends/${friendshipId}/accept`
      );

      setSuccess(
        "Permintaan pertemanan berhasil diterima."
      );

      await loadFriends();
    } catch (requestError) {
      console.error(
        "Gagal menerima permintaan:",
        requestError
      );

      setError(
        requestError.message ||
          "Gagal menerima permintaan pertemanan."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(friendshipId) {
    const confirmed = window.confirm(
      "Hapus atau tolak hubungan pertemanan ini?"
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(friendshipId);
    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/friends/${friendshipId}`
      );

      setSuccess(
        "Hubungan pertemanan berhasil dihapus."
      );

      await loadFriends();
    } catch (requestError) {
      console.error(
        "Gagal menghapus pertemanan:",
        requestError
      );

      setError(
        requestError.message ||
          "Gagal menghapus pertemanan."
      );
    } finally {
      setProcessingId(null);
    }
  }

  function getFriendUser(friendship) {
    const currentUserId = Number(user?.id);

    const firstUser = friendship.user;
    const secondUser = friendship.friend;

    if (
      firstUser &&
      Number(firstUser.id) !== currentUserId
    ) {
      return firstUser;
    }

    if (
      secondUser &&
      Number(secondUser.id) !== currentUserId
    ) {
      return secondUser;
    }

    return secondUser || firstUser || null;
  }

  function getFriendName(friendship) {
    const friend = getFriendUser(friendship);

    return friend?.name || "Mahasiswa";
  }

  function getFriendEmail(friendship) {
    const friend = getFriendUser(friendship);

    return friend?.email || "-";
  }

  function isIncomingRequest(friendship) {
    const currentUserId = Number(user?.id);

    return (
      Number(friendship.friend_id) === currentUserId &&
      friendship.status === "pending"
    );
  }

  function getStatusLabel(status) {
    if (status === "accepted") {
      return "Teman";
    }

    if (status === "pending") {
      return "Menunggu";
    }

    return status || "-";
  }

  if (isLoading) {
    return (
      <div className="friends-page">
        <div className="friends-loading">
          Memuat daftar teman...
        </div>
      </div>
    );
  }

  return (
    <div className="friends-page">
      <div className="friends-header">
        <p className="friends-eyebrow">
          SOCIAL
        </p>

        <h1>Friends</h1>

        <p>
          Terhubung dengan mahasiswa lain dan bangun
          jaringan pertemanan di kampus.
        </p>
      </div>

      {error && (
        <div className="friends-error">
          {error}
        </div>
      )}

      {success && (
        <div className="friends-success">
          {success}
        </div>
      )}

      <section className="friends-add-card">
        <div className="friends-add-header">
          <div>
            <h2>Tambah Teman</h2>

            <p>
              Cari mahasiswa berdasarkan nama untuk
              menambahkan sebagai teman.
            </p>
          </div>
        </div>

        <form
          className="friends-add-form"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            value={searchName}
            onChange={(event) =>
              setSearchName(event.target.value)
            }
            placeholder="Cari nama mahasiswa..."
          />

          <button
            type="submit"
            disabled={isSearching}
          >
            {isSearching
              ? "Mencari..."
              : "Cari"}
          </button>
        </form>

        {searchName.trim() && (
          <div className="friends-search-results">
            {isSearching ? (
              <p className="friends-search-message">
                Mencari mahasiswa...
              </p>
            ) : searchResults.length === 0 ? (
              <p className="friends-search-message">
                Tidak ada mahasiswa yang ditemukan.
              </p>
            ) : (
              searchResults.map((foundUser) => (
                <div
                  className="friend-search-result"
                  key={foundUser.id}
                >
                  <div className="friend-avatar">
                    {foundUser.name
                      ?.charAt(0)
                      .toUpperCase() || "M"}
                  </div>

                  <div className="friend-search-info">
                    <h3>{foundUser.name}</h3>

                    <p>{foundUser.email}</p>
                  </div>

                  <button
                    type="button"
                    className="friend-add-button"
                    disabled={
                      addingFriendId === foundUser.id
                    }
                    onClick={() =>
                      handleAddFriend(foundUser)
                    }
                  >
                    {addingFriendId === foundUser.id
                      ? "Menambahkan..."
                      : "Tambah Teman"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      <section className="friends-qr-card">
        <div className="friends-qr-content">
          <div>
            <p className="friends-qr-eyebrow">
              QR PROFILE
            </p>

            <h2>Bagikan Profilmu</h2>

            <p>
              Gunakan QR Profile untuk memudahkan
              mahasiswa lain menemukan profilmu.
            </p>

            <span className="friends-user-id">
              User ID: {user?.id || "-"}
            </span>
          </div>

          <div className="friends-qr-box">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Profile"
              />
            ) : (
              <span>Memuat QR...</span>
            )}
          </div>
        </div>
      </section>

      <section className="friends-list-section">
        <div className="friends-list-header">
          <div>
            <h2>Daftar Pertemanan</h2>

            <p>
              Teman dan permintaan pertemananmu.
            </p>
          </div>

          <button
            type="button"
            className="friends-refresh"
            onClick={loadFriends}
          >
            Refresh
          </button>
        </div>

        {friendships.length === 0 ? (
          <div className="friends-empty">
            <div>👥</div>

            <h3>Belum ada pertemanan</h3>

            <p>
              Tambahkan mahasiswa lain untuk mulai
              membangun jaringan pertemanan.
            </p>
          </div>
        ) : (
          <div className="friends-list">
            {friendships.map((friendship) => {
              const incoming =
                isIncomingRequest(friendship);

              const friendName =
                getFriendName(friendship);

              const friendEmail =
                getFriendEmail(friendship);

              const initial =
                friendName
                  .charAt(0)
                  .toUpperCase();

              return (
                <article
                  className="friend-card"
                  key={friendship.id}
                >
                  <div className="friend-avatar">
                    {initial || "M"}
                  </div>

                  <div className="friend-info">
                    <h3>{friendName}</h3>

                    <p>{friendEmail}</p>

                    <span
                      className={`friend-status ${friendship.status}`}
                    >
                      {getStatusLabel(
                        friendship.status
                      )}
                    </span>
                  </div>

                  <div className="friend-actions">
                    {incoming && (
                      <button
                        type="button"
                        className="friend-accept"
                        disabled={
                          processingId ===
                          friendship.id
                        }
                        onClick={() =>
                          handleAccept(
                            friendship.id
                          )
                        }
                      >
                        {processingId ===
                        friendship.id
                          ? "Memproses..."
                          : "Terima"}
                      </button>
                    )}

                    <button
                      type="button"
                      className="friend-delete"
                      disabled={
                        processingId ===
                        friendship.id
                      }
                      onClick={() =>
                        handleDelete(
                          friendship.id
                        )
                      }
                    >
                      {incoming
                        ? "Tolak"
                        : "Hapus"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default FriendsPage;
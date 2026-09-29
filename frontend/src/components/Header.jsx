function Header({ user }) {
  const userName = user?.name || "Mahasiswa";
  const userInitial = userName.charAt(0).toUpperCase();

  const profilePhoto =
    user?.student_profile?.photo_url || "";

  return (
    <header className="header">
      <div className="header-left">
        <h1>Mahasiswa Sharing Hub</h1>
        <p>Ruang berbagi untuk mahasiswa</p>
      </div>

      <div className="header-profile">
        <div className="profile-avatar">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Foto profil"
            />
          ) : (
            userInitial
          )}
        </div>

        <div className="profile-info">
          <strong>{userName}</strong>
          <span>Mahasiswa</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
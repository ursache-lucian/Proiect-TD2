// Navbar.jsx — bara de navigatie cu nume clickabil catre profil

function Navbar({ user, onLogout, paginaCurenta, setPagina }) {
  return (
    <nav
      className="d-flex align-items-center justify-content-between px-4 py-3"
      style={{
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo — click pe el te duce la feed */}
      <span
        className="fw-bold"
        onClick={() => setPagina("feed")}
        style={{ color: "#4f46e5", fontSize: "1.2rem", cursor: "pointer" }}
      >
        🎓 StudentLink
      </span>

      {/* Dreapta: navigatie + logout */}
      <div className="d-flex align-items-center gap-3">

        {/* Buton Feed */}
        <span
          onClick={() => setPagina("feed")}
          style={{
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: paginaCurenta === "feed" ? 700 : 400,
            color: paginaCurenta === "feed" ? "#4f46e5" : "#6b7280",
          }}
        >
          🏠 Joburi
        </span>

        {/* Numele userului — click te duce la profil */}
        <span
          onClick={() => setPagina("profile")}
          style={{
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: paginaCurenta === "profile" ? 700 : 400,
            color: paginaCurenta === "profile" ? "#4f46e5" : "#374151",
          }}
        >
          👤 {user.name}
          <span
            className="ms-2 badge"
            style={{ background: "#ede9fe", color: "#5b21b6", fontSize: "0.75rem" }}
          >
            {user.role === "student" ? "Student" : "Companie"}
          </span>
        </span>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="btn btn-sm"
          style={{
            border: "1.5px solid #e5e7eb",
            borderRadius: "8px",
            color: "#6b7280",
            fontSize: "0.85rem",
          }}
        >
          Ieși din cont
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
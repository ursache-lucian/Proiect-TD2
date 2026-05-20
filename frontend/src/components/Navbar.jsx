// Navbar.jsx — bara de navigatie diferita pentru studenti si companii

function Navbar({ user, onLogout, paginaCurenta, setPagina }) {
  const esteCompanie = user.role === "company";

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
      {/* Logo */}
      <span
        className="fw-bold"
        onClick={() => setPagina(esteCompanie ? "dashboard" : "feed")}
        style={{ color: "#4f46e5", fontSize: "1.2rem", cursor: "pointer" }}
      >
        🎓 StudentLink
      </span>

      <div className="d-flex align-items-center gap-3">

        {/* Navigatie pentru STUDENT */}
        {!esteCompanie && (
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
        )}

        {/* Navigatie pentru COMPANIE */}
        {esteCompanie && (
          <span
            onClick={() => setPagina("dashboard")}
            style={{
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: paginaCurenta === "dashboard" ? 700 : 400,
              color: paginaCurenta === "dashboard" ? "#4f46e5" : "#6b7280",
            }}
          >
            🏢 Dashboard
          </span>
        )}

        {/* Numele userului — click duce la profil */}
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
            {esteCompanie ? "Companie" : "Student"}
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
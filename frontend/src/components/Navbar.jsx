// Navbar.jsx — bara de navigatie de sus

function Navbar({ user, onLogout }) {
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
      <span className="fw-bold" style={{ color: "#4f46e5", fontSize: "1.2rem" }}>
        🎓 StudentLink
      </span>

      {/* Dreapta: nume user + buton logout */}
      <div className="d-flex align-items-center gap-3">
        <span className="text-muted" style={{ fontSize: "0.9rem" }}>
          👋 {user.name}
          <span
            className="ms-2 badge"
            style={{ background: "#ede9fe", color: "#5b21b6", fontSize: "0.75rem" }}
          >
            {user.role === "student" ? "Student" : "Companie"}
          </span>
        </span>

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
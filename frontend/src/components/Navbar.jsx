// Navbar.jsx — bara de navigatie cu clopot de notificari

import { useState, useEffect } from "react";

function Navbar({ user, onLogout, paginaCurenta, setPagina }) {
  const esteCompanie = user.role === "company";

  // Lista de notificari
  const [notificari, setNotificari] = useState([]);
  // Controlam daca e deschis dropdown-ul de notificari
  const [dropdownDeschis, setDropdownDeschis] = useState(false);

  // Numarul de notificari necitite
  const necitite = notificari.filter((n) => !n.is_read).length;

  function getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    };
  }

  // Incarcam notificarile la fiecare 30 de secunde automat
  useEffect(() => {
    fetchNotificari();
    const interval = setInterval(fetchNotificari, 30000);
    return () => clearInterval(interval); // curatam intervalul cand iese din pagina
  }, []);

  async function fetchNotificari() {
    try {
      const raspuns = await fetch("http://localhost:8000/notifications", {
        headers: getHeaders(),
      });
      if (!raspuns.ok) return;
      const date = await raspuns.json();
      setNotificari(date);
    } catch (err) {
      console.error("Eroare la notificări:", err);
    }
  }

  // Marcam toate ca citite
  async function handleCitesteToate() {
    try {
      await fetch("http://localhost:8000/notifications/read-all", {
        method: "PUT",
        headers: getHeaders(),
      });
      // Actualizam local fara sa reincarcam
      setNotificari(notificari.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Eroare:", err);
    }
  }

  // Marcam o singura notificare ca citita
  async function handleCitesteUna(id) {
    try {
      await fetch(`http://localhost:8000/notifications/${id}/read`, {
        method: "PUT",
        headers: getHeaders(),
      });
      setNotificari(notificari.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Eroare:", err);
    }
  }

  // Formatam data scurt
  function formatData(dataString) {
    return new Date(dataString).toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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

        {/* Navigatie student */}
        {!esteCompanie && (
          <span
            onClick={() => setPagina("feed")}
            style={{
              cursor: "pointer", fontSize: "0.9rem",
              fontWeight: paginaCurenta === "feed" ? 700 : 400,
              color: paginaCurenta === "feed" ? "#4f46e5" : "#6b7280",
            }}
          >
            🏠 Joburi
          </span>
        )}

        {/* Navigatie companie */}
        {esteCompanie && (
          <span
            onClick={() => setPagina("dashboard")}
            style={{
              cursor: "pointer", fontSize: "0.9rem",
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
            cursor: "pointer", fontSize: "0.9rem",
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

        {/* ===== CLOPOT NOTIFICARI ===== */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownDeschis(!dropdownDeschis)}
            className="btn btn-sm"
            style={{
              border: `1.5px solid ${necitite > 0 ? "#4f46e5" : "#e5e7eb"}`,
              borderRadius: "8px",
              color: necitite > 0 ? "#4f46e5" : "#6b7280",
              background: necitite > 0 ? "#ede9fe" : "white",
              fontWeight: 600,
              position: "relative",
            }}
          >
            🔔
            {/* Badge cu numarul de necitite */}
            {necitite > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6, right: -6,
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  width: 18, height: 18,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {necitite}
              </span>
            )}
          </button>

          {/* Dropdown notificari */}
          {dropdownDeschis && (
            <>
              {/* Click in afara inchide dropdown-ul */}
              <div
                onClick={() => setDropdownDeschis(false)}
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0, bottom: 0,
                  zIndex: 150,
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 320,
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  zIndex: 151,
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                }}
              >
                {/* Header dropdown */}
                <div
                  className="d-flex justify-content-between align-items-center px-3 py-2"
                  style={{ borderBottom: "1px solid #e5e7eb" }}
                >
                  <span className="fw-bold" style={{ color: "#1e1b4b", fontSize: "0.95rem" }}>
                    Notificări
                  </span>
                  {necitite > 0 && (
                    <span
                      onClick={handleCitesteToate}
                      style={{
                        color: "#4f46e5", fontSize: "0.8rem",
                        cursor: "pointer", fontWeight: 600,
                      }}
                    >
                      Marchează toate citite
                    </span>
                  )}
                </div>

                {/* Lista notificari */}
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {notificari.length === 0 && (
                    <div className="text-center py-4 text-muted">
                      <p style={{ fontSize: "1.8rem" }}>🔔</p>
                      <p style={{ fontSize: "0.85rem" }}>Nicio notificare momentan.</p>
                    </div>
                  )}

                  {notificari.map((notificare) => (
                    <div
                      key={notificare.id}
                      onClick={() => handleCitesteUna(notificare.id)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f3f4f6",
                        background: notificare.is_read ? "white" : "#f5f3ff",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                    >
                      <div className="d-flex align-items-start gap-2">
                        {/* Punct albastru pentru necitite */}
                        <div
                          style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: notificare.is_read ? "transparent" : "#4f46e5",
                            marginTop: 6, flexShrink: 0,
                          }}
                        />
                        <div>
                          <p
                            className="mb-0"
                            style={{
                              fontSize: "0.88rem",
                              color: "#374151",
                              fontWeight: notificare.is_read ? 400 : 600,
                            }}
                          >
                            {notificare.message}
                          </p>
                          <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>
                            {formatData(notificare.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

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
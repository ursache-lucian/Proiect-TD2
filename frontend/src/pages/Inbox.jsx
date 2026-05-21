// Inbox.jsx — pagina de mesaje cu lista conversatii si chat

import { useState, useEffect, useRef } from "react";

function Inbox({ user, onLogout }) {
  const [conversatii, setConversatii] = useState([]);
  const [conversatieActiva, setConversatieActiva] = useState(null); // userul cu care vorbim
  const [mesaje, setMesaje] = useState([]);
  const [mesajNou, setMesajNou] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMesaje, setLoadingMesaje] = useState(false);

  // Referinta la capatul listei de mesaje — pentru scroll automat
  const mesajeEndRef = useRef(null);

  function getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    };
  }

  // Incarcam conversatiile la pornire
  useEffect(() => {
    fetchConversatii();
  }, []);

  // Scroll automat la ultimul mesaj cand se schimba lista
  useEffect(() => {
    mesajeEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mesaje]);

  async function fetchConversatii() {
    try {
      const raspuns = await fetch("http://localhost:8000/messages", {
        headers: getHeaders(),
      });
      if (raspuns.status === 401) { onLogout(); return; }
      if (!raspuns.ok) return;
      const date = await raspuns.json();
      setConversatii(date);
    } catch (err) {
      console.error("Eroare la conversații:", err);
    } finally {
      setLoading(false);
    }
  }

  // Deschidem o conversatie si incarcam mesajele
  async function handleDeschideConversatie(conversatie) {
    setConversatieActiva(conversatie);
    setLoadingMesaje(true);
    setMesaje([]);

    try {
      const raspuns = await fetch(`http://localhost:8000/messages/${conversatie.user_id}`, {
        headers: getHeaders(),
      });
      if (!raspuns.ok) return;
      const date = await raspuns.json();
      setMesaje(date);

      // Marcam conversatia ca citita local
      setConversatii(conversatii.map((c) =>
        c.user_id === conversatie.user_id ? { ...c, unread_count: 0 } : c
      ));
    } catch (err) {
      console.error("Eroare la mesaje:", err);
    } finally {
      setLoadingMesaje(false);
    }
  }

  // Trimitem un mesaj nou
  async function handleTrimite() {
    if (!mesajNou.trim()) return;

    try {
      const raspuns = await fetch("http://localhost:8000/messages", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          receiver_id: conversatieActiva.user_id,
          content: mesajNou.trim(),
        }),
      });

      if (!raspuns.ok) return;

      const mesajTrimis = await raspuns.json();

      // Adaugam mesajul local fara sa reincarcam tot
      setMesaje([...mesaje, mesajTrimis]);
      setMesajNou("");

      // Actualizam ultima conversatie in lista
      setConversatii(conversatii.map((c) =>
        c.user_id === conversatieActiva.user_id
          ? { ...c, last_message: mesajNou.trim(), created_at: mesajTrimis.created_at }
          : c
      ));
    } catch (err) {
      console.error("Eroare la trimitere:", err);
    }
  }

  // Trimitem cu Enter
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTrimite();
    }
  }

  function formatData(dataString) {
    return new Date(dataString).toLocaleDateString("ro-RO", {
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function formatOra(dataString) {
    return new Date(dataString).toLocaleTimeString("ro-RO", {
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f3ff" }}>
      <div className="container py-5">
        <h4 className="fw-bold mb-4" style={{ color: "#1e1b4b" }}>💬 Mesaje</h4>

        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "16px", overflow: "hidden", minHeight: "520px" }}
        >
          <div className="row g-0" style={{ minHeight: "520px" }}>

            {/* ===== COLOANA STANGA — lista conversatii ===== */}
            <div
              className="col-12 col-md-4"
              style={{ borderRight: "1px solid #e5e7eb", background: "white" }}
            >
              <div
                className="px-3 py-3 fw-bold"
                style={{ borderBottom: "1px solid #e5e7eb", color: "#1e1b4b" }}
              >
                Conversații
              </div>

              {loading && (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm" style={{ color: "#7c3aed" }} />
                </div>
              )}

              {!loading && conversatii.length === 0 && (
                <div className="text-center py-5 text-muted px-3">
                  <p style={{ fontSize: "2rem" }}>💬</p>
                  <p style={{ fontSize: "0.85rem" }}>Nicio conversație încă.</p>
                </div>
              )}

              {conversatii.map((conv) => (
                <div
                  key={conv.user_id}
                  onClick={() => handleDeschideConversatie(conv)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f3f4f6",
                    background: conversatieActiva?.user_id === conv.user_id ? "#f5f3ff" : "white",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    {/* Avatar */}
                    <div
                      className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                      style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        color: "white", fontSize: "1rem",
                      }}
                    >
                      {conv.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-fill overflow-hidden">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold" style={{ fontSize: "0.9rem", color: "#1e1b4b" }}>
                          {conv.name}
                        </span>
                        {/* Badge mesaje necitite */}
                        {conv.unread_count > 0 && (
                          <span
                            className="badge"
                            style={{ background: "#4f46e5", color: "white", fontSize: "0.7rem" }}
                          >
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p
                        className="mb-0 text-muted text-truncate"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {conv.last_message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== COLOANA DREAPTA — fereastra chat ===== */}
            <div className="col-12 col-md-8 d-flex flex-column" style={{ background: "#fafafa" }}>

              {/* Nicio conversatie selectata */}
              {!conversatieActiva && (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted flex-column">
                  <p style={{ fontSize: "3rem" }}>👈</p>
                  <p>Selectează o conversație din stânga</p>
                </div>
              )}

              {conversatieActiva && (
                <>
                  {/* Header chat */}
                  <div
                    className="px-4 py-3 d-flex align-items-center gap-2"
                    style={{ borderBottom: "1px solid #e5e7eb", background: "white" }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        color: "white", fontSize: "0.9rem",
                      }}
                    >
                      {conversatieActiva.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="fw-bold mb-0" style={{ color: "#1e1b4b", fontSize: "0.95rem" }}>
                        {conversatieActiva.name}
                      </p>
                      <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>
                        {conversatieActiva.role === "company" ? "🏢 Companie" : "🎓 Student"}
                      </p>
                    </div>
                  </div>

                  {/* Lista mesaje */}
                  <div
                    className="flex-fill px-4 py-3"
                    style={{ overflowY: "auto", maxHeight: "360px" }}
                  >
                    {loadingMesaje && (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm" style={{ color: "#7c3aed" }} />
                      </div>
                    )}

                    {!loadingMesaje && mesaje.map((mesaj) => {
                      // Daca sender_id e userul logat, mesajul e trimis de noi
                      const esteAlMeu = mesaj.sender_id === parseInt(user.user_id);

                      return (
                        <div
                          key={mesaj.id}
                          className={`d-flex mb-3 ${esteAlMeu ? "justify-content-end" : "justify-content-start"}`}
                        >
                          <div
                            style={{
                              maxWidth: "70%",
                              padding: "10px 14px",
                              borderRadius: esteAlMeu ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                              background: esteAlMeu
                                ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
                                : "white",
                              color: esteAlMeu ? "white" : "#374151",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                              fontSize: "0.9rem",
                            }}
                          >
                            <p className="mb-1">{mesaj.content}</p>
                            <p
                              className="mb-0"
                              style={{
                                fontSize: "0.72rem",
                                opacity: 0.7,
                                textAlign: esteAlMeu ? "right" : "left",
                              }}
                            >
                              {formatOra(mesaj.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Referinta pentru scroll automat */}
                    <div ref={mesajeEndRef} />
                  </div>

                  {/* Input trimitere mesaj */}
                  <div
                    className="px-4 py-3 d-flex gap-2"
                    style={{ borderTop: "1px solid #e5e7eb", background: "white" }}
                  >
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Scrie un mesaj... (Enter pentru trimitere)"
                      value={mesajNou}
                      onChange={(e) => setMesajNou(e.target.value)}
                      onKeyDown={handleKeyDown}
                      style={{ borderRadius: "8px", padding: "10px 14px" }}
                    />
                    <button
                      onClick={handleTrimite}
                      disabled={!mesajNou.trim()}
                      className="btn"
                      style={{
                        background: mesajNou.trim()
                          ? "linear-gradient(90deg, #4f46e5, #7c3aed)"
                          : "#e5e7eb",
                        color: mesajNou.trim() ? "white" : "#9ca3af",
                        borderRadius: "8px",
                        fontWeight: 600,
                        border: "none",
                        padding: "10px 18px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Trimite ➤
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Inbox;
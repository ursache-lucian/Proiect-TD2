// Profile.jsx — pagina de profil a studentului

import { useState, useEffect } from "react";

function Profile({ user, onLogout }) {
  // Datele profilului venite de la backend
  const [profil, setProfil] = useState(null);

  // Controlam daca suntem in modul de editare sau de vizualizare
  const [editMode, setEditMode] = useState(false);

  // Datele din formularul de editare
  const [formData, setFormData] = useState({
    faculty: "",
    description: "",
    skills: "",
  });

  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState(null);
  const [mesajSucces, setMesajSucces] = useState(null);

  // Functie care trimite tokenul in header — necesara pentru rutele protejate
  function getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    };
  }

  // Incarcam profilul cand se deschide pagina
  useEffect(() => {
    async function fetchProfil() {
      try {
        const raspuns = await fetch("http://localhost:8000/profile/me", {
          headers: getHeaders(),
        });

        // Daca tokenul e invalid sau expirat
        if (raspuns.status === 401) {
          onLogout();
          return;
        }

        if (!raspuns.ok) {
          throw new Error("Nu s-a putut încărca profilul.");
        }

        const date = await raspuns.json();
        setProfil(date);

        // Populam formularul cu datele existente
        setFormData({
          faculty: date.faculty || "",
          description: date.description || "",
          skills: date.skills || "",
        });
      } catch (err) {
        setEroare(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfil();
  }, []);

  // Actualizam state-ul cand userul scrie in input-uri
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Salvam modificarile profilului
  async function handleSave() {
    setMesajSucces(null);
    setEroare(null);

    try {
      const raspuns = await fetch("http://localhost:8000/profile/me", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      if (raspuns.status === 401) {
        onLogout();
        return;
      }

      if (!raspuns.ok) {
        throw new Error("Nu s-a putut salva profilul.");
      }

      // Actualizam datele afisate cu cele noi
      setProfil({ ...profil, ...formData });
      setEditMode(false);
      setMesajSucces("Profil actualizat cu succes! ✅");

      // Ascundem mesajul de succes dupa 3 secunde
      setTimeout(() => setMesajSucces(null), 3000);
    } catch (err) {
      setEroare(err.message);
    }
  }

  // Impartim string-ul de skills in bucati separate ca sa le afisam ca badge-uri
  function renderSkills(skillsString) {
    if (!skillsString) return <span className="text-muted">Nicio abilitate adăugată încă.</span>;
    return skillsString.split(",").map((skill, index) => (
      <span
        key={index}
        className="badge me-2 mb-2"
        style={{ background: "#ede9fe", color: "#5b21b6", fontSize: "0.85rem", padding: "6px 12px" }}
      >
        {skill.trim()}
      </span>
    ));
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: "#7c3aed" }} role="status" />
        <p className="mt-3 text-muted">Se încarcă profilul...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f3ff" }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">

            {/* Mesaj succes */}
            {mesajSucces && (
              <div className="alert mb-4" style={{ background: "#d1fae5", color: "#065f46", border: "none", borderRadius: "12px" }}>
                {mesajSucces}
              </div>
            )}

            {/* Mesaj eroare */}
            {eroare && (
              <div className="alert mb-4" style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "12px" }}>
                ⚠️ {eroare}
              </div>
            )}

            {/* Card profil */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
              <div style={{ height: "4px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", borderRadius: "16px 16px 0 0" }} />

              <div className="card-body p-4">

                {/* Avatar si nume */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      color: "white",
                      fontSize: "1.4rem",
                    }}
                  >
                    {/* Afisam initiala numelui */}
                    {profil?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ color: "#1e1b4b" }}>{profil?.name}</h4>
                    <span className="badge" style={{ background: "#ede9fe", color: "#5b21b6" }}>
                      🎓 Student
                    </span>
                  </div>
                </div>

                {/* Email — nu se poate edita */}
                <div className="mb-3">
                  <label className="form-label fw-medium text-muted" style={{ fontSize: "0.85rem" }}>EMAIL</label>
                  <p className="mb-0" style={{ color: "#374151" }}>📧 {profil?.email}</p>
                </div>

                <hr style={{ borderColor: "#e5e7eb" }} />

                {/* MOD VIZUALIZARE */}
                {!editMode && (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-medium text-muted" style={{ fontSize: "0.85rem" }}>FACULTATE</label>
                      <p className="mb-0" style={{ color: "#374151" }}>
                        {profil?.faculty || <span className="text-muted fst-italic">Necompletată</span>}
                      </p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium text-muted" style={{ fontSize: "0.85rem" }}>DESPRE MINE</label>
                      <p className="mb-0" style={{ color: "#374151", lineHeight: 1.6 }}>
                        {profil?.description || <span className="text-muted fst-italic">Nicio descriere adăugată.</span>}
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-medium text-muted" style={{ fontSize: "0.85rem" }}>ABILITĂȚI</label>
                      <div>{renderSkills(profil?.skills)}</div>
                    </div>

                    <button
                      onClick={() => setEditMode(true)}
                      className="btn w-100"
                      style={{
                        background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
                        color: "white",
                        borderRadius: "8px",
                        padding: "11px",
                        fontWeight: 600,
                        border: "none",
                      }}
                    >
                      ✏️ Editează profilul
                    </button>
                  </>
                )}

                {/* MOD EDITARE */}
                {editMode && (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-medium" style={{ color: "#374151" }}>Facultate</label>
                      <input
                        type="text"
                        name="faculty"
                        className="form-control"
                        placeholder="ex: Facultatea de Informatică"
                        value={formData.faculty}
                        onChange={handleChange}
                        style={{ borderRadius: "8px", padding: "10px 14px" }}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium" style={{ color: "#374151" }}>Despre mine</label>
                      <textarea
                        name="description"
                        className="form-control"
                        placeholder="Scrie câteva cuvinte despre tine..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        style={{ borderRadius: "8px", padding: "10px 14px" }}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-medium" style={{ color: "#374151" }}>Abilități</label>
                      <input
                        type="text"
                        name="skills"
                        className="form-control"
                        placeholder="ex: React, Python, SQL (separate prin virgulă)"
                        value={formData.skills}
                        onChange={handleChange}
                        style={{ borderRadius: "8px", padding: "10px 14px" }}
                      />
                      <small className="text-muted">Separă abilitățile prin virgulă</small>
                    </div>

                    {/* Butoane Salveaza / Anuleaza */}
                    <div className="d-flex gap-2">
                      <button
                        onClick={handleSave}
                        className="btn flex-fill"
                        style={{
                          background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
                          color: "white",
                          borderRadius: "8px",
                          padding: "11px",
                          fontWeight: 600,
                          border: "none",
                        }}
                      >
                        Salvează
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="btn flex-fill"
                        style={{
                          border: "1.5px solid #e5e7eb",
                          borderRadius: "8px",
                          color: "#6b7280",
                          padding: "11px",
                          fontWeight: 600,
                        }}
                      >
                        Anulează
                      </button>
                    </div>
                  </>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
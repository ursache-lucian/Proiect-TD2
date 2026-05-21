// Profile.jsx — pagina de profil a studentului cu sectiune CV

import { useState, useEffect } from "react";

function Profile({ user, onLogout }) {
  const [profil, setProfil] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    faculty: "",
    description: "",
    skills: "",
  });

  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState(null);
  const [mesajSucces, setMesajSucces] = useState(null);

  // Starea pentru CV
  const [fisierCV, setFisierCV] = useState(null); // fisierul selectat din calculator
  const [loadingCV, setLoadingCV] = useState(false);
  const [eroareCV, setEroareCV] = useState(null);

  function getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    };
  }

  useEffect(() => {
    async function fetchProfil() {
      try {
        const raspuns = await fetch("http://localhost:8000/profile/me", {
          headers: getHeaders(),
        });

        if (raspuns.status === 401) { onLogout(); return; }
        if (!raspuns.ok) throw new Error("Nu s-a putut încărca profilul.");

        const date = await raspuns.json();
        setProfil(date);
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

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    setMesajSucces(null);
    setEroare(null);

    try {
      const raspuns = await fetch("http://localhost:8000/profile/me", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      if (raspuns.status === 401) { onLogout(); return; }
      if (!raspuns.ok) throw new Error("Nu s-a putut salva profilul.");

      setProfil({ ...profil, ...formData });
      setEditMode(false);
      setMesajSucces("Profil actualizat cu succes! ✅");
      setTimeout(() => setMesajSucces(null), 3000);
    } catch (err) {
      setEroare(err.message);
    }
  }

  // Cand userul selecteaza un fisier din calculator
  function handleFisierSelectat(e) {
    const fisier = e.target.files[0];
    setEroareCV(null);

    // Verificam pe frontend daca e PDF inainte sa trimitem
    if (fisier && fisier.type !== "application/pdf") {
      setEroareCV("Doar fișierele PDF sunt acceptate.");
      setFisierCV(null);
      return;
    }

    setFisierCV(fisier);
  }

  // Trimitem CV-ul la backend
  async function handleIncarcaCV() {
    if (!fisierCV) {
      setEroareCV("Te rugăm să selectezi un fișier PDF.");
      return;
    }

    setLoadingCV(true);
    setEroareCV(null);

    try {
      // Pentru fisiere folosim FormData, nu JSON
      const formDataCV = new FormData();
      formDataCV.append("file", fisierCV);

      const raspuns = await fetch("http://localhost:8000/profile/upload-cv", {
        method: "POST",
        headers: {
          // Nu punem Content-Type aici — browser-ul il seteaza automat pentru FormData
          Authorization: `Bearer ${user.token}`,
        },
        body: formDataCV,
      });

      const date = await raspuns.json();

      if (!raspuns.ok) {
        throw new Error(date.detail || "Nu s-a putut încărca CV-ul.");
      }

      // Actualizam profilul local sa stim ca are CV acum
      setProfil({ ...profil, cv_filename: fisierCV.name });
      setFisierCV(null);
      setMesajSucces("CV încărcat cu succes! ✅");
      setTimeout(() => setMesajSucces(null), 3000);

    } catch (err) {
      setEroareCV(err.message);
    } finally {
      setLoadingCV(false);
    }
  }

  // Descarcam CV-ul existent
  async function handleDescarcaCV() {
    try {
      const raspuns = await fetch("http://localhost:8000/profile/cv", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (raspuns.status === 404) {
        setEroareCV("Nu ai niciun CV încărcat.");
        return;
      }

      if (!raspuns.ok) throw new Error("Nu s-a putut descărca CV-ul.");

      // Cream un link temporar de download in browser
      const blob = await raspuns.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = profil.cv_filename || "cv.pdf";
      link.click();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setEroareCV(err.message);
    }
  }

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

            {mesajSucces && (
              <div className="alert mb-4" style={{ background: "#d1fae5", color: "#065f46", border: "none", borderRadius: "12px" }}>
                {mesajSucces}
              </div>
            )}

            {eroare && (
              <div className="alert mb-4" style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "12px" }}>
                ⚠️ {eroare}
              </div>
            )}

            {/* ===== CARD PROFIL ===== */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
              <div style={{ height: "4px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", borderRadius: "16px 16px 0 0" }} />
              <div className="card-body p-4">

                {/* Avatar si nume */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: 60, height: 60, borderRadius: "50%",
                      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      color: "white", fontSize: "1.4rem",
                    }}
                  >
                    {profil?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ color: "#1e1b4b" }}>{profil?.name}</h4>
                    <span className="badge" style={{ background: "#ede9fe", color: "#5b21b6" }}>🎓 Student</span>
                  </div>
                </div>

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
                        color: "white", borderRadius: "8px",
                        padding: "11px", fontWeight: 600, border: "none",
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
                        type="text" name="faculty" className="form-control"
                        placeholder="ex: Facultatea de Informatică"
                        value={formData.faculty} onChange={handleChange}
                        style={{ borderRadius: "8px", padding: "10px 14px" }}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium" style={{ color: "#374151" }}>Despre mine</label>
                      <textarea
                        name="description" className="form-control"
                        placeholder="Scrie câteva cuvinte despre tine..."
                        value={formData.description} onChange={handleChange}
                        rows={3} style={{ borderRadius: "8px", padding: "10px 14px" }}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-medium" style={{ color: "#374151" }}>Abilități</label>
                      <input
                        type="text" name="skills" className="form-control"
                        placeholder="ex: React, Python, SQL (separate prin virgulă)"
                        value={formData.skills} onChange={handleChange}
                        style={{ borderRadius: "8px", padding: "10px 14px" }}
                      />
                      <small className="text-muted">Separă abilitățile prin virgulă</small>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        onClick={handleSave}
                        className="btn flex-fill"
                        style={{
                          background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
                          color: "white", borderRadius: "8px",
                          padding: "11px", fontWeight: 600, border: "none",
                        }}
                      >
                        Salvează
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="btn flex-fill"
                        style={{
                          border: "1.5px solid #e5e7eb", borderRadius: "8px",
                          color: "#6b7280", padding: "11px", fontWeight: 600,
                        }}
                      >
                        Anulează
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ===== CARD CV ===== */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
              <div style={{ height: "4px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", borderRadius: "16px 16px 0 0" }} />
              <div className="card-body p-4">
                <h5 className="fw-bold mb-1" style={{ color: "#1e1b4b" }}>📄 CV-ul meu</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Încarcă un fișier PDF — companiile îl vor putea vedea când aplici.
                </p>

                {eroareCV && (
                  <div className="alert mb-3" style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px" }}>
                    ⚠️ {eroareCV}
                  </div>
                )}

                {/* CV existent */}
                {profil?.cv_filename && (
                  <div
                    className="d-flex align-items-center justify-content-between p-3 mb-3"
                    style={{ background: "#f0fdf4", borderRadius: "10px", border: "1.5px solid #bbf7d0" }}
                  >
                    <div>
                      <p className="fw-bold mb-0" style={{ color: "#065f46", fontSize: "0.9rem" }}>
                        ✅ CV încărcat
                      </p>
                      <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                        {profil.cv_filename}
                      </p>
                    </div>
                    <button
                      onClick={handleDescarcaCV}
                      className="btn btn-sm"
                      style={{
                        border: "1.5px solid #bbf7d0", borderRadius: "8px",
                        color: "#065f46", background: "white", fontWeight: 600,
                      }}
                    >
                      ⬇ Descarcă
                    </button>
                  </div>
                )}

                {/* Selector fisier */}
                <div className="mb-3">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFisierSelectat}
                    className="form-control"
                    style={{ borderRadius: "8px", padding: "10px 14px" }}
                  />
                  <small className="text-muted">Doar fișiere PDF acceptate</small>
                </div>

                {/* Buton incarcare */}
                <button
                  onClick={handleIncarcaCV}
                  disabled={loadingCV || !fisierCV}
                  className="btn w-100"
                  style={{
                    background: fisierCV
                      ? "linear-gradient(90deg, #4f46e5, #7c3aed)"
                      : "#e5e7eb",
                    color: fisierCV ? "white" : "#9ca3af",
                    borderRadius: "8px", padding: "11px",
                    fontWeight: 600, border: "none",
                  }}
                >
                  {loadingCV ? "Se încarcă..." : profil?.cv_filename ? "Înlocuiește CV-ul" : "Încarcă CV"}
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
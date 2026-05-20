// CompanyDashboard.jsx — pagina principala pentru companii cu lista de aplicanti

import { useState, useEffect } from "react";
import JobForm from "../components/JobForm";

function CompanyDashboard({ user, onLogout }) {
  const [joburi, setJoburi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState(null);
  const [mesajSucces, setMesajSucces] = useState(null);

  // Starea pentru modalul de aplicanti
  const [jobSelectat, setJobSelectat] = useState(null); // jobul pentru care vedem aplicantii
  const [aplicanti, setAplicanti] = useState([]);
  const [loadingAplicanti, setLoadingAplicanti] = useState(false);

  function getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    };
  }

  useEffect(() => {
    async function fetchJoburiMele() {
      try {
        const raspuns = await fetch("http://localhost:8000/jobs/my-jobs", {
          headers: getHeaders(),
        });

        if (raspuns.status === 401) { onLogout(); return; }
        if (!raspuns.ok) throw new Error("Nu s-au putut încărca joburile.");

        const date = await raspuns.json();
        setJoburi(date);
      } catch (err) {
        setEroare(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJoburiMele();
  }, []);

  function handleJobPostat(jobNou) {
    setJoburi([jobNou, ...joburi]);
    setMesajSucces("Job postat cu succes! ✅");
    setTimeout(() => setMesajSucces(null), 3000);
  }

  async function handleSterge(jobId) {
    if (!window.confirm("Ești sigur că vrei să ștergi acest job?")) return;

    try {
      const raspuns = await fetch(`http://localhost:8000/jobs/${jobId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!raspuns.ok) {
        const date = await raspuns.json();
        throw new Error(date.detail || "Nu s-a putut șterge jobul.");
      }

      setJoburi(joburi.filter((job) => job.id !== jobId));
      setMesajSucces("Job șters cu succes! ✅");
      setTimeout(() => setMesajSucces(null), 3000);
    } catch (err) {
      setEroare(err.message);
      setTimeout(() => setEroare(null), 3000);
    }
  }

  // Deschidem modalul si incarcam aplicantii pentru jobul selectat
  async function handleVeziAplicanti(job) {
    setJobSelectat(job);
    setAplicanti([]);
    setLoadingAplicanti(true);

    try {
      const raspuns = await fetch(`http://localhost:8000/jobs/${job.id}/applicants`, {
        headers: getHeaders(),
      });

      if (!raspuns.ok) throw new Error("Nu s-au putut încărca aplicanții.");

      const date = await raspuns.json();
      setAplicanti(date);
    } catch (err) {
      setEroare(err.message);
    } finally {
      setLoadingAplicanti(false);
    }
  }

  function inchideModal() {
    setJobSelectat(null);
    setAplicanti([]);
  }

  function formatData(dataString) {
    return new Date(dataString).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Impartim skills in badge-uri individuale
  function renderSkills(skillsString) {
    if (!skillsString) return <span className="text-muted fst-italic">Nespecificate</span>;
    return skillsString.split(",").map((skill, index) => (
      <span
        key={index}
        className="badge me-1 mb-1"
        style={{ background: "#ede9fe", color: "#5b21b6", fontSize: "0.8rem", padding: "4px 10px" }}
      >
        {skill.trim()}
      </span>
    ));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f3ff" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          color: "white",
          padding: "48px 0 32px",
        }}
      >
        <div className="container">
          <h1 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
            🏢 Dashboard Companie
          </h1>
          <p style={{ opacity: 0.85, fontSize: "1.05rem" }}>
            Bună ziua, <strong>{user.name}</strong>! Gestionează joburile tale aici.
          </p>
        </div>
      </div>

      <div className="container py-5">

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

        {/* Formular postare job nou */}
        <JobForm user={user} onJobPostat={handleJobPostat} />

        {/* Lista joburi postate */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0" style={{ color: "#1e1b4b" }}>Joburile tale</h5>
          <span className="badge" style={{ background: "#ede9fe", color: "#5b21b6", fontSize: "0.9rem", padding: "8px 14px" }}>
            {joburi.length} joburi postate
          </span>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: "#7c3aed" }} role="status" />
            <p className="mt-3 text-muted">Se încarcă joburile...</p>
          </div>
        )}

        {!loading && joburi.length === 0 && (
          <div className="text-center py-5 text-muted">
            <p style={{ fontSize: "3rem" }}>📭</p>
            <p>Nu ai postat niciun job încă. Folosește formularul de mai sus!</p>
          </div>
        )}

        {!loading && joburi.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {joburi.map((job) => (
              <div
                key={job.id}
                className="card border-0 shadow-sm"
                style={{ borderRadius: "12px", overflow: "hidden" }}
              >
                <div style={{ height: "4px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)" }} />
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start">

                    <div className="flex-fill me-3">
                      <h5 className="fw-bold mb-1" style={{ color: "#1e1b4b" }}>{job.title}</h5>
                      <div className="d-flex gap-2 flex-wrap mb-2">
                        <span className="badge" style={{ background: "#ede9fe", color: "#5b21b6" }}>
                          📍 {job.location}
                        </span>
                        <span className="badge" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                          💼 {job.job_type}
                        </span>
                        <span className="badge" style={{ background: "#f3f4f6", color: "#6b7280" }}>
                          🕒 {formatData(job.created_at)}
                        </span>
                      </div>
                      <p className="text-muted mb-0" style={{ fontSize: "0.88rem" }}>
                        {job.description?.length > 100
                          ? job.description.substring(0, 100) + "..."
                          : job.description}
                      </p>
                    </div>

                    {/* Butoane actiuni */}
                    <div className="d-flex flex-column gap-2">
                      {/* Buton Vezi aplicanti */}
                      <button
                        onClick={() => handleVeziAplicanti(job)}
                        className="btn btn-sm"
                        style={{
                          border: "1.5px solid #ede9fe",
                          borderRadius: "8px",
                          color: "#4f46e5",
                          background: "#f5f3ff",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        👥 Vezi aplicanți
                      </button>

                      {/* Buton Sterge */}
                      <button
                        onClick={() => handleSterge(job.id)}
                        className="btn btn-sm"
                        style={{
                          border: "1.5px solid #fee2e2",
                          borderRadius: "8px",
                          color: "#991b1b",
                          background: "#fff5f5",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        🗑 Șterge
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===================== MODAL APLICANTI ===================== */}
      {jobSelectat && (
        <>
          {/* Fundal intunecat */}
          <div
            onClick={inchideModal}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 200,
            }}
          />

          {/* Fereastra modala */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "85vh",
              overflowY: "auto",
              zIndex: 201,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ height: "4px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", borderRadius: "16px 16px 0 0" }} />

            <div className="p-4">
              {/* Header modal */}
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: "#1e1b4b" }}>
                    👥 Aplicanți
                  </h4>
                  <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                    {jobSelectat.title}
                  </p>
                </div>
                <button
                  onClick={inchideModal}
                  className="btn btn-sm"
                  style={{ border: "1.5px solid #e5e7eb", borderRadius: "8px", color: "#6b7280", fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>

              {/* Loading aplicanti */}
              {loadingAplicanti && (
                <div className="text-center py-4">
                  <div className="spinner-border" style={{ color: "#7c3aed" }} role="status" />
                  <p className="mt-2 text-muted">Se încarcă aplicanții...</p>
                </div>
              )}

              {/* Niciun aplicant */}
              {!loadingAplicanti && aplicanti.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <p style={{ fontSize: "2.5rem" }}>📭</p>
                  <p>Niciun student nu a aplicat încă la acest job.</p>
                </div>
              )}

              {/* Lista aplicanti */}
              {!loadingAplicanti && aplicanti.length > 0 && (
                <div className="d-flex flex-column gap-3">
                  {/* Contor */}
                  <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                    <strong>{aplicanti.length}</strong> student{aplicanti.length !== 1 ? "i" : ""} au aplicat
                  </p>

                  {aplicanti.map((student) => (
                    <div
                      key={student.user_id}
                      className="card border-0"
                      style={{ background: "#f9f8ff", borderRadius: "12px" }}
                    >
                      <div className="card-body p-3">
                        {/* Avatar + nume + email */}
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <div
                            className="d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                              color: "white",
                              fontSize: "1.1rem",
                              flexShrink: 0,
                            }}
                          >
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="fw-bold mb-0" style={{ color: "#1e1b4b" }}>{student.name}</p>
                            <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>📧 {student.email}</p>
                          </div>
                        </div>

                        {/* Facultate */}
                        <p className="mb-1" style={{ fontSize: "0.88rem", color: "#4b5563" }}>
                          🎓 {student.faculty || <span className="fst-italic text-muted">Facultate nespecificată</span>}
                        </p>

                        {/* Descriere */}
                        {student.description && (
                          <p className="mb-2" style={{ fontSize: "0.88rem", color: "#4b5563" }}>
                            {student.description}
                          </p>
                        )}

                        {/* Skills */}
                        <div>{renderSkills(student.skills)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CompanyDashboard;
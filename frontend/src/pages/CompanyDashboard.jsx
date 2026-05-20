// CompanyDashboard.jsx — pagina principala pentru companii

import { useState, useEffect } from "react";
import JobForm from "../components/JobForm";

function CompanyDashboard({ user, onLogout }) {
  const [joburi, setJoburi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState(null);
  const [mesajSucces, setMesajSucces] = useState(null);

  function getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    };
  }

  // Incarcam joburile postate de aceasta companie
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

  // Se apeleaza dupa ce un job nou a fost postat cu succes
  function handleJobPostat(jobNou) {
    setJoburi([jobNou, ...joburi]); // adaugam jobul nou in capul listei
    setMesajSucces("Job postat cu succes! ✅");
    setTimeout(() => setMesajSucces(null), 3000);
  }

  // Stergem un job
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

      // Scoatem jobul din lista locala fara sa reincarcam pagina
      setJoburi(joburi.filter((job) => job.id !== jobId));
      setMesajSucces("Job șters cu succes! ✅");
      setTimeout(() => setMesajSucces(null), 3000);
    } catch (err) {
      setEroare(err.message);
      setTimeout(() => setEroare(null), 3000);
    }
  }

  // Formatam data
  function formatData(dataString) {
    return new Date(dataString).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

        {/* Formular postare job nou */}
        <JobForm user={user} onJobPostat={handleJobPostat} />

        {/* Lista joburi postate */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0" style={{ color: "#1e1b4b" }}>
            Joburile tale
          </h5>
          <span className="badge" style={{ background: "#ede9fe", color: "#5b21b6", fontSize: "0.9rem", padding: "8px 14px" }}>
            {joburi.length} joburi postate
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: "#7c3aed" }} role="status" />
            <p className="mt-3 text-muted">Se încarcă joburile...</p>
          </div>
        )}

        {/* Niciun job postat */}
        {!loading && joburi.length === 0 && (
          <div className="text-center py-5 text-muted">
            <p style={{ fontSize: "3rem" }}>📭</p>
            <p>Nu ai postat niciun job încă. Folosește formularul de mai sus!</p>
          </div>
        )}

        {/* Lista joburi */}
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

                    {/* Info job */}
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

                    {/* Buton sterge */}
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
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default CompanyDashboard;
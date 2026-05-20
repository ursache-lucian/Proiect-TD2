// JobCard.jsx — card pentru un job cu buton de aplicare si modal de detalii

import { useState } from "react";

function JobCard({ job, user, joburiAplicate, setJoburiAplicate }) {
  const aAplicat = joburiAplicate.includes(job.id);
  const [modalDeschis, setModalDeschis] = useState(false);

  const dataFormatata = new Date(job.created_at).toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleAplica() {
    try {
      const raspuns = await fetch(`http://localhost:8000/jobs/${job.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      const date = await raspuns.json();

      if (!raspuns.ok) {
        alert(date.detail || "A apărut o eroare.");
        return;
      }

      setJoburiAplicate([...joburiAplicate, job.id]);
    } catch (err) {
      alert("Nu s-a putut trimite aplicarea. Verifică conexiunea.");
    }
  }

  return (
    <>
      {/* ===================== CARD ===================== */}
      <div className="card h-100 shadow-sm border-0" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ height: "4px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)" }} />

        <div className="card-body p-4">
          <h5 className="card-title fw-bold mb-1" style={{ color: "#1e1b4b" }}>
            {job.title}
          </h5>
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            🏢 {job.company}
          </p>

          <div className="d-flex gap-2 flex-wrap mb-3">
            <span className="badge" style={{ background: "#ede9fe", color: "#5b21b6", fontWeight: 500 }}>
              📍 {job.location}
            </span>
            <span className="badge" style={{ background: "#dbeafe", color: "#1d4ed8", fontWeight: 500 }}>
              💼 {job.job_type}
            </span>
          </div>

          <p className="card-text text-secondary" style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
            {job.description?.length > 120
              ? job.description.substring(0, 120) + "..."
              : job.description}
          </p>
        </div>

        <div className="card-footer bg-white border-0 px-4 pb-4 pt-0">
          <small className="text-muted d-block mb-3">🕒 Postat pe {dataFormatata}</small>

          {/* Buton Vezi detalii — deschide modalul */}
          <button
            onClick={() => setModalDeschis(true)}
            className="btn w-100"
            style={{
              background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
              color: "white",
              borderRadius: "8px",
              fontWeight: 600,
              border: "none",
            }}
          >
            Vezi detalii →
          </button>
        </div>
      </div>

      {/* ===================== MODAL ===================== */}
      {modalDeschis && (
        <>
          {/* Fundal intunecat in spate */}
          <div
            onClick={() => setModalDeschis(false)}
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
              maxWidth: "560px",
              maxHeight: "85vh",
              overflowY: "auto",
              zIndex: 201,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            {/* Bara colorata sus */}
            <div style={{ height: "4px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", borderRadius: "16px 16px 0 0" }} />

            <div className="p-4">
              {/* Header modal */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: "#1e1b4b" }}>{job.title}</h4>
                  <p className="text-muted mb-0">🏢 {job.company}</p>
                </div>
                {/* Buton inchidere X */}
                <button
                  onClick={() => setModalDeschis(false)}
                  className="btn btn-sm"
                  style={{ border: "1.5px solid #e5e7eb", borderRadius: "8px", color: "#6b7280", fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>

              {/* Badge-uri */}
              <div className="d-flex gap-2 flex-wrap mb-4">
                <span className="badge" style={{ background: "#ede9fe", color: "#5b21b6", fontWeight: 500, padding: "6px 12px" }}>
                  📍 {job.location}
                </span>
                <span className="badge" style={{ background: "#dbeafe", color: "#1d4ed8", fontWeight: 500, padding: "6px 12px" }}>
                  💼 {job.job_type}
                </span>
                <span className="badge" style={{ background: "#f3f4f6", color: "#6b7280", fontWeight: 500, padding: "6px 12px" }}>
                  🕒 {dataFormatata}
                </span>
              </div>

              {/* Descriere completa */}
              <div className="mb-4">
                <h6 className="fw-bold mb-2" style={{ color: "#374151" }}>Descriere</h6>
                <p style={{ color: "#4b5563", lineHeight: 1.7, fontSize: "0.95rem" }}>
                  {job.description}
                </p>
              </div>

              {/* Cerinte */}
              {job.requirements && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2" style={{ color: "#374151" }}>Cerințe</h6>
                  <p style={{ color: "#4b5563", lineHeight: 1.7, fontSize: "0.95rem" }}>
                    {job.requirements}
                  </p>
                </div>
              )}

              {/* Buton Aplica in modal */}
              {aAplicat ? (
                <button
                  disabled
                  className="btn w-100"
                  style={{
                    background: "#d1fae5",
                    color: "#065f46",
                    borderRadius: "8px",
                    fontWeight: 600,
                    border: "none",
                    padding: "11px",
                  }}
                >
                  ✅ Ai aplicat deja
                </button>
              ) : (
                <button
                  onClick={() => { handleAplica(); setModalDeschis(false); }}
                  className="btn w-100"
                  style={{
                    background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: 600,
                    border: "none",
                    padding: "11px",
                  }}
                >
                  Aplică acum →
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default JobCard;
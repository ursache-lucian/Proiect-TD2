// JobCard.jsx — componenta pentru un singur card de job

function JobCard({ job }) {
  // Formatăm data într-un format lizibil în română
  const dataFormatata = new Date(job.created_at).toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="card h-100 shadow-sm border-0" style={{ borderRadius: "12px", overflow: "hidden" }}>
      {/* Bara colorată sus */}
      <div style={{ height: "4px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)" }} />

      <div className="card-body p-4">
        {/* Titlu job */}
        <h5 className="card-title fw-bold mb-1" style={{ color: "#1e1b4b" }}>
          {job.title}
        </h5>

        {/* Companie */}
        <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
          🏢 {job.company}
        </p>

        {/* Locatie si tip job */}
        <div className="d-flex gap-2 flex-wrap mb-3">
          <span className="badge" style={{ background: "#ede9fe", color: "#5b21b6", fontWeight: 500 }}>
            📍 {job.location}
          </span>
          <span className="badge" style={{ background: "#dbeafe", color: "#1d4ed8", fontWeight: 500 }}>
            💼 {job.job_type}
          </span>
        </div>

        {/* Descriere — afisam doar primele 120 de caractere */}
        <p className="card-text text-secondary" style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
          {job.description?.length > 120
            ? job.description.substring(0, 120) + "..."
            : job.description}
        </p>
      </div>

      <div className="card-footer bg-white border-0 px-4 pb-4 pt-0">
        {/* Data postarii */}
        <small className="text-muted d-block mb-3">🕒 Postat pe {dataFormatata}</small>

        {/* Buton Vezi detalii — momentan nu face nimic, il vom conecta mai tarziu */}
        <button
          className="btn w-100"
          style={{
            background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
            color: "white",
            borderRadius: "8px",
            fontWeight: 500,
            border: "none",
          }}
        >
          Vezi detalii →
        </button>
      </div>
    </div>
  );
}

export default JobCard;
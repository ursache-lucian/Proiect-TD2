// JobFeed.jsx — pagina principala cu cautare, filtrare si sistem de aplicare

import { useState, useEffect } from "react";
import JobCard from "../components/JobCard";

function JobFeed({ user }) {
  const [joburi, setJoburi] = useState([]);
  const [joburiAplicate, setJoburiAplicate] = useState([]);
  const [tabActiv, setTabActiv] = useState("toate");
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState(null);

  // Starea pentru cautare si filtrare
  const [cautare, setCautare] = useState("");
  const [filtruTip, setFiltruTip] = useState("toate"); // "toate", "internship", "junior"

  function getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    };
  }

  useEffect(() => {
    async function fetchDate() {
      try {
        const [raspunsJoburi, raspunsAplicate] = await Promise.all([
          fetch("http://localhost:8000/jobs", { headers: getHeaders() }),
          fetch("http://localhost:8000/jobs/applied", { headers: getHeaders() }),
        ]);

        if (!raspunsJoburi.ok) throw new Error("Nu s-au putut încărca joburile.");

        const dateJoburi = await raspunsJoburi.json();
        const dateAplicate = await raspunsAplicate.json();

        setJoburi(dateJoburi);
        setJoburiAplicate(dateAplicate.map((job) => job.id));
      } catch (err) {
        setEroare("Nu s-au putut încărca joburile. Verifică că serverul de backend rulează.");
      } finally {
        setLoading(false);
      }
    }

    fetchDate();
  }, []);

  // Aplicam filtrele pe lista de joburi
  function getJoburiFiltrate(lista) {
    return lista.filter((job) => {
      // Filtru dupa cuvant cheie — cautam in titlu, companie si locatie
      const termenCautare = cautare.toLowerCase();
      const potriviteCautare =
        cautare === "" ||
        job.title?.toLowerCase().includes(termenCautare) ||
        job.company?.toLowerCase().includes(termenCautare) ||
        job.location?.toLowerCase().includes(termenCautare);

      // Filtru dupa tip job
      const potrivitTip =
        filtruTip === "toate" || job.job_type === filtruTip;

      return potriviteCautare && potrivitTip;
    });
  }

  // Joburile din tab-ul activ
  const joburiTabActiv =
    tabActiv === "toate"
      ? joburi
      : joburi.filter((job) => joburiAplicate.includes(job.id));

  // Joburile dupa aplicarea filtrelor
  const joburiAfisate = getJoburiFiltrate(joburiTabActiv);

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
            🎓 Student<span style={{ opacity: 0.7 }}>Link</span>
          </h1>
          <p style={{ opacity: 0.85, fontSize: "1.05rem" }}>
            Internship-uri și joburi de junior, direct pentru studenți
          </p>

          {/* Bara de cautare — in header pentru aspect vizual mai bun */}
          <div className="mt-4 position-relative">
            <span
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1.1rem",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Caută după titlu, companie sau locație..."
              value={cautare}
              onChange={(e) => setCautare(e.target.value)}
              className="form-control"
              style={{
                paddingLeft: "44px",
                borderRadius: "10px",
                border: "none",
                padding: "12px 16px 12px 44px",
                fontSize: "0.95rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="container py-5">

        {/* Filtre tip job + tab-uri */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

          {/* Tab-uri Toate / Aplicările mele */}
          <div className="d-flex gap-2">
            <button
              onClick={() => setTabActiv("toate")}
              className="btn"
              style={{
                borderRadius: "8px",
                fontWeight: 600,
                border: `2px solid ${tabActiv === "toate" ? "#4f46e5" : "#e5e7eb"}`,
                background: tabActiv === "toate" ? "#ede9fe" : "white",
                color: tabActiv === "toate" ? "#4f46e5" : "#6b7280",
                padding: "8px 20px",
              }}
            >
              Toate joburile
              <span className="ms-2 badge" style={{ background: "#4f46e5", color: "white" }}>
                {joburi.length}
              </span>
            </button>

            <button
              onClick={() => setTabActiv("aplicate")}
              className="btn"
              style={{
                borderRadius: "8px",
                fontWeight: 600,
                border: `2px solid ${tabActiv === "aplicate" ? "#4f46e5" : "#e5e7eb"}`,
                background: tabActiv === "aplicate" ? "#ede9fe" : "white",
                color: tabActiv === "aplicate" ? "#4f46e5" : "#6b7280",
                padding: "8px 20px",
              }}
            >
              Aplicările mele
              <span className="ms-2 badge" style={{ background: joburiAplicate.length > 0 ? "#4f46e5" : "#9ca3af", color: "white" }}>
                {joburiAplicate.length}
              </span>
            </button>
          </div>

          {/* Filtre tip job */}
          <div className="d-flex gap-2">
            {["toate", "internship", "junior"].map((tip) => (
              <button
                key={tip}
                onClick={() => setFiltruTip(tip)}
                className="btn btn-sm"
                style={{
                  borderRadius: "8px",
                  fontWeight: 600,
                  border: `2px solid ${filtruTip === tip ? "#4f46e5" : "#e5e7eb"}`,
                  background: filtruTip === tip ? "#ede9fe" : "white",
                  color: filtruTip === tip ? "#4f46e5" : "#6b7280",
                  padding: "6px 14px",
                  textTransform: "capitalize",
                }}
              >
                {tip === "toate" ? "🗂 Toate tipurile" : tip === "internship" ? "🎓 Internship" : "💼 Junior"}
              </button>
            ))}
          </div>
        </div>

        {/* Mesaj rezultate cautare */}
        {cautare !== "" && !loading && (
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            {joburiAfisate.length === 0
              ? `Niciun rezultat pentru „${cautare}"`
              : `${joburiAfisate.length} rezultat${joburiAfisate.length !== 1 ? "e" : ""} pentru „${cautare}"`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: "#7c3aed" }} role="status" />
            <p className="mt-3 text-muted">Se încarcă joburile...</p>
          </div>
        )}

        {/* Eroare */}
        {eroare && (
          <div className="alert" style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "12px" }}>
            ⚠️ {eroare}
          </div>
        )}

        {/* Lista joburi */}
        {!loading && !eroare && (
          <div className="row g-4">
            {joburiAfisate.map((job) => (
              <div key={job.id} className="col-12 col-md-6 col-lg-4">
                <JobCard
                  job={job}
                  user={user}
                  joburiAplicate={joburiAplicate}
                  setJoburiAplicate={setJoburiAplicate}
                />
              </div>
            ))}
          </div>
        )}

        {/* Niciun job gasit */}
        {!loading && !eroare && joburiAfisate.length === 0 && cautare === "" && tabActiv === "aplicate" && (
          <div className="text-center py-5 text-muted">
            <p style={{ fontSize: "3rem" }}>📭</p>
            <p>Nu ai aplicat la niciun job încă.</p>
          </div>
        )}

        {/* Niciun rezultat la cautare */}
        {!loading && !eroare && joburiAfisate.length === 0 && cautare !== "" && (
          <div className="text-center py-5 text-muted">
            <p style={{ fontSize: "3rem" }}>🔍</p>
            <p>Niciun job găsit pentru <strong>„{cautare}"</strong>.</p>
            <button
              onClick={() => { setCautare(""); setFiltruTip("toate"); }}
              className="btn btn-sm"
              style={{ border: "1.5px solid #e5e7eb", borderRadius: "8px", color: "#6b7280" }}
            >
              Resetează filtrele
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default JobFeed;
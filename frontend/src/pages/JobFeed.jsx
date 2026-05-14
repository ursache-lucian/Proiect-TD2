// JobFeed.jsx — pagina principala cu toate joburile

import { useState, useEffect } from "react";
import JobCard from "../components/JobCard";

function JobFeed() {
  // Lista de joburi primita de la backend
  const [joburi, setJoburi] = useState([]);

  // true cat timp asteptam raspunsul de la server
  const [loading, setLoading] = useState(true);

  // Mesaj de eroare daca ceva nu merge
  const [eroare, setEroare] = useState(null);

  // useEffect se ruleaza automat cand se incarca pagina
  useEffect(() => {
    // Functia care cere datele de la backend
    async function fetchJoburi() {
      try {
        const raspuns = await fetch("http://localhost:8000/jobs");

        // Daca serverul a returnat o eroare
        if (!raspuns.ok) {
          throw new Error("Serverul a returnat o eroare.");
        }

        const date = await raspuns.json();
        setJoburi(date); // salvam joburile in state
      } catch (err) {
        setEroare("Nu s-au putut încărca joburile. Verifică că serverul de backend rulează.");
        console.error(err);
      } finally {
        setLoading(false); // indiferent de rezultat, oprim loading-ul
      }
    }

    fetchJoburi();
  }, []); // [] = rulează o singură dată, la încărcarea paginii

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
          <h1 className="fw-bold mb-1" style={{ fontSize: "2rem", letterSpacing: "-0.5px" }}>
            🎓 Student<span style={{ opacity: 0.7 }}>Link</span>
          </h1>
          <p style={{ opacity: 0.85, fontSize: "1.05rem" }}>
            Internship-uri și joburi de junior, direct pentru studenți
          </p>
        </div>
      </div>

      {/* Continut principal */}
      <div className="container py-5">

        {/* Titlu sectiune */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold" style={{ fontSize: "1.4rem", color: "#1e1b4b" }}>
            Oportunități disponibile
          </h2>
          {/* Afisam numarul de joburi doar daca s-au incarcat */}
          {!loading && !eroare && (
            <span className="badge" style={{ background: "#ede9fe", color: "#5b21b6", fontSize: "0.9rem", padding: "8px 14px" }}>
              {joburi.length} joburi
            </span>
          )}
        </div>

        {/* Starea de loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: "#7c3aed" }} role="status" />
            <p className="mt-3 text-muted">Se încarcă joburile...</p>
          </div>
        )}

        {/* Starea de eroare */}
        {eroare && (
          <div className="alert" style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "12px" }}>
            ⚠️ {eroare}
          </div>
        )}

        {/* Lista de joburi — grid cu 3 coloane pe desktop, 1 pe mobil */}
        {!loading && !eroare && (
          <div className="row g-4">
            {joburi.map((job) => (
              <div key={job.id} className="col-12 col-md-6 col-lg-4">
                <JobCard job={job} />
              </div>
            ))}
          </div>
        )}

        {/* Daca nu exista joburi */}
        {!loading && !eroare && joburi.length === 0 && (
          <div className="text-center py-5 text-muted">
            <p style={{ fontSize: "3rem" }}>📭</p>
            <p>Nu există joburi disponibile momentan.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default JobFeed;
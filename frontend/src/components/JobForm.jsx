// JobForm.jsx — formular pentru postarea unui job nou (doar pentru companii)

import { useState } from "react";

function JobForm({ user, onJobPostat }) {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    requirements: "",
    job_type: "internship", // valoarea implicita
  });

  const [eroare, setEroare] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    // Validare simpla — toate campurile sunt obligatorii
    if (!formData.title || !formData.location || !formData.description || !formData.requirements) {
      setEroare("Te rugăm să completezi toate câmpurile.");
      return;
    }

    setEroare(null);
    setLoading(true);

    try {
      const raspuns = await fetch("http://localhost:8000/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });

      const date = await raspuns.json();

      if (!raspuns.ok) {
        throw new Error(date.detail || "Nu s-a putut posta jobul.");
      }

      // Resetam formularul dupa postare reusita
      setFormData({
        title: "",
        location: "",
        description: "",
        requirements: "",
        job_type: "internship",
      });

      // Anuntam pagina parinte ca s-a postat un job nou
      onJobPostat(date);

    } catch (err) {
      setEroare(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: "16px" }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", borderRadius: "16px 16px 0 0" }} />
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4" style={{ color: "#1e1b4b" }}>➕ Postează un job nou</h5>

        {eroare && (
          <div className="alert mb-3" style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px" }}>
            ⚠️ {eroare}
          </div>
        )}

        {/* Titlu */}
        <div className="mb-3">
          <label className="form-label fw-medium" style={{ color: "#374151" }}>Titlu job</label>
          <input
            type="text"
            name="title"
            className="form-control"
            placeholder="ex: Frontend Developer Intern"
            value={formData.title}
            onChange={handleChange}
            style={{ borderRadius: "8px", padding: "10px 14px" }}
          />
        </div>

        {/* Locatie + Tip job pe aceeasi linie */}
        <div className="row mb-3">
          <div className="col-7">
            <label className="form-label fw-medium" style={{ color: "#374151" }}>Locație</label>
            <input
              type="text"
              name="location"
              className="form-control"
              placeholder="ex: Cluj-Napoca"
              value={formData.location}
              onChange={handleChange}
              style={{ borderRadius: "8px", padding: "10px 14px" }}
            />
          </div>
          <div className="col-5">
            <label className="form-label fw-medium" style={{ color: "#374151" }}>Tip job</label>
            <select
              name="job_type"
              className="form-select"
              value={formData.job_type}
              onChange={handleChange}
              style={{ borderRadius: "8px", padding: "10px 14px" }}
            >
              <option value="internship">Internship</option>
              <option value="junior">Junior</option>
            </select>
          </div>
        </div>

        {/* Descriere */}
        <div className="mb-3">
          <label className="form-label fw-medium" style={{ color: "#374151" }}>Descriere</label>
          <textarea
            name="description"
            className="form-control"
            placeholder="Descrie poziția, echipa, proiectele..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
            style={{ borderRadius: "8px", padding: "10px 14px" }}
          />
        </div>

        {/* Cerinte */}
        <div className="mb-4">
          <label className="form-label fw-medium" style={{ color: "#374151" }}>Cerințe</label>
          <textarea
            name="requirements"
            className="form-control"
            placeholder="ex: React, Python, SQL, Git..."
            value={formData.requirements}
            onChange={handleChange}
            rows={2}
            style={{ borderRadius: "8px", padding: "10px 14px" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
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
          {loading ? "Se postează..." : "Postează jobul"}
        </button>
      </div>
    </div>
  );
}

export default JobForm;
// Register.jsx — pagina de inregistrare cont nou

import { useState } from "react";

function Register({ onRegisterSuccess, navigateLaLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // valoarea implicita este student
  });

  const [eroare, setEroare] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEroare(null);
    setLoading(true);

    try {
      const raspuns = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const date = await raspuns.json();

      if (!raspuns.ok) {
        throw new Error(date.detail || "A apărut o eroare la înregistrare.");
      }

      // Daca totul a mers bine, il trimitem la login
      onRegisterSuccess();

    } catch (err) {
      setEroare(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f3ff", display: "flex", alignItems: "center" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-5">

            {/* Logo */}
            <div className="text-center mb-4">
              <h1 className="fw-bold" style={{ color: "#4f46e5", fontSize: "2rem" }}>
                🎓 StudentLink
              </h1>
              <p className="text-muted">Creează-ți contul gratuit</p>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
              <div style={{ height: "4px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", borderRadius: "16px 16px 0 0" }} />
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4" style={{ color: "#1e1b4b" }}>Cont nou</h4>

                {eroare && (
                  <div className="alert" style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px" }}>
                    ⚠️ {eroare}
                  </div>
                )}

                <div>
                  {/* Nume */}
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: "#374151" }}>Nume complet</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Ion Popescu"
                      value={formData.name}
                      onChange={handleChange}
                      style={{ borderRadius: "8px", padding: "10px 14px" }}
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: "#374151" }}>Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="ion@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      style={{ borderRadius: "8px", padding: "10px 14px" }}
                    />
                  </div>

                  {/* Parola */}
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: "#374151" }}>Parolă</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      style={{ borderRadius: "8px", padding: "10px 14px" }}
                    />
                  </div>

                  {/* Rol — student sau companie */}
                  <div className="mb-4">
                    <label className="form-label fw-medium" style={{ color: "#374151" }}>Sunt...</label>
                    <div className="d-flex gap-2">

                      {/* Buton Student */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "student" })}
                        className="btn flex-fill"
                        style={{
                          borderRadius: "8px",
                          border: `2px solid ${formData.role === "student" ? "#4f46e5" : "#e5e7eb"}`,
                          background: formData.role === "student" ? "#ede9fe" : "white",
                          color: formData.role === "student" ? "#4f46e5" : "#6b7280",
                          fontWeight: 600,
                          padding: "10px",
                        }}
                      >
                        🎓 Student
                      </button>

                      {/* Buton Companie */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "company" })}
                        className="btn flex-fill"
                        style={{
                          borderRadius: "8px",
                          border: `2px solid ${formData.role === "company" ? "#4f46e5" : "#e5e7eb"}`,
                          background: formData.role === "company" ? "#ede9fe" : "white",
                          color: formData.role === "company" ? "#4f46e5" : "#6b7280",
                          fontWeight: 600,
                          padding: "10px",
                        }}
                      >
                        🏢 Companie
                      </button>

                    </div>
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
                    {loading ? "Se creează contul..." : "Creează cont"}
                  </button>
                </div>

                <p className="text-center mt-3 mb-0 text-muted" style={{ fontSize: "0.9rem" }}>
                  Ai deja cont?{" "}
                  <span
                    onClick={navigateLaLogin}
                    style={{ color: "#4f46e5", cursor: "pointer", fontWeight: 600 }}
                  >
                    Intră în cont
                  </span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
// Login.jsx — pagina de autentificare

import { useState } from "react";

// Primim functia onLoginSuccess din App.jsx ca sa stim ce sa facem dupa login
function Login({ onLoginSuccess, navigateLaRegister }) {
  // Datele din formular
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [eroare, setEroare] = useState(null);
  const [loading, setLoading] = useState(false);

  // Actualizam state-ul cand userul scrie in input-uri
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault(); // opreste refresh-ul paginii
    setEroare(null);
    setLoading(true);

    try {
      const raspuns = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const date = await raspuns.json();

      if (!raspuns.ok) {
        // Daca serverul a returnat eroare (email/parola gresite)
        throw new Error(date.detail || "Email sau parolă incorecte.");
      }

      // Salvam tokenul si datele userului in localStorage
      // localStorage = o "memorie" a browserului care persista intre pagini
      localStorage.setItem("token", date.access_token);
      localStorage.setItem("role", date.role);
      localStorage.setItem("name", date.name);
      localStorage.setItem("user_id", date.user_id);

      // Anuntam App.jsx ca loginul a reusit
      onLoginSuccess(date);

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
              <p className="text-muted">Bine ai revenit!</p>
            </div>

            {/* Card formular */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
              <div style={{ height: "4px", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", borderRadius: "16px 16px 0 0" }} />
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4" style={{ color: "#1e1b4b" }}>Intră în cont</h4>

                {/* Mesaj de eroare */}
                {eroare && (
                  <div className="alert" style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px" }}>
                    ⚠️ {eroare}
                  </div>
                )}

                <div>
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
                  <div className="mb-4">
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

                  {/* Buton submit */}
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
                    {loading ? "Se încarcă..." : "Intră în cont"}
                  </button>
                </div>

                {/* Link catre register */}
                <p className="text-center mt-3 mb-0 text-muted" style={{ fontSize: "0.9rem" }}>
                  Nu ai cont?{" "}
                  <span
                    onClick={navigateLaRegister}
                    style={{ color: "#4f46e5", cursor: "pointer", fontWeight: 600 }}
                  >
                    Înregistrează-te
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

export default Login;
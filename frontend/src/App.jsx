// App.jsx — gestioneaza ce pagina se afiseaza si daca userul e logat

import { useState } from "react";
import JobFeed from "./pages/JobFeed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CompanyDashboard from "./pages/CompanyDashboard";
import Inbox from "./pages/Inbox";
import Navbar from "./components/Navbar";

function App() {
  const [pagina, setPagina] = useState("login");

  // Cand compania apasa "Mesaj" pe un student, salvam conversatia initiala
  const [conversatieInitiala, setConversatieInitiala] = useState(null);

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (token) {
      return {
        token,
        name: localStorage.getItem("name"),
        role: localStorage.getItem("role"),
        user_id: localStorage.getItem("user_id"),
      };
    }
    return null;
  });

  function handleLoginSuccess(date) {
    const userDate = {
      token: date.access_token,
      name: date.name,
      role: date.role,
      user_id: date.user_id,
    };
    setUser(userDate);
    setPagina(date.role === "company" ? "dashboard" : "feed");
  }

  function handleRegisterSuccess() {
    setPagina("login");
  }

  function handleLogout() {
    localStorage.clear();
    setUser(null);
    setPagina("login");
  }

  // Cand schimbam pagina resetam conversatia initiala
  function handleSetPagina(paginaNoua) {
    if (paginaNoua !== "inbox") setConversatieInitiala(null);
    setPagina(paginaNoua);
  }

  if (user) {
    return (
      <>
        <Navbar
          user={user}
          onLogout={handleLogout}
          paginaCurenta={pagina}
          setPagina={handleSetPagina}
        />

        {/* Pagini pentru studenti */}
        {user.role === "student" && pagina === "feed" && <JobFeed user={user} />}
        {user.role === "student" && pagina === "profile" && <Profile user={user} onLogout={handleLogout} />}
        {user.role === "student" && pagina === "inbox" && <Inbox user={user} onLogout={handleLogout} conversatieInitiala={conversatieInitiala} />}

        {/* Pagini pentru companii */}
        {user.role === "company" && pagina === "dashboard" && (
          <CompanyDashboard
            user={user}
            onLogout={handleLogout}
            setPagina={handleSetPagina}
            setConversatieInitiala={setConversatieInitiala}
          />
        )}
        {user.role === "company" && pagina === "profile" && <Profile user={user} onLogout={handleLogout} />}
        {user.role === "company" && pagina === "inbox" && <Inbox user={user} onLogout={handleLogout} conversatieInitiala={conversatieInitiala} />}
      </>
    );
  }

  return (
    <>
      {pagina === "login" && (
        <Login onLoginSuccess={handleLoginSuccess} navigateLaRegister={() => setPagina("register")} />
      )}
      {pagina === "register" && (
        <Register onRegisterSuccess={handleRegisterSuccess} navigateLaLogin={() => setPagina("login")} />
      )}
    </>
  );
}

export default App;
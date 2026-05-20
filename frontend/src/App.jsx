// App.jsx — gestioneaza ce pagina se afiseaza si daca userul e logat

import { useState } from "react";
import JobFeed from "./pages/JobFeed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CompanyDashboard from "./pages/CompanyDashboard";
import Navbar from "./components/Navbar";

function App() {
  const [pagina, setPagina] = useState("login");

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
    // Companiile merg la dashboard, studentii la feed
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

  if (user) {
    return (
      <>
        <Navbar
          user={user}
          onLogout={handleLogout}
          paginaCurenta={pagina}
          setPagina={setPagina}
        />

        {/* Pagini pentru studenti */}
        {user.role === "student" && pagina === "feed" && <JobFeed user={user} />}
        {user.role === "student" && pagina === "profile" && <Profile user={user} onLogout={handleLogout} />}

        {/* Pagini pentru companii */}
        {user.role === "company" && pagina === "dashboard" && <CompanyDashboard user={user} onLogout={handleLogout} />}
        {user.role === "company" && pagina === "profile" && <Profile user={user} onLogout={handleLogout} />}
      </>
    );
  }

  return (
    <>
      {pagina === "login" && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          navigateLaRegister={() => setPagina("register")}
        />
      )}
      {pagina === "register" && (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          navigateLaLogin={() => setPagina("login")}
        />
      )}
    </>
  );
}

export default App;
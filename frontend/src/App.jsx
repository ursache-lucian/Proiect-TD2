// App.jsx — gestioneaza ce pagina se afiseaza si daca userul e logat

import { useState } from "react";
import JobFeed from "./pages/JobFeed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";

function App() {
  const [pagina, setPagina] = useState("login");

  // Datele userului logat (null daca nu e logat)
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
    setUser({
      token: date.access_token,
      name: date.name,
      role: date.role,
      user_id: date.user_id,
    });
    setPagina("feed");
  }

  function handleRegisterSuccess() {
    setPagina("login");
  }

  function handleLogout() {
    localStorage.clear();
    setUser(null);
    setPagina("login");
  }

  // Daca userul e logat, afisam Navbar + pagina corespunzatoare
  if (user) {
    return (
      <>
        <Navbar
          user={user}
          onLogout={handleLogout}
          paginaCurenta={pagina}
          setPagina={setPagina}
        />

        {pagina === "feed" && <JobFeed user={user} />}
        {pagina === "profile" && <Profile user={user} onLogout={handleLogout} />}
      </>
    );
  }

  // Daca nu e logat
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
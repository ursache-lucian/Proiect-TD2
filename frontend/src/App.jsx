// App.jsx — gestioneaza ce pagina se afiseaza si daca userul e logat

import { useState } from "react";
import JobFeed from "./pages/JobFeed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";

function App() {
  // "pagina" controleaza ce vedem pe ecran: "login", "register", sau "feed"
  const [pagina, setPagina] = useState("login");

  // Datele userului logat (null daca nu e logat)
  const [user, setUser] = useState(() => {
    // La pornirea aplicatiei verificam daca exista deja un token salvat
    // Asta face ca userul sa ramana logat daca reincarca pagina
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

  // Se apeleaza dupa un login reusit
  function handleLoginSuccess(date) {
    setUser({
      token: date.access_token,
      name: date.name,
      role: date.role,
      user_id: date.user_id,
    });
    setPagina("feed");
  }

  // Se apeleaza dupa un register reusit — trimitem userul la login
  function handleRegisterSuccess() {
    setPagina("login");
  }

  // Sterge toate datele din localStorage si revine la login
  function handleLogout() {
    localStorage.clear();
    setUser(null);
    setPagina("login");
  }

  // Daca userul e deja logat, sarim direct la feed
  if (user) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <JobFeed user={user} />
      </>
    );
  }

  // Daca nu e logat, afisam login sau register
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
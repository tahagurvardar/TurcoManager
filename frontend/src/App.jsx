import { useEffect, useState } from "react";
import Login from "./Login";
import api from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const [teamStatus, setTeamStatus] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("tm_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user?.role === "manager") {
      api
        .get("/teams/my/status", { params: { league: "Süper Lig" } })
        .then((res) => setTeamStatus(res.data))
        .catch(() => setTeamStatus(null));
    }
  }, [user]);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Hoş geldin {user.username}</h1>
      <p>Rol: {user.role}</p>

      {user.role === "manager" && teamStatus && (
        <>
          <h2>{teamStatus.name} – Takım Durumu</h2>
          <ul>
            <li>Morale: {teamStatus.morale}</li>
            <li>Form: {teamStatus.form}</li>
            <li>Kimya: {teamStatus.chemistry}</li>
            <li>Yorgunluk: {teamStatus.fatigue}</li>
          </ul>
        </>
      )}

      <button
        onClick={() => {
          localStorage.clear();
          location.reload();
        }}
      >
        Çıkış
      </button>
    </div>
  );
}

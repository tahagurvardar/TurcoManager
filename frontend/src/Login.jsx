import { useState } from "react";
import { Lock, LogIn, Shield, UserRound } from "lucide-react";
import api from "./api";

const demoAccounts = [
  { username: "admin", label: "Admin" },
  { username: "gs", label: "Galatasaray" },
  { username: "fb", label: "Fenerbahçe" },
  { username: "bjk", label: "Beşiktaş" },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("gs");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("tm_token", response.data.token);
      localStorage.setItem("tm_user", JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-visual__badge">
          <Shield size={20} />
          Turco Manager 26
        </div>
        <h1>Sezonu yönet, taktiği kur, kupaya koş.</h1>
        <p>Modern futbol menajerliği için dashboard, maç merkezi, transfer, finans ve genç oyuncu gelişimi tek panelde.</p>
        <div className="login-visual__pitch">
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="login-card">
        <div className="login-card__header">
          <div className="brand__mark">TM</div>
          <div>
            <strong>Giriş</strong>
            <span>Teknik direktör veya admin hesabı</span>
          </div>
        </div>

        <form onSubmit={submit}>
          <label>
            <UserRound size={18} />
            <input
              autoComplete="username"
              placeholder="Kullanıcı adı"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label>
            <Lock size={18} />
            <input
              autoComplete="current-password"
              placeholder="Şifre"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button className="primary-action" disabled={loading} type="submit">
            <LogIn size={18} />
            {loading ? "Giriş yapılıyor" : "Giriş Yap"}
          </button>
        </form>

        {error && <p className="login-error">{error}</p>}

        <div className="demo-list">
          {demoAccounts.map((account) => (
            <button
              key={account.username}
              onClick={() => {
                setUsername(account.username);
                setPassword("123456");
              }}
              type="button"
            >
              {account.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

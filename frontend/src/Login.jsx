import { useState } from "react";
import api from "./api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("tm_token", res.data.token);
      localStorage.setItem("tm_user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login hatası");
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "100px auto" }}>
      <h2>Turco Manager Login</h2>

      <form onSubmit={submit}>
        <input
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />

        <button style={{ width: "100%" }}>Giriş Yap</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p style={{ fontSize: 12, marginTop: 10 }}>
        admin / gs / fb / bjk <br />
        şifre: <b>123456</b>
      </p>
    </div>
  );
}

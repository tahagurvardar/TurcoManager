import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, Dumbbell, HeartPulse, Search, Trophy } from "lucide-react";
import api from "../api";
import { LEAGUE, roleLabel } from "../utils/format";

function buildNotifications(data) {
  const lastMatch = data?.fixtures?.lastMatches?.[0] || data?.recentMatches?.[0];
  const injury = data?.squad?.injuredPlayers?.[0] || data?.injuries?.[0];
  const sponsor = data?.finances?.sponsorships?.at?.(-1);

  return [
    lastMatch && {
      icon: Trophy,
      title: "Son maç sonucu",
      text: `${lastMatch.homeTeam?.shortName || lastMatch.homeTeam?.name} ${lastMatch.homeGoals}-${lastMatch.awayGoals} ${lastMatch.awayTeam?.shortName || lastMatch.awayTeam?.name}`,
    },
    injury && {
      icon: HeartPulse,
      title: "Sakatlık raporu",
      text: `${injury.name} için sağlık ekibi takipte.`,
    },
    sponsor && {
      icon: CalendarDays,
      title: "Sponsor",
      text: `${sponsor.name} anlaşması aktif.`,
    },
    {
      icon: Dumbbell,
      title: "Antrenman",
      text: data?.matchPlan?.recommendedTraining ? `${data.matchPlan.recommendedTraining} seansı öneriliyor.` : "Haftalık plan hazır.",
    },
  ].filter(Boolean);
}

export default function TopBar({ data, teamName, user }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const activeResults = query.trim().length >= 2 ? results : null;
  const notifications = useMemo(() => buildNotifications(data), [data]);

  useEffect(() => {
    if (query.trim().length < 2) {
      return undefined;
    }

    const handle = window.setTimeout(async () => {
      try {
        const response = await api.get("/search", { params: { q: query, league: LEAGUE } });
        setResults(response.data);
      } catch {
        setResults(null);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query]);

  return (
    <header className="topbar">
      <div>
        <p className="topbar__meta">{LEAGUE} · {roleLabel(user.role)}</p>
        <h1>{teamName || "Lig Operasyon Merkezi"}</h1>
      </div>

      <div className="topbar__actions">
        <div className="search-shell">
          <label className="search">
            <Search size={17} />
            <input aria-label="Ara" onChange={(event) => setQuery(event.target.value)} placeholder="Oyuncu, maç, kulüp ara" value={query} />
          </label>
          {activeResults && (
            <div className="search-results">
              <strong>Arama Sonuçları</strong>
              {[...(activeResults.teams || []), ...(activeResults.players || []), ...(activeResults.matches || [])].length === 0 && (
                <span className="empty-copy">Sonuç bulunamadı.</span>
              )}
              {(activeResults.teams || []).map((team) => (
                <span key={team._id}>Kulüp · {team.name}</span>
              ))}
              {(activeResults.players || []).map((player) => (
                <span key={player._id}>Oyuncu · {player.name} · {player.team?.shortName || player.team?.name}</span>
              ))}
              {(activeResults.matches || []).map((match) => (
                <span key={match._id}>
                  Maç · H{match.week} · {match.homeTeam?.shortName || match.homeTeam?.name} - {match.awayTeam?.shortName || match.awayTeam?.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="notification-shell">
          <button className="icon-button" onClick={() => setNotificationsOpen((open) => !open)} title="Bildirimler" type="button">
            <Bell size={18} />
          </button>
          {notificationsOpen && (
            <div className="notification-menu">
              {notifications.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="notification-item" key={item.title}>
                    <Icon size={17} />
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

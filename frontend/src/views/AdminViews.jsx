import { useEffect, useMemo, useState } from "react";
import { Activity, Banknote, CalendarDays, HeartPulse, Shield, Trophy, Users } from "lucide-react";
import api from "../api";
import MatchCard from "../components/MatchCard";
import Modal from "../components/Modal";
import Panel from "../components/Panel";
import StandingTable from "../components/StandingTable";
import StatCard from "../components/StatCard";
import { formatCompact, formatDate, formatMoney, LEAGUE } from "../utils/format";

function MatchDetailModal({ match, onClose }) {
  const [detail, setDetail] = useState(match);

  useEffect(() => {
    if (!match?._id) return;
    api.get(`/matches/${match._id}/center`).then((response) => setDetail(response.data)).catch(() => setDetail(match));
  }, [match]);

  const events = detail?.events?.length ? detail.events : detail?.liveEvents || [];

  return (
    <Modal onClose={onClose} title="Maç Detayı">
      <div className="scoreboard scoreboard--modal">
        <div>
          <span>{detail?.homeTeam?.name}</span>
          <strong>{detail?.homeGoals ?? "-"}</strong>
        </div>
        <Activity size={26} />
        <div>
          <span>{detail?.awayTeam?.name}</span>
          <strong>{detail?.awayGoals ?? "-"}</strong>
        </div>
      </div>
      <div className="match-detail-meta">
        <span>Hafta {detail?.week}</span>
        <span>{detail?.status === "played" ? "Oynandı" : "Bekliyor"}</span>
        <span>{formatDate(detail?.date)}</span>
      </div>
      <div className="timeline">
        {events.length === 0 && <p className="empty-copy">Bu maç için henüz özet olayı yok.</p>}
        {events.map((event, index) => (
          <div className="timeline__event" key={`${event.minute}-${event.type}-${index}`}>
            <b>{event.minute}'</b>
            <span>{event.text}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export function AdminDashboard({ data }) {
  return (
    <div className="view-grid">
      <div className="stat-grid span-12">
        <StatCard icon={Shield} label="Kulüp" value={data.totals?.teams || 0} detail={LEAGUE} />
        <StatCard icon={Users} label="Oyuncu" value={data.totals?.players || 0} detail="Kayıtlı kadro" />
        <StatCard icon={CalendarDays} label="Bekleyen Maç" value={data.totals?.pendingMatches || 0} />
        <StatCard icon={Banknote} label="Lig Bakiye" value={formatMoney(data.totals?.totalBalance)} />
      </div>

      <Panel title="Lig Tablosu" className="span-7 table-panel--fixed">
        <StandingTable rows={data.standings || []} />
      </Panel>

      <Panel title="Yaklaşan Maçlar" className="span-5">
        <div className="stack-list">
          {(data.nextMatches || []).slice(0, 7).map((match) => (
            <div className="fixture-row" key={match._id}>
              <CalendarDays size={18} />
              <div>
                <strong>{match.homeTeam?.shortName || match.homeTeam?.name} - {match.awayTeam?.shortName || match.awayTeam?.name}</strong>
                <span>Hafta {match.week} · {formatDate(match.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Sakat Oyuncular" className="span-12">
        <div className="injury-grid">
          {(data.injuries || []).length === 0 && <p className="empty-copy">Aktif sakat oyuncu yok.</p>}
          {(data.injuries || []).slice(0, 18).map((player) => (
            <div className="info-row" key={player._id}>
              <HeartPulse size={18} />
              <div>
                <strong>{player.name}</strong>
                <span>
                  {player.team?.shortName || player.team?.name} · {player.injuryType || player.injury?.type || "Sakatlık"} · Hafta{" "}
                  {player.injuryUntilWeek || "-"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function ClubsView({ data }) {
  return (
    <Panel title="Kulüp Operasyonları">
      <div className="club-grid">
        {(data.teams || []).map((team) => (
          <article className="club-card" key={team.id}>
            <div>
              <strong>{team.name}</strong>
              <span>Bakiye {formatCompact(team.balance)}</span>
            </div>
            <div className="club-card__bars">
              <span style={{ width: `${Math.min(100, team.morale)}%` }} />
              <span style={{ width: `${Math.min(100, team.chemistry)}%` }} />
            </div>
            <small>Moral {team.morale} · Kimya {team.chemistry} · Yorgunluk {team.fatigue}</small>
          </article>
        ))}
      </div>
    </Panel>
  );
}

export function CalendarView({ data, onReload }) {
  const [busy, setBusy] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const matches = useMemo(() => data.matches || [], [data.matches]);
  const weeks = data.weeks?.length ? data.weeks : [...new Set(matches.map((match) => match.week))].sort((a, b) => a - b);
  const firstPendingWeek = matches.find((match) => match.status === "pending")?.week || weeks[0] || 1;
  const [selectedWeek, setSelectedWeek] = useState(firstPendingWeek);

  const weekMatches = useMemo(
    () => matches.filter((match) => Number(match.week) === Number(selectedWeek)),
    [matches, selectedWeek]
  );

  const simulateWeek = async () => {
    setBusy(`week-${selectedWeek}`);
    await api.get("/matches/simulate-week", { params: { league: LEAGUE, week: selectedWeek } });
    await onReload();
    setBusy("");
  };

  const simulateMatch = async (match) => {
    setBusy(match._id);
    await api.get(`/matches/${match._id}/simulate`);
    await onReload();
    setBusy("");
  };

  const generate = async () => {
    setBusy("generate");
    await api.get("/fixtures/generate", { params: { league: LEAGUE, double: true } });
    await onReload();
    setBusy("");
  };

  return (
    <div className="view-grid">
      <Panel
        title="Fikstür Yönetimi"
        action={
          <div className="action-row">
            <button className="ghost-action" disabled={Boolean(busy)} onClick={generate} type="button">Fikstür Üret</button>
            <button className="primary-action primary-action--compact" disabled={Boolean(busy)} onClick={simulateWeek} type="button">
              <Activity size={17} /> Haftayı Simüle Et
            </button>
          </div>
        }
        className="span-12"
      >
        <div className="week-tabs">
          {weeks.map((week) => (
            <button className={Number(selectedWeek) === Number(week) ? "chip chip--active" : "chip"} key={week} onClick={() => setSelectedWeek(week)} type="button">
              Hafta {week}
            </button>
          ))}
        </div>
        <div className="fixture-grid fixture-grid--wide">
          {weekMatches.map((match) => (
            <MatchCard
              busy={Boolean(busy)}
              key={match._id}
              match={match}
              onDetail={setSelectedMatch}
              onSimulate={simulateMatch}
            />
          ))}
        </div>
      </Panel>
      {selectedMatch && <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
    </div>
  );
}

export function AnalyticsView({ data }) {
  return (
    <div className="view-grid">
      <Panel title="Lig Sağlığı" className="span-4">
        <div className="metric-stack">
          <StatCard icon={Trophy} label="Oynanan" value={data.totals?.playedMatches || 0} />
          <StatCard icon={CalendarDays} label="Bekleyen" value={data.totals?.pendingMatches || 0} />
          <StatCard icon={Activity} label="Sakatlık" value={data.totals?.injuredPlayers || 0} tone={data.totals?.injuredPlayers ? "danger" : "green"} />
        </div>
      </Panel>
      <Panel title="Son Maçlar" className="span-8">
        <div className="stack-list">
          {(data.recentMatches || []).map((match) => (
            <div className="fixture-row" key={match._id}>
              <Trophy size={18} />
              <div>
                <strong>
                  {match.homeTeam?.name} {match.homeGoals} - {match.awayGoals} {match.awayTeam?.name}
                </strong>
                <span>Hafta {match.week}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

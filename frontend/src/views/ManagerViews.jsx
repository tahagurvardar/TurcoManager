import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Banknote,
  Briefcase,
  Dumbbell,
  Gauge,
  Handshake,
  HeartPulse,
  Save,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import api from "../api";
import Panel from "../components/Panel";
import PlayerTable from "../components/PlayerTable";
import ProgressBar from "../components/ProgressBar";
import StandingTable from "../components/StandingTable";
import StatCard from "../components/StatCard";
import { formatDate, formatMoney, LEAGUE } from "../utils/format";

const FORMATION_LAYOUTS = {
  "4-3-3": [
    ["KL", 50, 88],
    ["DEF", 18, 68],
    ["DEF", 38, 72],
    ["DEF", 62, 72],
    ["DEF", 82, 68],
    ["OS", 30, 48],
    ["OS", 50, 52],
    ["OS", 70, 48],
    ["FVT", 24, 22],
    ["FVT", 50, 16],
    ["FVT", 76, 22],
  ],
  "4-2-3-1": [
    ["KL", 50, 88],
    ["DEF", 18, 68],
    ["DEF", 38, 72],
    ["DEF", 62, 72],
    ["DEF", 82, 68],
    ["OS", 38, 54],
    ["OS", 62, 54],
    ["OS", 24, 35],
    ["OS", 50, 32],
    ["OS", 76, 35],
    ["FVT", 50, 15],
  ],
  "4-4-2": [
    ["KL", 50, 88],
    ["DEF", 18, 68],
    ["DEF", 38, 72],
    ["DEF", 62, 72],
    ["DEF", 82, 68],
    ["OS", 18, 45],
    ["OS", 40, 48],
    ["OS", 60, 48],
    ["OS", 82, 45],
    ["FVT", 40, 18],
    ["FVT", 60, 18],
  ],
  "3-5-2": [
    ["KL", 50, 88],
    ["DEF", 30, 70],
    ["DEF", 50, 74],
    ["DEF", 70, 70],
    ["OS", 16, 48],
    ["OS", 34, 50],
    ["OS", 50, 52],
    ["OS", 66, 50],
    ["OS", 84, 48],
    ["FVT", 40, 18],
    ["FVT", 60, 18],
  ],
  "3-4-3": [
    ["KL", 50, 88],
    ["DEF", 30, 70],
    ["DEF", 50, 74],
    ["DEF", 70, 70],
    ["OS", 18, 48],
    ["OS", 40, 52],
    ["OS", 60, 52],
    ["OS", 82, 48],
    ["FVT", 24, 22],
    ["FVT", 50, 16],
    ["FVT", 76, 22],
  ],
  "4-1-4-1": [
    ["KL", 50, 88],
    ["DEF", 18, 68],
    ["DEF", 38, 72],
    ["DEF", 62, 72],
    ["DEF", 82, 68],
    ["OS", 50, 56],
    ["OS", 18, 38],
    ["OS", 40, 42],
    ["OS", 60, 42],
    ["OS", 82, 38],
    ["FVT", 50, 15],
  ],
  "5-3-2": [
    ["KL", 50, 88],
    ["DEF", 12, 66],
    ["DEF", 30, 72],
    ["DEF", 50, 74],
    ["DEF", 70, 72],
    ["DEF", 88, 66],
    ["OS", 32, 48],
    ["OS", 50, 52],
    ["OS", 68, 48],
    ["FVT", 40, 18],
    ["FVT", 60, 18],
  ],
};

function defaultPositions(formation = "4-2-3-1") {
  return (FORMATION_LAYOUTS[formation] || FORMATION_LAYOUTS["4-2-3-1"]).map(([position, x, y], index) => ({
    slot: `${position}-${index + 1}`,
    position,
    x,
    y,
  }));
}

export function ManagerDashboard({ data }) {
  const team = data.team;
  const nextMatch = data.fixtures?.nextMatch;

  return (
    <div className="view-grid">
      <section className="hero-shell">
        <div>
          <p className="hero-shell__meta">Hafta planı</p>
          <h2>{nextMatch ? `${nextMatch.opponent?.name} maçına hazırlık` : "Sezon planı hazır"}</h2>
          <p>{data.matchPlan?.tacticalWarning}</p>
        </div>
        <div className="match-card">
          <span>{nextMatch ? formatDate(nextMatch.date) : "Fikstür bekleniyor"}</span>
          <strong>{nextMatch ? `${nextMatch.homeTeam?.shortName || nextMatch.homeTeam?.name} - ${nextMatch.awayTeam?.shortName || nextMatch.awayTeam?.name}` : "Rakip yok"}</strong>
          <small>{nextMatch?.venue === "home" ? "İç saha" : nextMatch?.venue === "away" ? "Deplasman" : "Lig merkezi"}</small>
        </div>
      </section>

      <div className="stat-grid">
        <StatCard icon={Trophy} label="Lig Sırası" value={data.standings?.position || "-"} detail={`${LEAGUE}`} tone="gold" />
        <StatCard icon={Users} label="Kadro" value={team.squadSize} detail={`Yaş ort. ${data.squad?.averageAge}`} />
        <StatCard icon={HeartPulse} label="Sakat" value={team.injuredCount} detail="Sağlık raporu" tone={team.injuredCount ? "danger" : "green"} />
        <StatCard icon={Banknote} label="Transfer" value={formatMoney(data.finances?.transferBudget)} detail="Kalan bütçe" />
      </div>

      <Panel title="Takım Dinamikleri" className="span-4">
        <div className="meter-grid">
          <ProgressBar label="Moral" value={team.morale} />
          <ProgressBar label="Form" value={team.form} tone="blue" />
          <ProgressBar label="Kimya" value={team.chemistry} tone="gold" />
          <ProgressBar label="Yorgunluk" value={team.fatigue} max={150} tone="danger" />
        </div>
      </Panel>

      <Panel title="Puan Durumu" className="span-8">
        <StandingTable currentTeamId={team.teamId} rows={data.standings?.topFive || []} />
      </Panel>

      <Panel title="En Formda Oyuncular" className="span-6">
        <PlayerTable compact players={data.squad?.topPerformers || []} />
      </Panel>

      <Panel title="Transfer Fırsatları" className="span-6">
        <div className="market-list">
          {(data.marketShortlist || []).slice(0, 5).map((player) => (
            <div className="market-row" key={player.id}>
              <div>
                <strong>{player.name}</strong>
                <span>{player.position} · {player.age} yaş · OVR {Math.round(player.overall)}</span>
              </div>
              <b>{formatMoney(player.value)}</b>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function SquadView({ data }) {
  return (
    <div className="view-grid">
      <Panel title="Kadro Planlama" className="span-12">
        <PlayerTable players={data.squad?.players || []} />
      </Panel>
      <Panel title="Sakatlık Raporu" className="span-6">
        <div className="stack-list">
          {(data.squad?.injuredPlayers || []).length === 0 && <p className="empty-copy">Aktif sakat oyuncu yok.</p>}
          {(data.squad?.injuredPlayers || []).map((player) => (
            <div className="info-row" key={player._id}>
              <HeartPulse size={18} />
              <div>
                <strong>{player.name}</strong>
                <span>
                  {player.injuryType || player.injury?.type} · dönüş{" "}
                  {player.injuryUntilWeek ? `hafta ${player.injuryUntilWeek}` : formatDate(player.injury?.returnDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Genç Potansiyeller" className="span-6">
        <div className="stack-list">
          {(data.squad?.prospects || []).map((player) => (
            <div className="info-row" key={player._id}>
              <Sparkles size={18} />
              <div>
                <strong>{player.name}</strong>
                <span>{player.position} · POT {Math.round(player.potential || player.overall)}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function MatchCenterView({ data }) {
  const matchOptions = useMemo(
    () => [data.fixtures?.nextMatch, ...(data.fixtures?.lastMatches || [])].filter(Boolean),
    [data.fixtures]
  );
  const [selectedId, setSelectedId] = useState(matchOptions[0]?.id || "");
  const [match, setMatch] = useState(null);

  useEffect(() => {
    if (!selectedId) return;
    api.get(`/matches/${selectedId}/center`).then((response) => setMatch(response.data)).catch(() => setMatch(null));
  }, [selectedId]);

  return (
    <div className="view-grid">
      <Panel title="Maç Merkezi" className="span-8">
        <div className="match-selector">
          {matchOptions.map((item) => (
            <button
              className={selectedId === item.id ? "chip chip--active" : "chip"}
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              type="button"
            >
              Hafta {item.week}
            </button>
          ))}
        </div>

        <div className="scoreboard">
          <div>
            <span>{match?.homeTeam?.name || "Ev sahibi"}</span>
            <strong>{match?.homeGoals ?? "-"}</strong>
          </div>
          <Activity size={26} />
          <div>
            <span>{match?.awayTeam?.name || "Deplasman"}</span>
            <strong>{match?.awayGoals ?? "-"}</strong>
          </div>
        </div>

        <div className="timeline">
          {((match?.events?.length ? match.events : match?.liveEvents) || []).length === 0 && <p className="empty-copy">Bu maç henüz oynanmadı.</p>}
          {((match?.events?.length ? match.events : match?.liveEvents) || []).map((event, index) => (
            <div className="timeline__event" key={`${event.minute}-${index}`}>
              <b>{event.minute}'</b>
              <span>{event.text}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Maç İstatistikleri" className="span-4">
        <div className="metric-stack">
          <ProgressBar label="Topa Sahip Olma" value={match?.possession?.home || 50} max={100} tone="blue" />
          <ProgressBar label="Şut Ev" value={match?.shots?.home || 0} max={25} tone="gold" />
          <ProgressBar label="Şut Dep." value={match?.shots?.away || 0} max={25} tone="green" />
          <ProgressBar label="xG Ev" value={(match?.xg?.home || 0) * 20} max={60} />
        </div>
      </Panel>

      <Panel title="Oyuncu Puanları" className="span-12">
        <div className="rating-grid">
          {(match?.playerRatings || []).slice(0, 16).map((rating) => (
            <div className="rating-card" key={`${rating.player?._id}-${rating.team?._id}`}>
              <strong>{rating.player?.name}</strong>
              <span>{rating.team?.shortName || rating.team?.name} · {rating.player?.position}</span>
              <b>{rating.rating?.toFixed?.(1) || rating.rating}</b>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function LegacyTacticsView({ data, onReload }) {
  const [form, setForm] = useState(data.team?.tactics || {});
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    await api.put("/tactics/my", form, { params: { league: LEAGUE } });
    await onReload();
    setSaving(false);
  };

  return (
    <div className="view-grid">
      <Panel title="Taktik Tahtası" className="span-5">
        <div className="pitch">
          {["FVT", "OS", "OS", "DEF", "DEF", "KL"].map((position, index) => (
            <span className={`pitch__player pitch__player--${index}`} key={`${position}-${index}`}>{position}</span>
          ))}
        </div>
      </Panel>

      <Panel title="Oyun Planı" className="span-7">
        <div className="form-grid">
          <label>
            Diziliş
            <select value={form.formation || "4-2-3-1"} onChange={(event) => update("formation", event.target.value)}>
              {["4-2-3-1", "4-3-3", "3-5-2", "4-4-2", "4-1-4-1"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Mentalite
            <select value={form.mentality || "balanced"} onChange={(event) => update("mentality", event.target.value)}>
              <option value="defensive">Defansif</option>
              <option value="balanced">Dengeli</option>
              <option value="attacking">Ofansif</option>
            </select>
          </label>
          {["pressing", "tempo", "defensiveLine", "width", "creativity"].map((key) => (
            <label className="range-control" key={key}>
              {key}
              <input max="100" min="0" onChange={(event) => update(key, Number(event.target.value))} type="range" value={form[key] || 50} />
            </label>
          ))}
        </div>
        <button className="primary-action" disabled={saving} onClick={save} type="button">
          <ShieldCheck size={18} />
          Taktikleri Kaydet
        </button>
      </Panel>
    </div>
  );
}

export function TacticsView({ data, onReload }) {
  const tactics = useMemo(() => data.team?.tactics || {}, [data.team?.tactics]);
  const [draggingSlot, setDraggingSlot] = useState("");
  const [form, setForm] = useState(() => ({
    ...tactics,
    formation: tactics.formation || "4-2-3-1",
    playerPositions:
      tactics.playerPositions?.length === 11 ? tactics.playerPositions : defaultPositions(tactics.formation || "4-2-3-1"),
  }));
  const [saving, setSaving] = useState(false);

  const update = (key, value) => {
    setForm((current) => {
      if (key === "formation") {
        return { ...current, formation: value, playerPositions: defaultPositions(value) };
      }
      return { ...current, [key]: value };
    });
  };

  const moveSlot = (slot, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(4, Math.min(96, ((event.clientY - rect.top) / rect.height) * 100));
    setForm((current) => ({
      ...current,
      playerPositions: (current.playerPositions || []).map((item) => (item.slot === slot ? { ...item, x, y } : item)),
    }));
  };

  const save = async () => {
    setSaving(true);
    await api.put("/tactics/my", form, { params: { league: LEAGUE } });
    await onReload();
    setSaving(false);
  };

  return (
    <div className="view-grid">
      <Panel title="Taktik Tahtası" className="span-5">
        <div
          className="pitch"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (draggingSlot) moveSlot(draggingSlot, event);
          }}
        >
          {(form.playerPositions || []).map((player, index) => (
            <span
              className="pitch__player pitch__player--draggable"
              draggable
              key={player.slot}
              onDragStart={() => setDraggingSlot(player.slot)}
              style={{ left: `${player.x}%`, top: `${player.y}%` }}
              title="Sürükle ve konumlandır"
            >
              <small>{index + 1}</small>
              {player.position}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="Oyun Planı" className="span-7">
        <div className="form-grid">
          <label>
            Diziliş
            <select value={form.formation || "4-2-3-1"} onChange={(event) => update("formation", event.target.value)}>
              {Object.keys(FORMATION_LAYOUTS).map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Mentalite
            <select value={form.mentality || "balanced"} onChange={(event) => update("mentality", event.target.value)}>
              <option value="defensive">Defansif</option>
              <option value="balanced">Dengeli</option>
              <option value="attacking">Ofansif</option>
            </select>
          </label>
          {["pressing", "tempo", "defensiveLine", "width", "creativity"].map((key) => (
            <label className="range-control" key={key}>
              <span className="range-control__label">
                {key}
                <b>{form[key] ?? 50}</b>
              </span>
              <input max="100" min="0" onChange={(event) => update(key, Number(event.target.value))} type="range" value={form[key] ?? 50} />
            </label>
          ))}
        </div>
        <button className="primary-action" disabled={saving} onClick={save} type="button">
          <Save size={18} />
          Taktikleri Kaydet
        </button>
      </Panel>
    </div>
  );
}

export function TrainingView({ data, onReload }) {
  const [busy, setBusy] = useState("");
  const focusItems = [
    { id: "balanced", label: "Dengeli", icon: Gauge },
    { id: "technical", label: "Teknik", icon: Activity },
    { id: "tactical", label: "Taktik", icon: ShieldCheck },
    { id: "fitness", label: "Kondisyon", icon: Dumbbell },
    { id: "recovery", label: "Toparlanma", icon: HeartPulse },
    { id: "youth", label: "Gençler", icon: Sparkles },
  ];

  const train = async (focus) => {
    setBusy(focus);
    await api.post("/players/training/team", { focus, intensity: focus === "recovery" ? "light" : "normal" }, { params: { league: LEAGUE } });
    await onReload();
    setBusy("");
  };

  return (
    <div className="view-grid">
      <Panel title="Antrenman Merkezi" className="span-8">
        <div className="training-grid">
          {focusItems.map((item) => {
            const Icon = item.icon;
            return (
              <button className="training-card" disabled={Boolean(busy)} key={item.id} onClick={() => train(item.id)} type="button">
                <Icon size={22} />
                <strong>{item.label}</strong>
                <span>{busy === item.id ? "Uygulanıyor" : "Seans başlat"}</span>
              </button>
            );
          })}
        </div>
      </Panel>
      <Panel title="Antrenman Etkisi" className="span-4">
        <ProgressBar label="Moral" value={data.team?.morale} />
        <ProgressBar label="Kimya" value={data.team?.chemistry} tone="gold" />
        <ProgressBar label="Yorgunluk" value={data.team?.fatigue} max={150} tone="danger" />
      </Panel>
    </div>
  );
}

export function TransfersView({ data, onReload }) {
  const [market, setMarket] = useState(data.marketShortlist || []);
  const [loading, setLoading] = useState(false);

  const refreshMarket = async () => {
    setLoading(true);
    const response = await api.get("/transfers/market", { params: { league: LEAGUE } });
    setMarket(response.data.players || []);
    setLoading(false);
  };

  const bid = async (player) => {
    await api.post("/transfers/bid", { playerId: player.id, offer: player.value }, { params: { league: LEAGUE } });
    await onReload();
    await refreshMarket();
  };

  return (
    <Panel
      title="Transfer Market"
      action={<button className="ghost-action" disabled={loading} onClick={refreshMarket} type="button">Yenile</button>}
    >
      <div className="transfer-grid">
        {market.map((player) => (
          <article className="transfer-card" key={player.id}>
            <span>{player.position} · {player.age} yaş</span>
            <strong>{player.name}</strong>
            <div className="transfer-card__meta">
              <b>OVR {Math.round(player.overall)}</b>
              <b>POT {Math.round(player.potential || player.overall)}</b>
            </div>
            <div className="transfer-card__footer">
              <span>{formatMoney(player.value)}</span>
              <button onClick={() => bid(player)} type="button">Teklif</button>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

export function FinancesView({ data, onReload }) {
  const finances = data.finances;

  const sign = async (tier) => {
    await api.post(`/finances/sponsorships/${tier}/sign`, null, { params: { league: LEAGUE } });
    await onReload();
  };

  return (
    <div className="view-grid">
      <div className="stat-grid span-12">
        <StatCard icon={Banknote} label="Bakiye" value={formatMoney(finances?.balance)} />
        <StatCard icon={ShieldCheck} label="Transfer" value={formatMoney(finances?.transferBudget)} />
        <StatCard icon={Users} label="Maaş" value={formatMoney(finances?.weeklyWage)} />
        <StatCard icon={Activity} label="Aylık Proj." value={formatMoney(finances?.projectedMonthlyProfit)} tone={finances?.projectedMonthlyProfit < 0 ? "danger" : "green"} />
      </div>
      <Panel title="Sponsorluklar" className="span-12">
        <div className="sponsor-grid">
          {(finances?.availableSponsors || []).map((sponsor) => (
            <article className="sponsor-card" key={sponsor.tier}>
              <span>{sponsor.tier}</span>
              <strong>{sponsor.name}</strong>
              <b>{formatMoney(sponsor.value)}</b>
              <p>
                Risk: {sponsor.risk || "-"} · Şart: {sponsor.condition || "-"}
                <br />
                {sponsor.impact || "İmza sonrası bütçe ve nakit dengesi güncellenir."}
              </p>
              <button disabled={!sponsor.available || sponsor.signed} onClick={() => sign(sponsor.tier)} type="button">
                {sponsor.signed ? "İmzalandı" : "İmzala"}
              </button>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function LegacyAcademyView({ data, onReload }) {
  const promote = async () => {
    await api.post("/academy/promote", {}, { params: { league: LEAGUE } });
    await onReload();
  };

  return (
    <div className="view-grid">
      <Panel
        title="Genç Oyuncu Gelişimi"
        action={<button className="primary-action primary-action--compact" onClick={promote} type="button"><Sparkles size={17} /> Oyuncu Yükselt</button>}
        className="span-12"
      >
        <div className="academy-banner">
          <strong>Akademi seviyesi {data.team?.facilities?.youth || 0}</strong>
          <span>Potansiyel üretimi tesis kalitesine ve gençlik yatırımına bağlıdır.</span>
        </div>
        <PlayerTable players={data.squad?.prospects || []} />
      </Panel>
    </div>
  );
}

export function AcademyView({ data, onReload }) {
  const academy = data.academy || {};
  const prospects = academy.prospects || [];
  const limitReached = prospects.length >= (academy.limit || 11);

  const promote = async () => {
    if (limitReached) return;
    await api.post("/academy/promote", {}, { params: { league: LEAGUE } });
    await onReload();
  };

  return (
    <div className="view-grid">
      <Panel
        title="Genç Oyuncu Gelişimi"
        action={
          <button className="primary-action primary-action--compact" disabled={limitReached} onClick={promote} type="button">
            <Sparkles size={17} /> {limitReached ? "Limit Dolu" : "Oyuncu Yükselt"}
          </button>
        }
        className="span-12"
      >
        <div className="academy-banner">
          <strong>Akademi seviyesi {data.team?.facilities?.youth || 0}</strong>
          <span>{prospects.length}/{academy.limit || 11} akademi oyuncusu · kalan slot {academy.remainingSlots ?? Math.max(0, 11 - prospects.length)}</span>
        </div>
        <div className="academy-grid">
          {prospects.length === 0 && <p className="empty-copy">Henüz akademi oyuncusu yok.</p>}
          {prospects.map((player) => (
            <article className="academy-card" key={player._id || player.id}>
              <span>{player.position} · {player.age} yaş</span>
              <strong>{player.name}</strong>
              <div className="transfer-card__meta">
                <b>OVR {Math.round(player.overall || 0)}</b>
                <b>POT {Math.round(player.potential || 0)}</b>
              </div>
              <small>Gelişim: {player.development?.focus || "youth"} · seviye {player.youth?.academyLevel || data.team?.facilities?.youth || 0}</small>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function ManagementView({ data }) {
  const morale = data.team?.morale || 50;
  const position = data.standings?.position || "-";

  return (
    <div className="view-grid">
      <div className="stat-grid span-12">
        <StatCard icon={Briefcase} label="Yönetim Güveni" value={`${Math.min(100, morale + 12)}%`} detail={`Lig sırası ${position}`} />
        <StatCard icon={Users} label="Taraftar Güveni" value={`${Math.min(100, morale + 6)}%`} detail="Form ve derbi etkisi" />
        <StatCard icon={Handshake} label="Sponsor Güveni" value={`${Math.min(100, data.team?.reputation || 70)}%`} detail="Ticari görünürlük" />
        <StatCard icon={Trophy} label="Hedef" value={data.team?.seasonObjectives?.boardTarget || "Üst sıra"} detail={data.team?.seasonObjectives?.managerTarget} />
      </div>
      <Panel title="Yönetim Hedefleri" className="span-12">
        <div className="management-grid">
          <div className="info-row">
            <ShieldCheck size={18} />
            <div>
              <strong>Sezon beklentisi</strong>
              <span>{data.team?.seasonObjectives?.boardTarget || "Yönetim hedefi hazırlanıyor."}</span>
            </div>
          </div>
          <div className="info-row">
            <Banknote size={18} />
            <div>
              <strong>Bütçe disiplini</strong>
              <span>Aylık projeksiyon {formatMoney(data.finances?.monthlyProjection ?? data.finances?.projectedMonthlyProfit)}</span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function StandingsView({ data }) {
  return (
    <Panel title="Lig Puan Durumu">
      <StandingTable currentTeamId={data.team?.teamId} rows={data.standings?.table || []} />
    </Panel>
  );
}

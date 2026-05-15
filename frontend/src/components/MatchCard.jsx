import { Activity, Eye, Trophy } from "lucide-react";
import { formatDate } from "../utils/format";

export default function MatchCard({ busy, match, onDetail, onSimulate }) {
  const played = match.status === "played";
  const homeName = match.homeTeam?.shortName || match.homeTeam?.name || "Ev";
  const awayName = match.awayTeam?.shortName || match.awayTeam?.name || "Dep";

  return (
    <article className={played ? "fixture-card fixture-card--played" : "fixture-card"}>
      <div className="fixture-card__meta">
        <span>Hafta {match.week}</span>
        <span>{formatDate(match.date)}</span>
      </div>
      <strong>{homeName} vs {awayName}</strong>
      <div className="fixture-score">
        {played ? (
          <>
            <Trophy size={16} />
            <b>
              {match.homeGoals} - {match.awayGoals}
            </b>
            <span>Oynandı</span>
          </>
        ) : (
          <span>Bekliyor</span>
        )}
      </div>
      <div className="fixture-card__actions">
        <button className="ghost-action" onClick={() => onDetail(match)} type="button">
          <Eye size={16} /> Detay
        </button>
        <button className="primary-action primary-action--compact" disabled={busy || played} onClick={() => onSimulate(match)} type="button">
          <Activity size={16} />
          {played ? "Oynandı" : "Simüle Et"}
        </button>
      </div>
    </article>
  );
}

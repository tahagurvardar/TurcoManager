import { formatCompact } from "../utils/format";

export default function PlayerTable({ players = [], compact = false }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Oyuncu</th>
            <th>Poz.</th>
            <th>Yaş</th>
            <th>OVR</th>
            <th>POT</th>
            <th>Form</th>
            <th>Kond.</th>
            {!compact && <th>Değer</th>}
            <th>Maç</th>
            <th>Gol</th>
            <th>Asist</th>
            <th>SK</th>
            <th>KK</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const stats = player.stats || {};
            const injured = player.injury?.isInjured || player.injuryStatus === "injured";
            const averageRating = stats.avgRating || stats.averageRating || 6.8;

            return (
              <tr className={injured ? "player-row--injured" : ""} key={player._id || player.id}>
                <td>
                  <strong>{player.name}</strong>
                  {injured && <span className="status-pill status-pill--danger">Sakat</span>}
                </td>
                <td>{player.position}</td>
                <td>{player.age}</td>
                <td>{Math.round(player.overall || 0)}</td>
                <td>{Math.round(player.potential || player.overall || 0)}</td>
                <td>{Math.round(player.form || 0)}</td>
                <td>{Math.round(player.fitness || 0)}</td>
                {!compact && <td>{formatCompact(player.value || 0)}</td>}
                <td>{stats.appearances || 0}</td>
                <td>{stats.goals || 0}</td>
                <td>{stats.assists || 0}</td>
                <td>{stats.yellowCards || 0}</td>
                <td>{stats.redCards || 0}</td>
                <td>{averageRating.toFixed?.(2) || averageRating}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

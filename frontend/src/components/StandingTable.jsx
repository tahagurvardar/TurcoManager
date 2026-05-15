function statusClass(position, total) {
  if (position === 1) return "standing-row--ucl";
  if (position === 2) return "standing-row--ucl-qual";
  if (position === 3) return "standing-row--uel";
  if (position === 4) return "standing-row--uecl";
  if (position > total - 3) return "standing-row--drop";
  return "";
}

export default function StandingTable({ rows = [], currentTeamId }) {
  const total = rows.length;

  return (
    <div className="table-wrap standings-table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Takım</th>
            <th>O</th>
            <th>G</th>
            <th>B</th>
            <th>M</th>
            <th>A</th>
            <th>Y</th>
            <th>Av</th>
            <th>P</th>
            <th>Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const position = index + 1;
            const rowClass = [
              String(row.teamId) === String(currentTeamId) ? "row-highlight" : "",
              "standing-row",
              statusClass(position, total),
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <tr className={rowClass} key={row.teamId}>
                <td>{position}</td>
                <td>
                  <strong>{row.name}</strong>
                </td>
                <td>{row.played}</td>
                <td>{row.wins}</td>
                <td>{row.draws}</td>
                <td>{row.losses}</td>
                <td>{row.goalsFor}</td>
                <td>{row.goalsAgainst}</td>
                <td>{row.goalDiff}</td>
                <td>
                  <strong>{row.points}</strong>
                </td>
                <td>
                  <div className="form-guide">
                    {(row.formGuide || []).map((item, itemIndex) => (
                      <span className={`form-guide__item form-guide__item--${item.toLowerCase()}`} key={`${item}-${itemIndex}`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

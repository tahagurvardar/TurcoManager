const Match = require("../models/Match");
const Player = require("../models/Player");
const Team = require("../models/Team");
const { DEFAULT_LEAGUE } = require("./accessService");

function toRegex(query) {
  return new RegExp(String(query || "").trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

async function globalSearch({ query, league = DEFAULT_LEAGUE } = {}) {
  const text = String(query || "").trim();
  if (text.length < 2) {
    return { query: text, teams: [], players: [], matches: [] };
  }

  const regex = toRegex(text);
  const [teams, players, matches] = await Promise.all([
    Team.find({ league, name: regex }).select("name shortName league").limit(8),
    Player.find({ league, name: regex })
      .populate("team", "name shortName")
      .select("name position age overall team stats injury injuryStatus injuryType")
      .sort({ overall: -1 })
      .limit(8),
    Match.find({ league })
      .populate("homeTeam", "name shortName")
      .populate("awayTeam", "name shortName")
      .sort({ week: 1 })
      .limit(400),
  ]);

  const filteredMatches = matches
    .filter((match) => {
      const home = match.homeTeam?.name || "";
      const away = match.awayTeam?.name || "";
      return regex.test(home) || regex.test(away) || regex.test(`Hafta ${match.week}`);
    })
    .slice(0, 8);

  return {
    query: text,
    teams,
    players,
    matches: filteredMatches,
  };
}

module.exports = {
  globalSearch,
};

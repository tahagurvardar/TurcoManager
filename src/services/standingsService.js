const Match = require("../models/Match");
const Team = require("../models/Team");

async function calculateStandings(league) {
  const teams = await Team.find({ league }).sort({ name: 1 });
  const matches = await Match.find({ league, status: "played" })
    .populate("homeTeam", "name shortName")
    .populate("awayTeam", "name shortName");

  const table = new Map();

  for (const team of teams) {
    table.set(String(team._id), {
      teamId: team._id,
      name: team.name,
      shortName: team.shortName || "",
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
      formGuide: [],
    });
  }

  for (const match of matches) {
    if (!match.homeTeam || !match.awayTeam) continue;

    const home = table.get(String(match.homeTeam._id));
    const away = table.get(String(match.awayTeam._id));
    if (!home || !away) continue;

    const homeGoals = match.homeGoals ?? 0;
    const awayGoals = match.awayGoals ?? 0;

    home.played += 1;
    away.played += 1;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      home.wins += 1;
      away.losses += 1;
      home.points += 3;
      home.formGuide.push("W");
      away.formGuide.push("L");
    } else if (homeGoals < awayGoals) {
      away.wins += 1;
      home.losses += 1;
      away.points += 3;
      away.formGuide.push("W");
      home.formGuide.push("L");
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
      home.formGuide.push("D");
      away.formGuide.push("D");
    }
  }

  const standings = Array.from(table.values()).map((row) => ({
    ...row,
    goalDiff: row.goalsFor - row.goalsAgainst,
    formGuide: row.formGuide.slice(-5),
  }));

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name, "tr");
  });

  return {
    league,
    teamCount: teams.length,
    matchCount: matches.length,
    standings,
  };
}

module.exports = {
  calculateStandings,
};

const Team = require("../models/Team");
const Player = require("../models/Player");
const Match = require("../models/Match");
const { clampPercent, round, weightedAverage } = require("../utils/numbers");
const { DEFAULT_LEAGUE, resolveManagerTeam } = require("./accessService");

function mapTeamStatus(team, players = []) {
  const averageOverall = round(weightedAverage(players, (player) => player.overall || 70, 0), 1);
  const injuredCount = players.filter((player) => player.injury?.isInjured || player.injuryStatus === "injured").length;
  const youngProspects = players.filter((player) => player.age <= 21 && (player.potential || 0) >= 78).length;
  const weeklyWage = players.reduce((sum, player) => sum + (player.wage || 0), 0);

  return {
    teamId: team._id,
    name: team.name,
    shortName: team.shortName || "",
    league: team.league,
    morale: clampPercent(team.morale),
    form: clampPercent(team.form),
    chemistry: clampPercent(team.chemistry),
    fatigue: team.fatigue ?? 0,
    reputation: team.reputation ?? 70,
    averageOverall,
    squadSize: players.length,
    injuredCount,
    youngProspects,
    budget: team.budget ?? 0,
    tactics: team.tactics,
    finance: {
      ...team.finance?.toObject?.(),
      weeklyWage,
    },
    facilities: team.facilities,
    seasonObjectives: team.seasonObjectives,
  };
}

async function listTeams({ league } = {}) {
  const filter = {};
  if (league) filter.league = league;
  return Team.find(filter).sort({ name: 1 });
}

async function getManagerStatus(user, league = DEFAULT_LEAGUE) {
  const team = await resolveManagerTeam(user, league);
  const players = await Player.find({ team: team._id }).sort({ overall: -1 });
  return mapTeamStatus(team, players);
}

async function listAdminStatuses(league = DEFAULT_LEAGUE) {
  const teams = await Team.find({ league }).sort({ name: 1 });
  const players = await Player.find({ league }).select("team overall age potential wage injury");
  const playersByTeam = new Map();

  for (const player of players) {
    const key = String(player.team);
    if (!playersByTeam.has(key)) playersByTeam.set(key, []);
    playersByTeam.get(key).push(player);
  }

  return teams.map((team) => mapTeamStatus(team, playersByTeam.get(String(team._id)) || []));
}

async function getTeamContext(teamId) {
  const [team, players, matches] = await Promise.all([
    Team.findById(teamId),
    Player.find({ team: teamId }).sort({ overall: -1 }),
    Match.find({ $or: [{ homeTeam: teamId }, { awayTeam: teamId }] })
      .populate("homeTeam", "name shortName")
      .populate("awayTeam", "name shortName")
      .sort({ week: 1 }),
  ]);

  return { team, players, matches };
}

module.exports = {
  mapTeamStatus,
  listTeams,
  getManagerStatus,
  listAdminStatuses,
  getTeamContext,
};

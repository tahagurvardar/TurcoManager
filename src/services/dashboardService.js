const Match = require("../models/Match");
const Player = require("../models/Player");
const Team = require("../models/Team");
const { DEFAULT_LEAGUE, resolveManagerTeam } = require("./accessService");
const { getTeamFinances } = require("./financeService");
const { calculateStandings } = require("./standingsService");
const { mapTeamStatus } = require("./teamService");
const { listMarket } = require("./transferService");
const { clampPercent, round } = require("../utils/numbers");

function normalizeMatch(match, teamId) {
  if (!match) return null;
  const isHome = String(match.homeTeam?._id) === String(teamId);
  const opponent = isHome ? match.awayTeam : match.homeTeam;

  return {
    id: match._id,
    week: match.week,
    date: match.date,
    status: match.status,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
    opponent,
    venue: isHome ? "home" : "away",
  };
}

async function getManagerDashboard(user, league = DEFAULT_LEAGUE) {
  const team = await resolveManagerTeam(user, league);

  const [players, matches, standingsResult, finances, market] = await Promise.all([
    Player.find({ team: team._id }).sort({ overall: -1 }),
    Match.find({ league, $or: [{ homeTeam: team._id }, { awayTeam: team._id }] })
      .populate("homeTeam", "name shortName")
      .populate("awayTeam", "name shortName")
      .sort({ week: 1 }),
    calculateStandings(league),
    getTeamFinances(user, league),
    listMarket(user, { league }),
  ]);

  const nextMatch = matches.find((match) => match.status === "pending");
  const lastMatches = matches.filter((match) => match.status === "played").slice(-5).reverse();
  const tablePosition =
    standingsResult.standings.findIndex((row) => String(row.teamId) === String(team._id)) + 1 || null;
  const injuredPlayers = players.filter((player) => player.injury?.isInjured || player.injuryStatus === "injured");
  const academyPlayers = players.filter((player) => player.youth?.isYouth).sort((a, b) => b.potential - a.potential);
  const prospects = players.filter((player) => player.age <= 21 || player.youth?.isYouth).sort((a, b) => b.potential - a.potential);
  const topPerformers = players
    .slice()
    .sort((a, b) => (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0))
    .slice(0, 5);

  return {
    league,
    user: {
      username: user.username,
      role: user.role,
    },
    team: mapTeamStatus(team, players),
    standings: {
      position: tablePosition,
      topFive: standingsResult.standings.slice(0, 5),
      table: standingsResult.standings,
    },
    fixtures: {
      nextMatch: normalizeMatch(nextMatch, team._id),
      lastMatches: lastMatches.map((match) => normalizeMatch(match, team._id)),
    },
    squad: {
      players,
      injuredPlayers,
      prospects: prospects.slice(0, 8),
      topPerformers,
      averageAge: round(players.reduce((sum, player) => sum + player.age, 0) / Math.max(players.length, 1), 1),
    },
    finances,
    academy: {
      limit: 11,
      remainingSlots: Math.max(0, 11 - academyPlayers.length),
      prospects: academyPlayers,
    },
    marketShortlist: market.slice(0, 8),
    matchPlan: {
      recommendedTraining: team.fatigue > 70 ? "recovery" : team.chemistry < 80 ? "tactical" : "balanced",
      tacticalWarning:
        team.fatigue > 80
          ? "Yorgunluk yüksek. Rotasyon ve toparlanma antrenmanı önerilir."
          : team.chemistry < 75
            ? "Takım kimyası düşük. Taktik antrenmanı öncelikli olmalı."
            : "Takım maç planına hazır görünüyor.",
    },
  };
}

async function getAdminDashboard(league = DEFAULT_LEAGUE) {
  const [teams, players, matches, standings] = await Promise.all([
    Team.find({ league }).sort({ name: 1 }),
    Player.find({ league }).populate("team", "name shortName"),
    Match.find({ league }).populate("homeTeam", "name shortName").populate("awayTeam", "name shortName").sort({ week: 1 }),
    calculateStandings(league),
  ]);

  const pendingMatches = matches.filter((match) => match.status === "pending");
  const playedMatches = matches.filter((match) => match.status === "played");
  const injuredPlayers = players.filter((player) => player.injury?.isInjured || player.injuryStatus === "injured");
  const totalBalance = teams.reduce((sum, team) => sum + (team.finance?.balance || 0), 0);

  return {
    league,
    totals: {
      teams: teams.length,
      players: players.length,
      pendingMatches: pendingMatches.length,
      playedMatches: playedMatches.length,
      injuredPlayers: injuredPlayers.length,
      totalBalance,
    },
    teams: teams.map((team) => ({
      id: team._id,
      name: team.name,
      morale: clampPercent(team.morale),
      form: clampPercent(team.form),
      chemistry: clampPercent(team.chemistry),
      fatigue: team.fatigue,
      balance: team.finance?.balance || 0,
      transferBudget: team.finance?.transferBudget || 0,
    })),
    standings: standings.standings,
    matches,
    weeks: [...new Set(matches.map((match) => match.week))].sort((a, b) => a - b),
    recentMatches: playedMatches.slice(-8).reverse(),
    nextMatches: pendingMatches.slice(0, 8),
    injuries: injuredPlayers,
  };
}

module.exports = {
  getManagerDashboard,
  getAdminDashboard,
};

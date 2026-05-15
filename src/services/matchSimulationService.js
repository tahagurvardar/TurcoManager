const Match = require("../models/Match");
const Player = require("../models/Player");
const { badRequest, notFound } = require("../utils/httpError");
const { clamp, clampPercent, round, weightedAverage } = require("../utils/numbers");

const POSITION_GOAL_WEIGHT = {
  KL: 0.02,
  DEF: 0.12,
  OS: 0.32,
  FVT: 0.54,
};

const EVENT_TEXT = {
  kickoff: "Maç başladı. İki takım da ilk dakikalarda tempoyu yokluyor.",
  halftime: "İlk yarı sona erdi. Teknik ekipler soyunma odasında planı tazeliyor.",
  fulltime: "Hakemin son düdüğü geldi. Maç merkezi tüm verileri güncelledi.",
};

const EVENT_TYPES = ["shot", "corner", "yellow_card", "offside"];

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

function randomGoal(expectedGoals) {
  const noisy = expectedGoals + (Math.random() - 0.5) * 1.25;
  return Math.round(clamp(noisy, 0, 5));
}

function getTacticalScore(team) {
  const tactics = team.tactics || {};
  const base =
    (Number(tactics.pressing ?? 60) +
      Number(tactics.tempo ?? 60) +
      Number(tactics.defensiveLine ?? 55) +
      Number(tactics.width ?? 58) +
      Number(tactics.creativity ?? 62)) /
    5;

  const mentalityBonus = tactics.mentality === "attacking" ? 2 : tactics.mentality === "defensive" ? -1 : 0;
  return clamp(base + mentalityBonus, 35, 90);
}

function calcTeamPower(team, players) {
  const healthyPlayers = players.filter((player) => !player.injury?.isInjured);
  const squad = healthyPlayers.length ? healthyPlayers : players;
  const avgOverall = weightedAverage(squad, (player) => player.overall || 72, 72);
  const avgFitness = weightedAverage(squad, (player) => player.fitness ?? 100, 92);
  const dynamics =
    (clampPercent(team.morale) + clampPercent(team.form) + clampPercent(team.chemistry) - (team.fatigue ?? 0) / 2) / 3;
  const tactics = getTacticalScore(team);

  return avgOverall * 0.58 + dynamics * 0.24 + avgFitness * 0.1 + tactics * 0.08;
}

function pickGoalPlayers(players, goals) {
  const candidates = players.filter((player) => !player.injury?.isInjured);
  if (!candidates.length || goals <= 0) return [];

  const weighted = candidates.flatMap((player) => {
    const weight = Math.max(1, Math.round((POSITION_GOAL_WEIGHT[player.position] || 0.2) * 10));
    return Array.from({ length: weight }, () => player);
  });

  return Array.from({ length: goals }, () => pickRandom(weighted));
}

function buildEvents({ match, homeGoals, awayGoals, homeScorers, awayScorers, injuryEvents }) {
  const goalMinutes = Array.from({ length: homeGoals + awayGoals }, () => 8 + Math.floor(Math.random() * 82)).sort(
    (a, b) => a - b
  );

  const events = [
    { minute: 1, type: "kickoff", text: EVENT_TEXT.kickoff },
    { minute: 45, type: "halftime", text: EVENT_TEXT.halftime },
  ];

  let goalIndex = 0;
  for (const player of homeScorers) {
    const minute = goalMinutes[goalIndex] || 60;
    goalIndex += 1;
    events.push({
      minute,
      type: "goal",
      team: match.homeTeam._id,
      player: player._id,
      text: `${minute}. dakika: ${match.homeTeam.name} golü buldu. ${player.name} bitirici vuruşu yaptı.`,
    });
  }

  for (const player of awayScorers) {
    const minute = goalMinutes[goalIndex] || 68;
    goalIndex += 1;
    events.push({
      minute,
      type: "goal",
      team: match.awayTeam._id,
      player: player._id,
      text: `${minute}. dakika: ${match.awayTeam.name} cevap verdi. ${player.name} skoru değiştirdi.`,
    });
  }

  const chanceTeam = Math.random() > 0.5 ? match.homeTeam : match.awayTeam;
  events.push({
    minute: 18 + Math.floor(Math.random() * 55),
    type: "chance",
    team: chanceTeam._id,
    text: `${chanceTeam.name} hızlı hücumda ceza sahasına indi, savunma son anda kapattı.`,
  });

  events.push(...injuryEvents);
  events.push({ minute: 90, type: "fulltime", text: EVENT_TEXT.fulltime });

  return events.sort((a, b) => a.minute - b.minute);
}

function buildMatchEvents({ match, homeGoals, awayGoals, homeScorers, awayScorers, injuryEvents }) {
  const goalMinutes = Array.from({ length: homeGoals + awayGoals }, () => 8 + Math.floor(Math.random() * 82)).sort(
    (a, b) => a - b
  );
  const goalEntries = [
    ...homeScorers.map((player) => ({ team: match.homeTeam, player })),
    ...awayScorers.map((player) => ({ team: match.awayTeam, player })),
  ].map((entry, index) => ({
    ...entry,
    minute: goalMinutes[index] || 55 + index,
  }));

  const events = [];
  let homeScore = 0;
  let awayScore = 0;

  for (const entry of goalEntries.sort((a, b) => a.minute - b.minute)) {
    if (String(entry.team._id) === String(match.homeTeam._id)) homeScore += 1;
    else awayScore += 1;

    events.push({
      minute: entry.minute,
      type: "goal",
      team: entry.team._id,
      text: `⚽ ${entry.team.name} adına müthiş bir gol! Skor ${match.homeTeam.name} ${homeScore} - ${awayScore} ${match.awayTeam.name} oldu. (dk. ${entry.minute})`,
    });
  }

  const eventCount = 7 + Math.floor(Math.random() * 5);
  for (let index = 0; index < eventCount; index += 1) {
    const type = pickRandom(EVENT_TYPES);
    const team = Math.random() > 0.5 ? match.homeTeam : match.awayTeam;
    const minute = 3 + Math.floor(Math.random() * 86);
    const templates = {
      shot: `🎯 ${team.name} ceza sahası dışından denedi, kaleci kontrol etti. (dk. ${minute})`,
      corner: `🚩 ${team.name} korner kullandı, savunma topu uzaklaştırdı. (dk. ${minute})`,
      yellow_card: `🟨 ${team.name} oyuncusu sert müdahale sonrası sarı kart gördü. (dk. ${minute})`,
      offside: `🚫 ${team.name} atağı ofsayt bayrağıyla durdu. (dk. ${minute})`,
    };

    events.push({
      minute,
      type,
      team: team._id,
      text: templates[type],
    });
  }

  if (Math.random() > 0.88) {
    const team = Math.random() > 0.5 ? match.homeTeam : match.awayTeam;
    const minute = 55 + Math.floor(Math.random() * 30);
    events.push({
      minute,
      type: "red_card",
      team: team._id,
      text: `🟥 ${team.name} için kırmızı kart! Takım kalan dakikalarda eksik oynayacak. (dk. ${minute})`,
    });
  }

  for (const injury of injuryEvents) {
    events.push({
      minute: injury.minute,
      type: "injury",
      team: injury.team,
      text: `${injury.text} (dk. ${injury.minute})`,
    });
  }

  return events.sort((a, b) => a.minute - b.minute);
}

function buildLiveEventsFromMatchEvents(matchEvents) {
  const mappedEvents = matchEvents.map((event) => ({
    minute: event.minute,
    type:
      event.type === "goal"
        ? "goal"
        : event.type === "injury"
          ? "injury"
          : event.type === "yellow_card" || event.type === "red_card"
            ? "card"
            : "chance",
    team: event.team,
    text: event.text,
  }));

  return [
    { minute: 1, type: "kickoff", text: EVENT_TEXT.kickoff },
    ...mappedEvents,
    { minute: 45, type: "halftime", text: EVENT_TEXT.halftime },
    { minute: 90, type: "fulltime", text: EVENT_TEXT.fulltime },
  ].sort((a, b) => a.minute - b.minute);
}

function applyDisciplineToRatings(ratings, events, teamId) {
  const teamRatings = ratings.filter((rating) => String(rating.team) === String(teamId));
  if (!teamRatings.length) return;

  for (const event of events) {
    if (String(event.team) !== String(teamId)) continue;
    if (event.type !== "yellow_card" && event.type !== "red_card") continue;

    const rating = pickRandom(teamRatings);
    if (event.type === "yellow_card") rating.yellowCards = (rating.yellowCards || 0) + 1;
    if (event.type === "red_card") rating.redCards = (rating.redCards || 0) + 1;
  }
}

function buildRatings(players, teamId, goalsFor, goalsAgainst, scorers, isWinner) {
  const scorerCounts = new Map();
  for (const scorer of scorers) {
    scorerCounts.set(String(scorer._id), (scorerCounts.get(String(scorer._id)) || 0) + 1);
  }

  return players.slice(0, 11).map((player) => {
    const goals = scorerCounts.get(String(player._id)) || 0;
    const base = 6.5 + (isWinner ? 0.45 : goalsFor === goalsAgainst ? 0.1 : -0.2);
    const goalBonus = goals * 0.7;
    const defenseBonus = player.position === "KL" || player.position === "DEF" ? Math.max(0, 0.3 - goalsAgainst * 0.08) : 0;
    const fitnessPenalty = (100 - (player.fitness ?? 100)) / 120;
    const rating = clamp(base + goalBonus + defenseBonus - fitnessPenalty + Math.random() * 0.55, 4.8, 10);

    return {
      player: player._id,
      team: teamId,
      rating: round(rating, 1),
      goals,
      assists: goals > 0 && Math.random() > 0.65 ? 1 : 0,
      yellowCards: 0,
      redCards: 0,
    };
  });
}

async function applyPlayerStats(ratings) {
  const players = await Player.find({ _id: { $in: ratings.map((rating) => rating.player) } });
  const ratingByPlayer = new Map(ratings.map((rating) => [String(rating.player), rating]));

  for (const player of players) {
    const rating = ratingByPlayer.get(String(player._id));
    if (!rating) continue;

    const appearances = (player.stats?.appearances || 0) + 1;
    const currentAverage = player.stats?.avgRating || player.stats?.averageRating || 6.8;
    player.stats.appearances = appearances;
    player.stats.goals = (player.stats?.goals || 0) + (rating.goals || 0);
    player.stats.assists = (player.stats?.assists || 0) + (rating.assists || 0);
    player.stats.yellowCards = (player.stats?.yellowCards || 0) + (rating.yellowCards || 0);
    player.stats.redCards = (player.stats?.redCards || 0) + (rating.redCards || 0);
    player.stats.lastRating = rating.rating;
    player.stats.avgRating = round((currentAverage * (appearances - 1) + rating.rating) / appearances, 2);
    player.stats.averageRating = player.stats.avgRating;
    player.form = clampPercent((player.form ?? 50) + (rating.rating >= 7 ? 1.2 : -0.4));
    player.fitness = clamp((player.fitness || 100) - 6, 0, 100);
    player.xp = (player.xp || 0) + 6;
    await player.save();
  }
}

async function applyMatchEffects(homeTeam, awayTeam, homeGoals, awayGoals) {
  const homeWin = homeGoals > awayGoals;
  const awayWin = awayGoals > homeGoals;

  const update = (team, won, lost) => {
    team.fatigue = clamp((team.fatigue ?? 0) + 6, 0, 150);
    team.morale = clampPercent((team.morale ?? 50) + (won ? 3 : lost ? -3 : 1));
    team.form = clampPercent((team.form ?? 50) + (won ? 2 : lost ? -2 : 0.5));
    team.chemistry = clampPercent((team.chemistry ?? 50) + (won ? 1 : lost ? -0.5 : 0.3));
  };

  update(homeTeam, homeWin, awayWin);
  update(awayTeam, awayWin, homeWin);

  await Promise.all([homeTeam.save(), awayTeam.save()]);
}

async function applyInjuryRisk(team, players, week) {
  const risk = ((team.fatigue || 0) / 150) * 0.12 + (100 - (team.facilities?.medical || 60)) / 1000;
  if (Math.random() > risk || !players.length) return null;

  const healthyPlayers = players.filter((item) => !item.injury?.isInjured && item.injuryStatus !== "injured");
  const player = pickRandom(healthyPlayers.length ? healthyPlayers : players);
  if (!player) return null;

  const severity = team.facilities?.medical >= 75 ? "minor" : Math.random() > 0.75 ? "major" : "medium";
  const days = severity === "minor" ? 7 : severity === "medium" ? 21 : 45;
  const missedWeeks = severity === "minor" ? 1 : severity === "medium" ? 3 : 6;
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + days);
  const injuryType = severity === "minor" ? "Kas zorlanması" : severity === "medium" ? "Diz zorlanması" : "Bağ sakatlığı";

  player.injury = {
    isInjured: true,
    type: injuryType,
    severity,
    returnDate,
  };
  player.injuryStatus = "injured";
  player.injuryType = injuryType;
  player.injuryUntilWeek = Number(week || 0) + missedWeeks;
  await player.save();

  return {
    minute: 20 + Math.floor(Math.random() * 65),
    type: "injury",
    team: team._id,
    player: player._id,
    text: `${player.name} sakatlık nedeniyle oyuna devam edemiyor. Sağlık ekibi sahada.`,
  };
}

async function hydrateMatch(matchId) {
  return Match.findById(matchId)
    .populate("homeTeam", "name shortName league morale form chemistry fatigue tactics finance")
    .populate("awayTeam", "name shortName league morale form chemistry fatigue tactics finance")
    .populate("liveEvents.team", "name shortName")
    .populate("liveEvents.player", "name position")
    .populate("events.team", "name shortName")
    .populate("playerRatings.player", "name position overall")
    .populate("playerRatings.team", "name shortName");
}

async function simulateMatchDoc(match) {
  if (!match) throw notFound("Maç bulunamadı.");
  if (match.status === "played") {
    return hydrateMatch(match._id);
  }

  const [homePlayers, awayPlayers] = await Promise.all([
    Player.find({ team: match.homeTeam._id }).sort({ overall: -1 }),
    Player.find({ team: match.awayTeam._id }).sort({ overall: -1 }),
  ]);

  const homePower = calcTeamPower(match.homeTeam, homePlayers) * 1.08;
  const awayPower = calcTeamPower(match.awayTeam, awayPlayers);
  const totalPower = homePower + awayPower || 1;

  const expectedHomeGoals = (homePower / totalPower) * 3.1;
  const expectedAwayGoals = (awayPower / totalPower) * 3.1;
  const homeGoals = randomGoal(expectedHomeGoals);
  const awayGoals = randomGoal(expectedAwayGoals);
  const homeScorers = pickGoalPlayers(homePlayers, homeGoals);
  const awayScorers = pickGoalPlayers(awayPlayers, awayGoals);
  const injuryEvents = (
    await Promise.all([
      applyInjuryRisk(match.homeTeam, homePlayers, match.week),
      applyInjuryRisk(match.awayTeam, awayPlayers, match.week),
    ])
  ).filter(Boolean);

  const homeWin = homeGoals > awayGoals;
  const awayWin = awayGoals > homeGoals;
  const homeRatings = buildRatings(homePlayers, match.homeTeam._id, homeGoals, awayGoals, homeScorers, homeWin);
  const awayRatings = buildRatings(awayPlayers, match.awayTeam._id, awayGoals, homeGoals, awayScorers, awayWin);
  const events = buildMatchEvents({ match, homeGoals, awayGoals, homeScorers, awayScorers, injuryEvents });
  applyDisciplineToRatings(homeRatings, events, match.homeTeam._id);
  applyDisciplineToRatings(awayRatings, events, match.awayTeam._id);

  match.homeGoals = homeGoals;
  match.awayGoals = awayGoals;
  match.possession = {
    home: Math.round(clamp(50 + (homePower - awayPower) / 2 + (Math.random() * 8 - 4), 35, 65)),
    away: 0,
  };
  match.possession.away = 100 - match.possession.home;
  match.shots = {
    home: Math.max(1, Math.round(expectedHomeGoals * 4 + Math.random() * 5)),
    away: Math.max(1, Math.round(expectedAwayGoals * 4 + Math.random() * 5)),
  };
  match.xg = {
    home: round(expectedHomeGoals + Math.random() * 0.5, 2),
    away: round(expectedAwayGoals + Math.random() * 0.5, 2),
  };
  match.events = events;
  match.liveEvents = buildLiveEventsFromMatchEvents(events);
  match.playerRatings = [...homeRatings, ...awayRatings];
  match.status = "played";

  await match.save();
  await Promise.all([applyPlayerStats(match.playerRatings), applyMatchEffects(match.homeTeam, match.awayTeam, homeGoals, awayGoals)]);

  return hydrateMatch(match._id);
}

async function listMatches({ league, week } = {}) {
  const filter = {};
  if (league) filter.league = league;
  if (week) filter.week = Number(week);

  return Match.find(filter)
    .populate("homeTeam", "name shortName league")
    .populate("awayTeam", "name shortName league")
    .sort({ week: 1, date: 1 });
}

async function simulateMatchById(matchId) {
  const match = await Match.findById(matchId).populate("homeTeam").populate("awayTeam");
  return simulateMatchDoc(match);
}

async function simulateWeek({ week, league }) {
  if (!Number(week)) throw badRequest("Geçerli bir week değeri belirtmelisiniz.");

  const filter = { week: Number(week), status: "pending" };
  if (league) filter.league = league;

  const matches = await Match.find(filter).populate("homeTeam").populate("awayTeam");
  if (!matches.length) {
    throw notFound("Bu hafta için simüle edilecek pending maç bulunamadı.");
  }

  const simulated = [];
  for (const match of matches) {
    simulated.push(await simulateMatchDoc(match));
  }

  return {
    message: `Hafta ${week} için ${simulated.length} maç simüle edildi.`,
    matches: simulated.map((match) => ({
      id: match._id,
      league: match.league,
      week: match.week,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeGoals: match.homeGoals,
      awayGoals: match.awayGoals,
      status: match.status,
      events: match.events,
    })),
  };
}

async function getMatchCenter(matchId) {
  const match = await hydrateMatch(matchId);
  if (!match) throw notFound("Maç bulunamadı.");
  return match;
}

module.exports = {
  calcTeamPower,
  listMatches,
  simulateMatchById,
  simulateWeek,
  getMatchCenter,
};

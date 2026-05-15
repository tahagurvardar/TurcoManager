const Player = require("../models/Player");
const { badRequest } = require("../utils/httpError");
const { DEFAULT_LEAGUE, resolveManagerTeam } = require("./accessService");
const { estimatePlayerValue } = require("./transferService");

const FIRST_NAMES = ["Arda", "Efe", "Mert", "Kerem", "Deniz", "Emir", "Yusuf", "Baran"];
const LAST_NAMES = ["Yılmaz", "Demir", "Kaya", "Aydın", "Çelik", "Şahin", "Koç", "Arslan"];
const POSITIONS = ["KL", "DEF", "OS", "FVT"];

const pick = (items) => items[Math.floor(Math.random() * items.length)];

async function listAcademy(user, league = DEFAULT_LEAGUE) {
  const team = await resolveManagerTeam(user, league);
  const players = await Player.find({ team: team._id, "youth.isYouth": true }).sort({ potential: -1 });

  return {
    teamId: team._id,
    academyLevel: team.facilities?.youth || 58,
    limit: 11,
    remainingSlots: Math.max(0, 11 - players.length),
    prospects: players,
  };
}

async function promoteYouth(user, body = {}, league = DEFAULT_LEAGUE) {
  const team = await resolveManagerTeam(user, league);
  const academyCount = await Player.countDocuments({ team: team._id, "youth.isYouth": true });
  if (academyCount >= 11) throw badRequest("Akademi oyuncu limiti dolu. En fazla 11 akademi oyuncusu olabilir.");

  const youthLevel = team.facilities?.youth || 58;
  const position = POSITIONS.includes(body.position) ? body.position : pick(POSITIONS);
  const age = Number(body.age) || 17 + Math.floor(Math.random() * 3);
  const potential = Math.min(92, 70 + Math.round(youthLevel / 5) + Math.floor(Math.random() * 8));
  const overall = Math.max(52, potential - (16 + Math.floor(Math.random() * 10)));
  const name = body.name || `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

  const player = await Player.create({
    name,
    position,
    age,
    overall,
    potential,
    team: team._id,
    league,
    wage: 2500 + Math.round(overall * 90),
    youth: {
      isYouth: true,
      academyLevel: youthLevel,
      promotedAt: new Date(),
    },
    development: {
      focus: "youth",
      growthRate: 1.25,
    },
  });

  player.value = estimatePlayerValue(player);
  await player.save();

  return {
    message: `${player.name} akademiden A takıma yükseltildi.`,
    player,
  };
}

module.exports = {
  listAcademy,
  promoteYouth,
};

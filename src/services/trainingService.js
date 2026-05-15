const Player = require("../models/Player");
const { badRequest, notFound } = require("../utils/httpError");
const { clamp, clampPercent, round } = require("../utils/numbers");
const { DEFAULT_LEAGUE, resolveManagerTeam } = require("./accessService");

const TRAINING_PROFILES = {
  balanced: { overall: 0.18, fitness: -2, form: 1, morale: 0.5, xp: 10, injuryRisk: 0.02 },
  fitness: { overall: 0.08, fitness: 4, form: 0.5, morale: 0, xp: 8, injuryRisk: 0.015 },
  technical: { overall: 0.24, fitness: -3, form: 1.2, morale: 0.4, xp: 12, injuryRisk: 0.025 },
  tactical: { overall: 0.14, fitness: -1, form: 0.8, morale: 1, xp: 10, injuryRisk: 0.012 },
  recovery: { overall: 0.02, fitness: 8, form: 0.3, morale: 1.5, xp: 4, injuryRisk: 0.004 },
  youth: { overall: 0.3, fitness: -2, form: 1, morale: 1, xp: 14, injuryRisk: 0.02 },
};

function intensityMultiplier(intensity = "normal") {
  if (intensity === "light") return 0.65;
  if (intensity === "hard") return 1.35;
  return 1;
}

function applyTrainingToPlayer(player, profile, multiplier, facilities) {
  const youthBonus = player.age <= 21 || player.youth?.isYouth ? 1.25 : 1;
  const facilityBonus = 1 + ((facilities?.training || 65) - 65) / 200;
  const growthCap = Math.max(player.overall || 70, player.potential || 78);
  const gain = profile.overall * multiplier * youthBonus * facilityBonus * (player.development?.growthRate || 1);

  player.overall = round(clamp((player.overall || 70) + gain, 1, Math.min(99, growthCap)), 1);
  player.xp = (player.xp || 0) + Math.round(profile.xp * multiplier);
  player.form = clampPercent((player.form ?? 50) + profile.form * multiplier);
  player.morale = clampPercent((player.morale ?? 50) + profile.morale * multiplier);
  player.fitness = clamp((player.fitness || 100) + profile.fitness * multiplier, 0, 100);
  player.development = {
    ...(player.development?.toObject?.() || player.development || {}),
    focus: profile === TRAINING_PROFILES.youth ? "youth" : player.development?.focus || "overall",
    lastTrainedAt: new Date(),
  };

  return player;
}

async function runTeamTraining(user, body = {}, league = DEFAULT_LEAGUE) {
  const team = await resolveManagerTeam(user, league);
  const focus = body.focus || "balanced";
  const intensity = body.intensity || "normal";
  const profile = TRAINING_PROFILES[focus];
  if (!profile) throw badRequest("Geçersiz antrenman odağı.");

  const players = await Player.find({ team: team._id });
  if (!players.length) throw notFound("Bu takıma ait oyuncu bulunamadı.");

  const multiplier = intensityMultiplier(intensity);
  const updatedPlayers = [];
  const injuries = [];

  for (const player of players) {
    applyTrainingToPlayer(player, profile, multiplier, team.facilities);

    const fatigueRisk = (100 - (player.fitness || 100)) / 1000;
    if (!player.injury?.isInjured && Math.random() < profile.injuryRisk * multiplier + fatigueRisk) {
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + (intensity === "hard" ? 14 : 7));
      player.injury = {
        isInjured: true,
        type: "Antrenman zorlanması",
        severity: intensity === "hard" ? "medium" : "minor",
        returnDate,
      };
      player.injuryStatus = "injured";
      player.injuryType = player.injury.type;
      player.injuryUntilWeek = null;
      injuries.push({ playerId: player._id, name: player.name, returnDate });
    }

    await player.save();
    updatedPlayers.push(player);
  }

  team.fatigue = clamp((team.fatigue || 0) + (intensity === "hard" ? 4 : intensity === "light" ? -2 : 1), 0, 150);
  team.chemistry = clampPercent((team.chemistry ?? 50) + (focus === "tactical" ? 2 : 0.5));
  team.morale = clampPercent((team.morale ?? 50) + (focus === "recovery" ? 2 : 0.5));
  await team.save();

  return {
    message: `${team.name} için ${focus} antrenmanı tamamlandı.`,
    focus,
    intensity,
    playerCount: updatedPlayers.length,
    improvedPlayers: updatedPlayers
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 8)
      .map((player) => ({
        id: player._id,
        name: player.name,
        position: player.position,
        overall: player.overall,
        fitness: player.fitness,
        form: player.form,
        xp: player.xp,
      })),
    injuries,
    teamDynamics: {
      morale: team.morale,
      chemistry: team.chemistry,
      fatigue: team.fatigue,
    },
  };
}

async function trainSinglePlayer(user, playerId, body = {}, league = DEFAULT_LEAGUE) {
  const team = await resolveManagerTeam(user, league);
  const player = await Player.findOne({ _id: playerId, team: team._id });
  if (!player) throw notFound("Oyuncu bulunamadı veya bu takıma ait değil.");

  const focus = body.focus || "technical";
  const profile = TRAINING_PROFILES[focus] || TRAINING_PROFILES.technical;
  applyTrainingToPlayer(player, profile, intensityMultiplier(body.intensity), team.facilities);
  await player.save();

  return {
    message: `${player.name} için bireysel antrenman tamamlandı.`,
    player,
  };
}

module.exports = {
  TRAINING_PROFILES,
  runTeamTraining,
  trainSinglePlayer,
};

const { badRequest } = require("../utils/httpError");
const { clamp, clampPercent } = require("../utils/numbers");
const { DEFAULT_LEAGUE, resolveManagerTeam } = require("./accessService");

const ALLOWED_FORMATIONS = ["4-3-3", "4-2-3-1", "4-4-2", "3-5-2", "3-4-3", "4-1-4-1", "5-3-2"];
const ALLOWED_MENTALITIES = ["defensive", "balanced", "attacking"];
const ALLOWED_FOCUS = ["center", "left", "right", "mixed"];

function sanitizeTactics(input = {}) {
  const tactics = {};

  if (input.formation) {
    if (!ALLOWED_FORMATIONS.includes(input.formation)) throw badRequest("Geçersiz diziliş.");
    tactics.formation = input.formation;
  }
  if (input.mentality) {
    if (!ALLOWED_MENTALITIES.includes(input.mentality)) throw badRequest("Geçersiz mentalite.");
    tactics.mentality = input.mentality;
  }
  if (input.focusPlay) {
    if (!ALLOWED_FOCUS.includes(input.focusPlay)) throw badRequest("Geçersiz oyun yönü.");
    tactics.focusPlay = input.focusPlay;
  }

  for (const key of ["pressing", "tempo", "defensiveLine", "width", "creativity"]) {
    if (input[key] !== undefined) tactics[key] = clamp(input[key], 0, 100);
  }

  if (Array.isArray(input.playerPositions)) {
    tactics.playerPositions = input.playerPositions.slice(0, 11).map((slot, index) => ({
      slot: String(slot.slot || `P${index + 1}`),
      position: ["KL", "DEF", "OS", "FVT"].includes(slot.position) ? slot.position : "OS",
      x: clamp(slot.x, 0, 100),
      y: clamp(slot.y, 0, 100),
    }));
  }

  return tactics;
}

async function getMyTactics(user, league = DEFAULT_LEAGUE) {
  const team = await resolveManagerTeam(user, league);
  return {
    teamId: team._id,
    teamName: team.name,
    tactics: team.tactics,
    chemistry: team.chemistry,
    fatigue: team.fatigue,
  };
}

async function updateMyTactics(user, body = {}, league = DEFAULT_LEAGUE) {
  const team = await resolveManagerTeam(user, league);
  const updates = sanitizeTactics(body);

  team.tactics = {
    ...(team.tactics?.toObject?.() || team.tactics || {}),
    ...updates,
  };
  team.chemistry = clampPercent((team.chemistry ?? 50) + 0.5);
  await team.save();

  return {
    message: "Taktik planı güncellendi.",
    tactics: team.tactics,
    chemistry: team.chemistry,
  };
}

module.exports = {
  ALLOWED_FORMATIONS,
  getMyTactics,
  updateMyTactics,
};

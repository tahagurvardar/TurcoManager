const Team = require("../models/Team");
const { badRequest, forbidden, notFound } = require("../utils/httpError");

const DEFAULT_LEAGUE = "Süper Lig";

async function resolveManagerTeam(user, league = DEFAULT_LEAGUE) {
  if (!user) throw forbidden("Oturum bulunamadı.");
  if (user.role !== "manager") throw forbidden("Bu işlem teknik direktör hesabı gerektirir.");

  if (user.teamId) {
    const team = await Team.findOne({ _id: user.teamId, league });
    if (team) return team;
  }

  if (!user.teamName) {
    throw badRequest("Bu teknik direktör hesabına takım atanmamış.");
  }

  const team = await Team.findOne({ name: user.teamName, league });
  if (!team) throw notFound("Teknik direktör takım kaydı bulunamadı.");

  return team;
}

function assertAdmin(user) {
  if (!user || user.role !== "admin") throw forbidden("Admin yetkisi gerekli.");
}

module.exports = {
  DEFAULT_LEAGUE,
  resolveManagerTeam,
  assertAdmin,
};

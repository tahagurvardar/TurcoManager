const Player = require("../models/Player");
const { notFound } = require("../utils/httpError");

async function getPlayers(req, res) {
  const filter = {};
  if (req.query.teamId) filter.team = req.query.teamId;
  if (req.query.league) filter.league = req.query.league;
  if (req.query.position) filter.position = req.query.position;
  if (req.query.injured === "true") {
    filter.$or = [{ "injury.isInjured": true }, { injuryStatus: "injured" }];
  }

  const players = await Player.find(filter).populate("team", "name shortName league").sort({ overall: -1 });
  res.json(players);
}

async function getPlayerDetail(req, res) {
  const player = await Player.findById(req.params.id).populate("team", "name shortName league");
  if (!player) throw notFound("Oyuncu bulunamadı.");
  res.json(player);
}

module.exports = {
  getPlayers,
  getPlayerDetail,
};

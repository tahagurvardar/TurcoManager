const {
  getMatchCenter,
  listMatches,
  simulateMatchById,
  simulateWeek,
} = require("../services/matchSimulationService");

async function getMatches(req, res) {
  const matches = await listMatches({ league: req.query.league, week: req.query.week });
  res.json(matches);
}

async function simulateWeekController(req, res) {
  const result = await simulateWeek({ week: req.query.week, league: req.query.league });
  res.json(result);
}

async function simulateMatchController(req, res) {
  const match = await simulateMatchById(req.params.id);
  res.json({ message: "Maç simüle edildi.", match });
}

async function getMatchCenterController(req, res) {
  const match = await getMatchCenter(req.params.id);
  res.json(match);
}

module.exports = {
  getMatches,
  simulateWeekController,
  simulateMatchController,
  getMatchCenterController,
};

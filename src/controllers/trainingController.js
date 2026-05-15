const { DEFAULT_LEAGUE } = require("../services/accessService");
const { runTeamTraining, trainSinglePlayer } = require("../services/trainingService");

async function trainTeam(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const result = await runTeamTraining(req.user, req.body, league);
  res.json(result);
}

async function trainPlayer(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const result = await trainSinglePlayer(req.user, req.params.id, req.body, league);
  res.json(result);
}

module.exports = {
  trainTeam,
  trainPlayer,
};

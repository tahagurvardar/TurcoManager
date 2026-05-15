const { DEFAULT_LEAGUE } = require("../services/accessService");
const { getMyTactics, updateMyTactics } = require("../services/tacticsService");

async function show(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const result = await getMyTactics(req.user, league);
  res.json(result);
}

async function update(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const result = await updateMyTactics(req.user, req.body, league);
  res.json(result);
}

module.exports = {
  show,
  update,
};

const { DEFAULT_LEAGUE } = require("../services/accessService");
const { listAcademy, promoteYouth } = require("../services/academyService");

async function index(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const result = await listAcademy(req.user, league);
  res.json(result);
}

async function promote(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const result = await promoteYouth(req.user, req.body, league);
  res.status(201).json(result);
}

module.exports = {
  index,
  promote,
};

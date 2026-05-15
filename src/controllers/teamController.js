const { DEFAULT_LEAGUE } = require("../services/accessService");
const { getManagerStatus, listAdminStatuses, listTeams } = require("../services/teamService");

async function getTeams(req, res) {
  const teams = await listTeams({ league: req.query.league });
  res.json(teams);
}

async function getMyTeamStatus(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const status = await getManagerStatus(req.user, league);
  res.json(status);
}

async function getAdminTeamStatus(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const teams = await listAdminStatuses(league);
  res.json(teams);
}

module.exports = {
  getTeams,
  getMyTeamStatus,
  getAdminTeamStatus,
};

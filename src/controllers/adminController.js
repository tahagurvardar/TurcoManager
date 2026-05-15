const { DEFAULT_LEAGUE } = require("../services/accessService");
const { getAdminDashboard } = require("../services/dashboardService");
const { listAdminStatuses } = require("../services/teamService");

async function teamStats(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const teams = await listAdminStatuses(league);
  res.json({ league, teamCount: teams.length, teams });
}

async function overview(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const dashboard = await getAdminDashboard(league);
  res.json(dashboard);
}

module.exports = {
  teamStats,
  overview,
};

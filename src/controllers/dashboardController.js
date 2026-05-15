const { DEFAULT_LEAGUE } = require("../services/accessService");
const { getAdminDashboard, getManagerDashboard } = require("../services/dashboardService");

async function managerDashboard(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const dashboard = await getManagerDashboard(req.user, league);
  res.json(dashboard);
}

async function adminDashboard(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const dashboard = await getAdminDashboard(league);
  res.json(dashboard);
}

module.exports = {
  managerDashboard,
  adminDashboard,
};

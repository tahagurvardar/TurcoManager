const { DEFAULT_LEAGUE } = require("../services/accessService");
const { getTeamFinances, signSponsor } = require("../services/financeService");

async function myFinances(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const finances = await getTeamFinances(req.user, league);
  res.json(finances);
}

async function signSponsorship(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const result = await signSponsor(req.user, req.params.tier, league);
  res.json(result);
}

module.exports = {
  myFinances,
  signSponsorship,
};

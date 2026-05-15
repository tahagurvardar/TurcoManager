const { DEFAULT_LEAGUE } = require("../services/accessService");
const { listMarket, listPlayer, submitBid } = require("../services/transferService");

async function market(req, res) {
  const players = await listMarket(req.user, req.query);
  res.json({ players });
}

async function bid(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const result = await submitBid(req.user, req.body, league);
  res.json(result);
}

async function listForTransfer(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const result = await listPlayer(req.user, req.params.id, req.body, league);
  res.json(result);
}

module.exports = {
  market,
  bid,
  listForTransfer,
};

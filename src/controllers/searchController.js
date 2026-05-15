const { DEFAULT_LEAGUE } = require("../services/accessService");
const { globalSearch } = require("../services/searchService");

async function search(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const result = await globalSearch({ query: req.query.q, league });
  res.json(result);
}

module.exports = {
  search,
};

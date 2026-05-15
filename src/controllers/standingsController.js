const { calculateStandings } = require("../services/standingsService");
const { badRequest } = require("../utils/httpError");

async function getStandings(req, res) {
  const league = req.query.league;
  if (!league) throw badRequest("Lütfen ?league=Süper%20Lig gibi bir league parametresi gönderin.");

  const result = await calculateStandings(league);
  res.json(result);
}

module.exports = {
  getStandings,
};

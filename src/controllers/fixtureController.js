const { DEFAULT_LEAGUE } = require("../services/accessService");
const { generateFixturesForLeague } = require("../services/fixtureService");

async function generateFixtures(req, res) {
  const league = req.query.league || DEFAULT_LEAGUE;
  const doubleRound = req.query.double !== "false";
  const result = await generateFixturesForLeague(league, { doubleRound, reset: true });

  res.json({
    message: `${league} için fikstür oluşturuldu.`,
    ...result,
  });
}

module.exports = {
  generateFixtures,
};

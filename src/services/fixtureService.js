const Match = require("../models/Match");
const Team = require("../models/Team");
const { generateDoubleRound, generateSingleRound } = require("../utils/fixtures");
const { badRequest } = require("../utils/httpError");

async function createFixtures(teams, league, { doubleRound = true, reset = true } = {}) {
  if (teams.length < 2) {
    throw badRequest(`${league} için en az 2 takım olmalı. Şu an takım sayısı: ${teams.length}`);
  }

  if (reset) {
    await Match.deleteMany({ league });
  }

  const fixtures = doubleRound ? generateDoubleRound(teams) : generateSingleRound(teams);
  const baseDate = new Date();
  const matchesToInsert = fixtures.map((fixture) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + (fixture.week - 1) * 7);

    return {
      league,
      week: fixture.week,
      date,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      homeGoals: 0,
      awayGoals: 0,
      status: "pending",
    };
  });

  const inserted = await Match.insertMany(matchesToInsert);

  return {
    league,
    teamCount: teams.length,
    totalMatches: inserted.length,
    weeks: inserted.reduce((max, match) => Math.max(max, match.week), 0),
  };
}

async function generateFixturesForLeague(league, options = {}) {
  const teams = await Team.find({ league }).sort({ name: 1 });
  return createFixtures(teams, league, options);
}

module.exports = {
  createFixtures,
  generateFixturesForLeague,
};

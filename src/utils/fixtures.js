function generateSingleRound(teams) {
  const teamIds = teams.map((team) => team._id.toString());

  if (teamIds.length % 2 === 1) {
    teamIds.push(null);
  }

  const size = teamIds.length;
  const rounds = size - 1;
  const half = size / 2;
  let rotation = [...teamIds];
  const fixtures = [];

  for (let round = 0; round < rounds; round += 1) {
    for (let index = 0; index < half; index += 1) {
      const first = rotation[index];
      const second = rotation[size - 1 - index];
      if (!first || !second) continue;

      const homeTeam = round % 2 === 0 ? first : second;
      const awayTeam = round % 2 === 0 ? second : first;
      fixtures.push({ week: round + 1, homeTeam, awayTeam });
    }

    const fixed = rotation[0];
    const rest = rotation.slice(1);
    rest.unshift(rest.pop());
    rotation = [fixed, ...rest];
  }

  return fixtures;
}

function generateDoubleRound(teams) {
  const firstRound = generateSingleRound(teams);
  const maxWeek = firstRound.reduce((max, fixture) => Math.max(max, fixture.week), 0);
  const secondRound = firstRound.map((fixture) => ({
    week: fixture.week + maxWeek,
    homeTeam: fixture.awayTeam,
    awayTeam: fixture.homeTeam,
  }));

  return [...firstRound, ...secondRound];
}

module.exports = {
  generateSingleRound,
  generateDoubleRound,
};

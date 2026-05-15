const Player = require("../models/Player");
const { badRequest } = require("../utils/httpError");
const { round } = require("../utils/numbers");
const { DEFAULT_LEAGUE, resolveManagerTeam } = require("./accessService");

const SPONSOR_TIERS = {
  local: { name: "Turco Yerel Partnerliği", value: 850000, durationWeeks: 12, reputationRequired: 0 },
  regional: { name: "Anadolu Bölgesel Sponsorluğu", value: 2600000, durationWeeks: 18, reputationRequired: 65 },
  global: { name: "Global Futbol Ortaklığı", value: 7200000, durationWeeks: 26, reputationRequired: 82 },
};

const SPONSOR_META = {
  local: {
    risk: "Düşük",
    condition: "Lig katılımı ve görünürlük taahhüdü",
    impact: "Nakit akışını dengeler, taraftar algısını hafif artırır.",
  },
  regional: {
    risk: "Orta",
    condition: "İlk 10 hedefi ve düzenli medya görünürlüğü",
    impact: "Transfer bütçesine anlamlı katkı sağlar.",
  },
  global: {
    risk: "Yüksek",
    condition: "Avrupa hedefi ve yüksek sportif beklenti",
    impact: "Büyük gelir sağlar, yönetim beklentisini yükseltir.",
  },
};

async function getTeamFinances(user, league = DEFAULT_LEAGUE) {
  const team = await resolveManagerTeam(user, league);
  const players = await Player.find({ team: team._id }).select("wage value");
  const weeklyWage = players.reduce((sum, player) => sum + (player.wage || 0), 0);
  const squadValue = players.reduce((sum, player) => sum + (player.value || 0), 0);
  const ticketIncome =
    (team.stadium?.capacity || 25000) * (team.stadium?.attendanceRate || 0.7) * 12 * (team.reputation || 70);
  const weeklyCosts = weeklyWage + (team.finance?.facilityCost || 0) + (team.finance?.youthInvestment || 0);
  const weeklyIncome = (team.finance?.sponsorIncome || 0) / 12 + ticketIncome / 17;

  team.finance.weeklyWage = weeklyWage;
  team.finance.ticketIncome = Math.round(ticketIncome);
  await team.save();

  const signedTiers = new Set((team.sponsorships || []).map((item) => item.tier));
  const projectedMonthlyProfit = Math.round((weeklyIncome - weeklyCosts) * 4);

  return {
    teamId: team._id,
    teamName: team.name,
    balance: team.finance?.balance || 0,
    transferBudget: team.finance?.transferBudget || 0,
    wageBudget: team.finance?.wageBudget || 0,
    weeklyWage,
    weeklyIncome: Math.round(weeklyIncome),
    weeklyCosts: Math.round(weeklyCosts),
    projectedMonthlyProfit,
    monthlyProjection: projectedMonthlyProfit,
    squadValue,
    sponsorships: team.sponsorships || [],
    availableSponsors: Object.entries(SPONSOR_TIERS).map(([tier, sponsor]) => ({
      tier,
      ...sponsor,
      ...(SPONSOR_META[tier] || {}),
      signed: signedTiers.has(tier),
      available: (team.reputation || 70) >= sponsor.reputationRequired && !signedTiers.has(tier),
    })),
  };
}

async function signSponsor(user, tier = "local", league = DEFAULT_LEAGUE) {
  const team = await resolveManagerTeam(user, league);
  const sponsor = SPONSOR_TIERS[tier];
  if (!sponsor) throw badRequest("Geçersiz sponsorluk seviyesi.");
  if ((team.reputation || 70) < sponsor.reputationRequired) {
    throw badRequest("Kulüp itibarı bu sponsor için yeterli değil.");
  }

  const alreadySigned = (team.sponsorships || []).some((item) => item.tier === tier);
  if (alreadySigned) throw badRequest("Bu sponsorluk seviyesi zaten imzalanmış.");

  team.sponsorships.push({
    name: sponsor.name,
    tier,
    value: sponsor.value,
    durationWeeks: sponsor.durationWeeks,
    signedAt: new Date(),
  });
  team.finance.sponsorIncome = (team.finance?.sponsorIncome || 0) + sponsor.value;
  team.finance.balance = (team.finance?.balance || 0) + sponsor.value;
  team.finance.transferBudget = (team.finance?.transferBudget || 0) + Math.round(sponsor.value * 0.6);
  team.budget = (team.budget || 0) + sponsor.value;
  await team.save();

  return {
    message: `${sponsor.name} imzalandı.`,
    balance: round(team.finance.balance, 0),
    sponsorships: team.sponsorships,
  };
}

module.exports = {
  SPONSOR_TIERS,
  getTeamFinances,
  signSponsor,
};

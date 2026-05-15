const Player = require("../models/Player");
const Team = require("../models/Team");
const { badRequest, forbidden, notFound } = require("../utils/httpError");
const { round } = require("../utils/numbers");
const { DEFAULT_LEAGUE, resolveManagerTeam } = require("./accessService");

function estimatePlayerValue(player) {
  const ageFactor = player.age <= 21 ? 1.45 : player.age <= 25 ? 1.25 : player.age <= 30 ? 1 : 0.68;
  const potentialFactor = Math.max(player.potential || player.overall || 70, player.overall || 70) / 75;
  const positionFactor = player.position === "FVT" ? 1.22 : player.position === "OS" ? 1.08 : 1;
  const base = Math.max(250000, (player.overall || 70) ** 3 * 120);
  return Math.round(base * ageFactor * potentialFactor * positionFactor);
}

async function listMarket(user, query = {}) {
  const league = query.league || DEFAULT_LEAGUE;
  const managerTeam = user?.role === "manager" ? await resolveManagerTeam(user, league) : null;
  const filter = { league };

  if (query.position) filter.position = query.position;
  if (query.q) filter.name = { $regex: query.q, $options: "i" };
  if (managerTeam) filter.team = { $ne: managerTeam._id };

  const players = await Player.find(filter).populate("team", "name shortName").sort({ overall: -1 }).limit(80);
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : null;

  return players
    .map((player) => {
      const value = player.transfer?.askingPrice || player.value || estimatePlayerValue(player);
      return {
        id: player._id,
        name: player.name,
        position: player.position,
        age: player.age,
        overall: player.overall,
        potential: player.potential || player.overall,
        value,
        wage: player.wage || 0,
        listed: player.transfer?.listed || false,
        interestLevel: player.transfer?.interestLevel ?? 35,
        team: player.team,
        injury: player.injury,
      };
    })
    .filter((player) => !maxPrice || player.value <= maxPrice);
}

async function submitBid(user, body = {}, league = DEFAULT_LEAGUE) {
  const buyer = await resolveManagerTeam(user, league);
  const offer = Number(body.offer);
  if (!body.playerId || !offer || offer <= 0) throw badRequest("playerId ve geçerli offer zorunlu.");

  const player = await Player.findById(body.playerId).populate("team");
  if (!player) throw notFound("Oyuncu bulunamadı.");
  if (String(player.team._id) === String(buyer._id)) throw forbidden("Kendi oyuncuna teklif veremezsin.");

  const askingPrice = player.transfer?.askingPrice || player.value || estimatePlayerValue(player);
  const minAcceptable = askingPrice * (player.transfer?.listed ? 0.9 : 1.08);
  const transferBudget = buyer.finance?.transferBudget ?? buyer.budget ?? 0;
  if (offer > transferBudget) throw badRequest("Transfer bütçesi bu teklif için yetersiz.");
  if (offer < minAcceptable) {
    player.transfer.lastOffer = offer;
    await player.save();
    return {
      accepted: false,
      message: "Teklif reddedildi. Kulüp daha yüksek bir bedel bekliyor.",
      askingPrice,
      minimumExpected: Math.round(minAcceptable),
    };
  }

  const seller = await Team.findById(player.team._id);
  buyer.finance.transferBudget = Math.max(0, transferBudget - offer);
  buyer.finance.balance = (buyer.finance?.balance || 0) - offer;
  buyer.budget = (buyer.budget || 0) - offer;

  if (seller) {
    seller.finance.transferBudget = (seller.finance?.transferBudget || 0) + Math.round(offer * 0.75);
    seller.finance.balance = (seller.finance?.balance || 0) + offer;
    seller.budget = (seller.budget || 0) + offer;
    await seller.save();
  }

  player.team = buyer._id;
  player.transfer = {
    ...(player.transfer?.toObject?.() || player.transfer || {}),
    listed: false,
    askingPrice: 0,
    interestLevel: 20,
    lastOffer: offer,
  };

  await Promise.all([buyer.save(), player.save()]);

  return {
    accepted: true,
    message: `${player.name} transferi tamamlandı.`,
    transferFee: offer,
    remainingTransferBudget: round(buyer.finance.transferBudget, 0),
    player,
  };
}

async function listPlayer(user, playerId, body = {}, league = DEFAULT_LEAGUE) {
  const team = await resolveManagerTeam(user, league);
  const player = await Player.findOne({ _id: playerId, team: team._id });
  if (!player) throw notFound("Oyuncu bulunamadı veya takımına ait değil.");

  const askingPrice = Number(body.askingPrice) || estimatePlayerValue(player);
  player.transfer.listed = true;
  player.transfer.askingPrice = askingPrice;
  player.value = player.value || estimatePlayerValue(player);
  await player.save();

  return {
    message: `${player.name} transfer listesine eklendi.`,
    player,
  };
}

module.exports = {
  estimatePlayerValue,
  listMarket,
  submitBid,
  listPlayer,
};

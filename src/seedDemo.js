require("dotenv").config();
const { spawnSync } = require("child_process");
const mongoose = require("mongoose");
const Match = require("./models/Match");
const Player = require("./models/Player");
const Team = require("./models/Team");
const { requireEnv } = require("./config/env");

const LEAGUE = process.env.DEMO_LEAGUE || "Süper Lig";

function wantsReset() {
  return process.argv.includes("--reset") || process.env.DEMO_SEED_RESET === "true";
}

async function run() {
  const uri = requireEnv("MONGO_URI");
  await mongoose.connect(uri);

  const [teams, players, matches] = await Promise.all([
    Team.countDocuments({ league: LEAGUE }),
    Player.countDocuments({ league: LEAGUE }),
    Match.countDocuments({ league: LEAGUE }),
  ]);

  if ((teams || players || matches) && !wantsReset()) {
    console.log(`Demo seed atlandı: ${LEAGUE} zaten veri içeriyor.`);
    console.log(`Takım: ${teams}, Oyuncu: ${players}, Maç: ${matches}`);
    console.log("Sıfırlamak istersen: npm run seed:demo -- --reset");
    await mongoose.disconnect();
    return;
  }

  await mongoose.disconnect();

  const result = spawnSync(process.execPath, ["src/seedAll.js"], {
    env: process.env,
    stdio: "inherit",
  });

  process.exit(result.status || 0);
}

run().catch(async (err) => {
  console.error("Demo seed hata:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

// src/seedFixtures.js
require("dotenv").config();
const mongoose = require("mongoose");
const Team = require("./models/Team");
const createFixtures = require("./utils/createFixtures"); 
// ← senin mevcut fixture mantığını buraya taşıyabiliriz

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const league = "Süper Lig";
  const teams = await Team.find({ league });

  if (teams.length < 2) {
    console.log("❌ Yeterli takım yok");
    process.exit(1);
  }

  await createFixtures(teams, league);

  console.log("📅 Fikstür başarıyla oluşturuldu");
  process.exit(0);
}

run().catch(console.error);

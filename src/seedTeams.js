// src/seedTeams.js
require("dotenv").config();
const mongoose = require("mongoose");
const Team = require("./models/Team");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB bağlantısı OK (teams)");

    const league = "Süper Lig";
    const country = "Türkiye";

    // Süper Lig seti (DB'de bu isimlerle dursun diye sade tuttum)
    const teams = [
      "Galatasaray",
      "Fenerbahçe",
      "Beşiktaş",
      "Trabzonspor",
      "Göztepe",
      "Samsunspor",
      "Gaziantep",
      "Kocaelispor",
      "Başakşehir",
      "Alanyaspor",
      "Konyaspor",
      "Çaykur Rizespor",
      "Antalyaspor",
      "Kasımpaşa",
      "Eyüpspor",
      "Kayserispor",
      "Karagümrük",
      "Gençlerbirliği",
    ].map((name) => ({ name, league, country }));

    // Upsert: varsa güncelle, yoksa ekle
    for (const t of teams) {
      await Team.updateOne(
        { name: t.name, league: t.league },
        { $set: t },
        { upsert: true }
      );
    }

    const count = await Team.countDocuments({ league });
    console.log(`✅ Takımlar upsert edildi. (${league}) Toplam: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ seedTeams hata:", err);
    process.exit(1);
  }
}

run();

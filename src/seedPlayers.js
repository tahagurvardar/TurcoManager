// src/seedPlayers.js
require("dotenv").config();
const mongoose = require("mongoose");

const Team = require("./models/Team");
const Player = require("./models/Player");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB bağlantısı OK (players)");

    const league = "Süper Lig";

    // Galatasaray takımını bul
    const gs = await Team.findOne({ name: "Galatasaray", league });
    if (!gs) {
      console.error("HATA: Galatasaray takımı veritabanında bulunamadı.");
      console.error("Önce seedTeams veya takım ekleme işini kontrol et.");
      process.exit(1);
    }

    // İstersen sadece Galatasaray oyuncularını sil:
    await Player.deleteMany({ team: gs._id });
    // (İstersen komple ligdeki tüm oyuncuları silmek için:
    // await Player.deleteMany({ league });
    // )

    const players = [
      // 🧤 Kaleciler
      { name: "Uğurcan Çakır", position: "KL", age: 29, overall: 84 },
      { name: "Günay Güvenç", position: "KL", age: 34, overall: 75 },
      { name: "Batuhan Ahmet Şen", position: "KL", age: 26, overall: 73 },

      // 🛡️ Defans
      { name: "Davinson Sánchez", position: "DEF", age: 29, overall: 82 },
      { name: "Abdülkerim Bardakcı", position: "DEF", age: 31, overall: 80 },
      { name: "Kaan Ayhan", position: "DEF", age: 31, overall: 78 },
      { name: "Ismail Jakobs", position: "DEF", age: 26, overall: 79 },
      { name: "Wilfried Stephane Singo", position: "DEF", age: 24, overall: 80 },
      { name: "Eren Elmalı", position: "DEF", age: 25, overall: 77 },
      { name: "Kazımcan Karataş", position: "DEF", age: 22, overall: 74 },
      { name: "Metehan Baltacı", position: "DEF", age: 23, overall: 72 },
      { name: "Arda Ünyay", position: "DEF", age: 18, overall: 68 },

      // ⚽ Orta saha
      { name: "Lucas Torreira", position: "OS", age: 29, overall: 84 },
      { name: "İlkay Gündoğan", position: "OS", age: 35, overall: 86 },
      { name: "Mario Rene Junior Lemina", position: "OS", age: 32, overall: 80 },
      { name: "Gabriel Davi Gomes Sara", position: "OS", age: 26, overall: 79 },
      { name: "Berkan Kutlu", position: "OS", age: 27, overall: 75 },

      // 🚀 Forvet
      { name: "Mauro Icardi", position: "FVT", age: 32, overall: 86 },
      { name: "Victor Osimhen", position: "FVT", age: 26, overall: 88 },
      { name: "Leroy Aziz Sané", position: "FVT", age: 29, overall: 86 },
      { name: "Roland Sallai", position: "FVT", age: 28, overall: 80 },
      { name: "Barış Alper Yılmaz", position: "FVT", age: 25, overall: 81 },
      { name: "Yunus Akgün", position: "FVT", age: 25, overall: 76 },
      { name: "Ahmed Kutucu", position: "FVT", age: 25, overall: 74 },
      { name: "Yusuf Demir", position: "FVT", age: 22, overall: 77 },
    ].map((p) => ({
      ...p,
      team: gs._id,
      league,
    }));

    const result = await Player.insertMany(players);
    console.log(`Galatasaray için toplam ${result.length} oyuncu eklendi.`);
    process.exit(0);
  } catch (err) {
    console.error("seedPlayers hata:", err);
    process.exit(1);
  }
}



run();

const mongoose = require("mongoose");
const { requireEnv } = require("./env");

const connectDB = async () => {
  const uri = requireEnv("MONGO_URI");
  const conn = await mongoose.connect(uri);
  console.log("MongoDB bağlantısı başarılı:", conn.connection.host);
  return conn;
};

module.exports = connectDB;

const mongoose = require("mongoose");

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true, useUnifiedTopology: true,
    connectTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 45000,  // 45 seconds 
  })
  .catch((e) => {
    console.error("Connection error", e.message);
  });

const db = mongoose.connection;

module.exports = db;

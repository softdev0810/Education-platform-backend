const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function dbConnect() {
  mongoose
    .connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
    })
    .then(() => {
      console.log("🆗 MongoDB is Connected..");
    })
    .catch((error) => {
      console.log("🚫 MongoDB is NOT connected..");
      console.error(error);
    });
}

module.exports = dbConnect;

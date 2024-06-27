const express = require("express");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");

const dbConnect = require("./config/db");
const routes = require("./routes/api");

const app = express();

dotenv.config();
dbConnect();

app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
app.use(morgan("dev"));

const PORT = process.env.PORT;
const HOST = process.env.HOST;

app.get("/", (req, res) => {
  res.status(200).json("⏳ Server is running!");
});

app.use("/api/v1", routes);

app.listen(PORT, HOST, () => {
  console.log(`⏳ Server is running on http://${HOST}:${PORT}`);
});

// const options = {
//   key: fs.readFileSync("key.pem"),
//   cert: fs.readFileSync("cert.pem"),
// };

// https.createServer(options, app).listen(PORT, HOST, () => {
//   console.log(`⏳ HTTPS Server is running on https://${HOST}:${PORT}`);
// });

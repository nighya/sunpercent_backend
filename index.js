const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const http = require("http");
// const path = require("path");
const bodyParser = require("body-parser");
// const bcrypt = require("bcrypt-nodejs");

// const https = require("https");
// const server = https.createServer(
//   {
//     key: fs.readFileSync("./cert/domain.com.key"),
//     cert: fs.readFileSync("./cert/domain.com.crt"),
//     ca: fs.readFileSync("./cert/rootca.crt"),
//     requestCert: false,
//     rejectUnauthorized: false,
//   },
//   app
// );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", express.static(__dirname + "/public"));
app.use(cors({ origin: "http://192.168.0.25:8888", credentials: true }));

app.use(express.static("public"));

const port = 4000;
app.listen(port, () => {
  process.send("ready");
  console.log("server listening on port", port, `http://192.168.0.12:${port}`);
});

//가져오기
app.use("/", require("./routes/data.js"));

//404 page
app.use(function(req, res, next) {
  res.status(404).redirect('/404');
});

// app.get("/", (req, res) => {
//   res.send("hi")
// })

let isDisableKeepAlive = false;
app.use(function (req, res, next) {
  if (isDisableKeepAlive) {
    res.set("Connection", "close");
  }
  next();
});

process.on("SIGINT", function () {
  isDisableKeepAlive = true;
  app.close(function () {
    console.log("server closed");
    process.exit(0);
  });
});
//입력하기

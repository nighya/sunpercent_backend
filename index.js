const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/test/", express.static(__dirname + "/public"));
app.use(cors({ origin: "http://localhost:8080", credentials: true }));

const port = 4000;
app.listen(port, () => {
  console.log("server listening on port", port);
});

//가져오기
app.use("/", require("./routes/data.js"));

//입력하기

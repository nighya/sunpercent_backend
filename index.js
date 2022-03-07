const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
// const path = require("path");
const bodyParser = require("body-parser");
// const bcrypt = require("bcrypt-nodejs");

const https = require("https");
const server = https.createServer(
  {
    key: fs.readFileSync("./cert/domain.com.key"),
    cert: fs.readFileSync("./cert/domain.com.crt"),
    ca: fs.readFileSync("./cert/rootca.crt"),
    requestCert: false,
    rejectUnauthorized: false,
  },
  app
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", express.static(__dirname + "/public"));
app.use(cors({ origin: "https://192.168.0.12:8080", credentials: true }));


const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.to(roomId).on('chat message', (msg) => {
      io.emit('chat message', msg);
    });


    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

const port = 4000;
server.listen(port, () => {
  console.log("server listening on port", port,`https://192.168.0.12:${port}`);
});

//가져오기
app.use("/", require("./routes/data.js"));

//입력하기

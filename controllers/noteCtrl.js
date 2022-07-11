const connection = require("../dbconfig");
const moment = require("moment");
let jwt = require("jsonwebtoken");

const noteCtrl = {
  SendNote: async (req, res) => {
    const to_uid = req.body.to_uid;
    const from_uid = req.body.from_uid;
    const to_nickname = req.body.to_nickname;
    const from_nickname = req.body.from_nickname;
    const title = req.body.title;
    const message = req.body.message;
    const from_gender = req.body.from_gender;
    const date = moment().format("YYYY-MM-DD hh:mm:ss A");
    const datas = [
      to_uid,
      from_uid,
      to_nickname,
      from_nickname,
      title,
      message,
      from_gender,
      date,
    ];
    const sql =
      "INSERT INTO note(to_uid, from_uid, to_nickname,from_nickname, title, message, from_gender,date) values(?,?,?,?,?,?,?,?)";
    const confirm_sql = "SELECT user_uid FROM members WHERE user_uid=?";

    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());
      if (from_uid === result.user_uid) {
        connection.query(confirm_sql, [to_uid], (err, data) => {
          if (data.length > 0) {
            try {
              connection.query(sql, datas, (err_1, row_1) => {
                if (err_1) {
                  console.log("note 에러  :   " + err_1);
                } else {
                  res.sendStatus(200);
                }
              });
            } catch (err_c) {
              console.log("note catch 에러  :   " + err_c);
            }
          } else {
            res.sendStatus(400)
          }
        });
      } else {
        res.status(403).json({
          message: "fobbiden",
        });
        // res.sendStatus(403)
      }
    }
  },
};

module.exports = noteCtrl;

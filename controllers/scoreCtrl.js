const connection = require("../dbconfig");
let jwt = require("jsonwebtoken");
require("dotenv").config();
const moment = require("moment");

const scoreCtrl = {
  getscore: (req, res, next) => {
    const content_uid = req.params.content_uid;
    const sql = "SELECT * FROM score WHERE content_uid=?";
    connection.query(sql, [content_uid], (err, row) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        console.log("score send");
        res.send(row);
      }
    });
  },
  scoreupload: (req, res, next) => {
    const content_uid = req.body.content_uid;
    const to_uid = req.body.to_uid;
    const from_uid = req.body.from_uid;
    const content_score = req.body.content_score;
    const date = moment().format("YYYY-MM-DD hh:mm:ss A");
    const gender = req.body.gender;
    const datas = [content_uid, to_uid, from_uid, content_score, date, gender];
    const confirm_sql =
      "SELECT * FROM score WHERE content_uid  LIKE ? AND from_uid LIKE ?";
    const sql =
      "INSERT INTO score(content_uid, to_uid, from_uid,content_score,date,gender) values(?,?,?,?,?,?)";
    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());
      // console.log("from_uid :  "+from_uid+"   result :  "+Object.values(result)+ "  token   :"+token)
      if (from_uid=== result.user_uid) {
        connection.query(confirm_sql, [content_uid, from_uid], (err, data) => {
          if (data.length > 0) {
            res.status(400).json({
              message: "이미 점수 등록한 유저",
            });
          } else if (err) {
            console.log(err);
          } else {
            connection.query(sql, datas, (err, rows) => {
              if (err) {
                console.error("err : " + err);
                res.send(err);
              } else {
                console.log("rows: " + JSON.stringify(rows));
                res.send(rows);
              }
            });
          }
        });
      } else {
        res.status(403).json({
          message: "fobbiden",
        });
      }
    }
  },
};

module.exports = scoreCtrl;

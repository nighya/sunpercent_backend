const connection = require("../dbconfig");
let jwt = require("jsonwebtoken");
require("dotenv").config();
const moment = require("moment");

const scoreCtrl = {
  getscore: async (req, res, next) => {
    const content_uid = req.params.content_uid;
    const current_user_uid = Object.keys(req.body)[0];
    const sql = "SELECT * FROM score WHERE content_uid=?";
    connection.query(sql, [content_uid], (err, row) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        // console.log("score send row :  " + row[0].to_uid);
        // console.log("score send content_uid :  " + content_uid);
        // console.log("score send current_user_uid :  " + current_user_uid);

        if (row[0].to_uid === current_user_uid) {
          console.log("점수보냄");
          res.send(row);
        } else {
          console.log("점수안보냄");
        }
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
    const point_sql =
      "UPDATE sunpercent.members SET point=point+1 WHERE user_uid=?";
    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());
      // console.log("from_uid :  "+from_uid+"   result :  "+Object.values(result)+ "  token   :"+token)
      if (from_uid === result.user_uid) {
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
                // console.error("err : " + err);
                res.send(err);
              } else {
                console.log("rows: " + JSON.stringify(rows));
                res.send(rows);
                connection.query(point_sql, from_uid, (err_1, row_1) => {
                  if (err_1) {
                    console.log("point 1점 추가 에러   : " + err_1);
                  } else {
                    console.log(
                      "point 1점 추가 성공   : " + JSON.stringify(row_1)
                    );
                  }
                });
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

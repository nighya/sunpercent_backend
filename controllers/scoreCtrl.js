const connection = require("../dbconfig");
let jwt = require("jsonwebtoken");
require("dotenv").config();
const moment = require("moment");

const scoreCtrl = {
  getscore: async (req, res, next) => {
    const content_uid = req.params.content_uid;
    const current_user_uid = Object.keys(req.body)[0];
    const sql = "SELECT * FROM score WHERE content_uid=?";
    const other_user_sql =
      "SELECT * FROM score WHERE content_uid  LIKE ? AND from_uid LIKE ?";
    connection.query(sql, [content_uid], (err_1, row_1) => {
      if (err_1) {
        console.log(err_1);
        res.send(err_1);
      } else if (row_1.length <= 0) {
        res.send(row_1);
      } else {
        // console.log("score send row :  " + row_1[0].to_uid);
        // console.log("score send content_uid :  " + content_uid);
        // console.log("score send current_user_uid :  " + current_user_uid);

        if (row_1[0].to_uid === current_user_uid) {
          try {
            const cookie = req.headers.cookie;
            const token = cookie.replace("HrefreshToken=", "");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded) {
              var base64Payload = token.split(".")[1];
              var payload = Buffer.from(base64Payload, "base64");
              var result = JSON.parse(payload.toString());
              if (current_user_uid === result.user_uid) {
                res.send(row_1);
              }
            }
          } catch (err) {
            console.log("getscore catch err" + err);
          }

          // console.log("점수보냄");
        } else {
          connection.query(
            other_user_sql,
            [content_uid, current_user_uid],
            (err_2, row_2) => {
              if (row_2.length > 0) {
                // console.log("점수안보냄 row    :" + JSON.stringify(row_2));
                // console.log(
                // "점수안보냄  row_2.길이 :    " + row_2.length
                // );
                res.send(row_2);
              } else if (row_2.length <= 0 || row_2 == null) {
                // console.log("점수안보냄   row_2 :  " + row_2);
                res.send(row_2);
              } else {
                // console.log(
                //   "점수안보냄 에러 :  " + err_2 + "     row_2 :  " + row_2
                // );
              }
            }
          );
        }
      }
    });
  },
  scoreupload: (req, res, next) => {
    const content_uid = req.body.content_uid;
    const to_uid = req.body.to_uid;
    const from_uid = req.body.from_uid;
    const content_score = req.body.content_score;
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const gender = req.body.gender;
    const datas = [content_uid, to_uid, from_uid, content_score, date, gender];
    const confirm_sql =
      "SELECT * FROM score WHERE content_uid  LIKE ? AND from_uid LIKE ?";
    const sql =
      "INSERT INTO score(content_uid, to_uid, from_uid,content_score,date,gender) values(?,?,?,?,?,?)";
    const point_sql =
      "UPDATE sunpercent.members SET point=point+1 WHERE user_uid=?";
    const point_history_sql =
      "INSERT INTO point_history(user_uid, point_value, date) values(?,?,?)";
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
            console.log("점수주기 에러   :   " + err);
          } else {
            connection.query(sql, datas, (err, rows) => {
              if (err) {
                // console.error("err : " + err);
                res.send(err);
              } else {
                // console.log("rows: " + JSON.stringify(rows));
                res.send(rows);
                connection.query(point_sql, from_uid, (err_1, row_1) => {
                  if (err_1) {
                    console.log("point 1점 추가 에러   : " + err_1);
                  } else {
                    const point_history_arr = [from_uid, "1", date];

                    // console.log(
                    //   "point_history obj user_uid :  " +
                    //   point_history_arr[0]
                    // );
                    // console.log(
                    //   "point_history obj point_value :  " +
                    //   point_history_arr[1]
                    // );
                    // console.log(
                    //   "point_history obj date :  " + point_history_arr[2]
                    // );
                    connection.query(
                      point_history_sql,
                      point_history_arr,
                      (err_2, row_2) => {
                        if (err_2) {
                          console.log("point_history 에러  :  " + err_2);
                        } else {
                          // console.log(
                          //   "point 1점 추가 성공   : " + JSON.stringify(row_1)
                          // );
                        }
                      }
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
  scoreupload_multi: (req, res, next) => {
    const content_uid = req.body.content_uid;
    const to_uid = req.body.to_uid;
    const from_uid = req.body.from_uid;
    const content_score_multi = req.body.content_score_multi;
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const gender = req.body.gender;
    const datas = [content_uid, to_uid, from_uid, content_score_multi, date, gender];
    const confirm_sql =
      "SELECT * FROM score_multi WHERE content_uid  LIKE ? AND from_uid LIKE ?";
    const sql_multi =
      "INSERT INTO score_multi(content_uid, to_uid, from_uid,content_score_multi,date,gender) values(?,?,?,?,?,?)";
    const point_sql =
      "UPDATE sunpercent.members SET point=point+1 WHERE user_uid=?";
    const point_history_sql =
      "INSERT INTO point_history(user_uid, point_value, date) values(?,?,?)";
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
            console.log("scoreupload_multi 에러1   :   " + err);
          } else {
            connection.query(sql_multi, datas, (err, rows) => {
              if (err) {
                // console.error("err : " + err);
                res.send(err);
              } else {
                // console.log("rows: " + JSON.stringify(rows));
                res.send(rows);
                connection.query(point_sql, from_uid, (err_1, row_1) => {
                  if (err_1) {
                    console.log("scoreupload_multi point 1점 추가 에러   : " + err_1);
                  } else {
                    const point_history_arr = [from_uid, "1", date];

                    // console.log(
                    //   "point_history obj user_uid :  " +
                    //   point_history_arr[0]
                    // );
                    // console.log(
                    //   "point_history obj point_value :  " +
                    //   point_history_arr[1]
                    // );
                    // console.log(
                    //   "point_history obj date :  " + point_history_arr[2]
                    // );
                    connection.query(
                      point_history_sql,
                      point_history_arr,
                      (err_2, row_2) => {
                        if (err_2) {
                          console.log("scoreupload_multi point_history 에러  :  " + err_2);
                        } else {
                          // console.log(
                          //   "point 1점 추가 성공   : " + JSON.stringify(row_1)
                          // );
                        }
                      }
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

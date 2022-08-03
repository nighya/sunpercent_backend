const connection = require("../dbconfig");
const uuid = require("uuid-sequential");
const fs = require("fs");
const moment = require("moment");
let jwt = require("jsonwebtoken");

const imageCtrl = {
  imageupload: (req, res, next) => {
    const uid = uuid();
    const arr_uid = uid.split("-");
    const content_uid = arr_uid[4];
    // const content_uid = req.body.content_uid;
    const user_uid = req.body.user_uid;
    const image_path = `/images/${req.file.filename}`; // image 경로 만들기
    // console.log("req.file.filename   : " + req.file.filename);
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const nickname = req.body.nickname;
    // const content_average_score = 0.0;
    // const score_count = 0;
    const gender = req.body.gender;
    const datas = [content_uid, user_uid, image_path, date, nickname, gender];
    const history_datas = [user_uid, "-2", date];

    const sql =
      "INSERT INTO images(content_uid, user_uid, image_path,date,nickname,gender) values(?,?,?,?,?,?)";
    const confirm_point_sql = "SELECT point FROM members WHERE user_uid=?";
    const point_sql =
      "UPDATE sunpercent.members SET point=point-2 WHERE user_uid=?";
    const point_history_sql =
      "INSERT INTO point_history(user_uid, point_value, date) values(?,?,?)";

    connection.query(confirm_point_sql, user_uid, (error_1, row_1) => {
      if (error_1) {
        res.send(error_1);
      } else if (JSON.stringify(row_1[0].point) < 2) {
        fs.unlinkSync(`./public${image_path}`);
        res.sendStatus(400);
        // console.log("row_1 :  " + JSON.stringify(row_1[0].point));
      } else if (!req.file.filename) {
        res.sendStatus(405);
      } else {
        connection.query(sql, datas, (error_2, row_2) => {
          // console.log(datas);
          if (error_2) {
            fs.unlinkSync(`./public${image_path}`);
            console.error("err : " + error_2);
            res.send(error_2);
          } else {
            connection.query(point_sql, user_uid, (error_3, row_3) => {
              if (error_3) {
                fs.unlinkSync(`./public${image_path}`);
                console.log("point 2점 사용 에러   : " + error_3);
              } else {
                connection.query(
                  point_history_sql,
                  history_datas,
                  (error_4, row_4) => {
                    if (error_4) {
                      fs.unlinkSync(`./public${image_path}`);
                      console.log(
                        "image upload point history 에러   " + error_4
                      );
                    } //else {
                    //   console.log(
                    //     "point 2점 사용 성공   : " + JSON.stringify(row_3)
                    //   );
                    // }
                  }
                );
              }
            });
            res.sendStatus(200);
          }
        });
      }
    });
  },
  imageupload_multi: (req, res, next) => {
    const uid = uuid();
    const arr_uid = uid.split("-");
    const content_uid = arr_uid[4];
    const user_uid = req.body.user_uid;
    const image_arr = []; // image 경로 만들기
    const image_files = req.files;
    image_files.map((data) => {
      // console.log(data);
      image_arr.push(`/multi_images/${data.filename}`);
    });
    const image_path = image_arr.join();
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const nickname = req.body.nickname;
    const gender = req.body.gender;
    const datas = [content_uid, user_uid, image_path, date, nickname, gender];
    const history_datas = [user_uid, "-2", date];

    const sql =
      "INSERT INTO images_multi(content_uid, user_uid, image_path,date,nickname,gender) values(?,?,?,?,?,?)";
    const confirm_point_sql = "SELECT point FROM members WHERE user_uid=?";
    const point_sql =
      "UPDATE sunpercent.members SET point=point-2 WHERE user_uid=?";
    const point_history_sql =
      "INSERT INTO point_history(user_uid, point_value, date) values(?,?,?)";

    connection.query(confirm_point_sql, user_uid, (error_1, row_1) => {
      if (error_1) {
        console.log("error_1 :  " + error_1);
        res.send(error_1);
      } else if (JSON.stringify(row_1[0].point) < 2) {
        // console.log("row_1 :  " + JSON.stringify(row_1[0].point));
        image_arr.map((data) => {
          fs.unlinkSync(`./public${data}`);
        });
        res.sendStatus(400);
      } else if (!image_path) {
        res.sendStatus(405);
      } else {
        connection.query(sql, datas, (error_2, row_2) => {
          // console.log(datas);
          if (error_2) {
            console.error("err multi image : " + error_2);
            image_arr.map((data) => {
              fs.unlinkSync(`./public${data}`);
            });
            res.send(error_2);
          } else {
            connection.query(point_sql, user_uid, (error_3, row_3) => {
              if (error_3) {
                console.log("point 2점 사용 multi image 에러   : " + error_3);
                image_arr.map((data) => {
                  fs.unlinkSync(`./public${data}`);
                });
              } else {
                connection.query(
                  point_history_sql,
                  history_datas,
                  (error_4, row_4) => {
                    if (error_4) {
                      console.log(
                        "multi image point history 에러   " + error_4
                      );
                      image_arr.map((data) => {
                        fs.unlinkSync(`./public${data}`);
                      });
                    } //else {
                    //   console.log(
                    //     "point 2점 사용 성공   : " + JSON.stringify(row_3)
                    //   );
                    // }
                  }
                );
              }
            });
            res.sendStatus(200);
          }
        });
      }
    });
  },
  getimage: (req, res, next) => {
    const content_uid = req.params.content_uid;
    const select_sql = "SELECT * FROM images WHERE content_uid=?";
    const update_count_sql =
      "UPDATE sunpercent.images SET view_count=view_count+1 WHERE content_uid=?";
    connection.query(update_count_sql, [content_uid], (error, row) => {
      if (error) {
        console.log("update view count error :  " + error);
        res.send(error);
      } else {
        connection.query(select_sql, [content_uid], (err, rows) => {
          if (err) {
            console.log("getimage :  " + err);
            res.send(err);
          } else {
            res.send(rows);
          }
        });
      }
    });
  },
  getMycontentimage: (req, res, next) => {
    const user_uid = req.params.user_uid;
    const sql = "SELECT * FROM images WHERE user_uid=?";
    connection.query(sql, [user_uid], (err, row) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.send(row);
      }
    });
  },

  getAllimages: (req, res, next) => {
    // const sql = "SELECT * FROM images";
    const rand_sql = "SELECT * FROM images ORDER BY RAND() LIMIT 100;";
    connection.query(rand_sql, (err, row) => {
      if (err) {
        console.log("getall_images 에러: " + err);
        res.send(err);
      } else {
        res.send(row);
      }
    });
  },

  deleteImage: async (req, res) => {
    const image_path = req.body.image_path;
    const user_uid = req.body.user_uid;
    const score_sql = "DELETE FROM sunpercent.score WHERE content_uid=?";
    const content_sql = "DELETE FROM sunpercent.images WHERE content_uid=?";

    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());
      if (user_uid === result.user_uid) {
        try {
          fs.unlinkSync(`./public${image_path}`);
          connection.query(
            content_sql,
            [req.params.content_uid],
            (err_1, rows) => {
              if (err_1) {
                console.log("content 에러" + err_1);
                res.send(err_1);
              } else {
                connection.query(
                  score_sql,
                  [req.params.content_uid],
                  (err_2, row) => {
                    if (err_2) {
                      console.log("score 에러" + err_2);
                      res.send(err_2);
                    }
                  }
                );
                // res.send(rows);
                res.sendStatus(200);
              }
            }
          );
        } catch (err_3) {
          console.log("image delete 에러" + err_3);
          console.log(err_3);
        }
      } else {
        res.sendStatus(403);
      }
    }
  },
  update_content_score: async (req, res) => {
    const content_uid = req.body.content_uid;
    const score_count = req.body.score_count;
    const sql = "UPDATE images SET score_count=? WHERE content_uid =?";
    connection.query(sql, [score_count, content_uid], (error, rows) => {
      if (error) {
        throw error;
        // console.log(error)
      }
      res.status(200).json({
        score_count: score_count,
      });
    });
  },
  search_content: async (req, res) => {
    const nicknamebody_param = req.body.nickname;
    // console.log("email :   " + emailbody_param);
    const sql = `SELECT content_uid,image_path,date,nickname,report_count FROM sunpercent.images WHERE nickname LIKE "%"?"%"`;
    connection.query(sql, nicknamebody_param, (err, row) => {
      if (err) {
        return res.status(400).json({
          error: [
            {
              msg: "search error something_1",
            },
          ],
        });
      }
      if (row.length > 0) {
        // res.status(200).json({
        //   msg: "Email Address Exists",
        // });
        res.send(row);
      } else if (row.length == 0) {
        // console.log("row : " + row);
        res.status(200).json({
          msg: "No Data",
        });
      } else {
        console.log("search error something_2");
      }
    });
  },
  report_content: async (req, res) => {
    const content_uid = req.body.content_uid;
    const to_uid = req.body.to_uid;
    const from_uid = req.body.from_uid;
    const report_reason = req.body.report_reason;
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const datas = [content_uid, to_uid, from_uid, report_reason, date];

    const report_count_sql =
      "UPDATE sunpercent.images SET report_count=report_count+1 WHERE content_uid=?";

    const report_confirm_sql =
      "SELECT * FROM sunpercent.report WHERE content_uid  LIKE ? AND from_uid LIKE ?";
    const report_sql =
      "INSERT INTO sunpercent.report(content_uid, to_uid, from_uid,report_reason,date) values(?,?,?,?,?)";

    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());
      // console.log("from_uid :  "+from_uid+"   result :  "+Object.values(result)+ "  token   :"+token)
      if (from_uid === result.user_uid) {
        connection.query(
          report_confirm_sql,
          [content_uid, from_uid],
          (err, data) => {
            if (data.length > 0) {
              res.status(400).json({
                message: "이미 신고 제출한 유저",
              });
            } else if (err) {
              console.log("신고하기 에러   :   " + err);
            } else {
              connection.query(report_sql, datas, (err_1, row_1) => {
                if (err_1) {
                  // console.error("err : " + err);
                  res.sendStatus(400);
                } else {
                  connection.query(
                    report_count_sql,
                    content_uid,
                    (err_2, row_2) => {
                      if (err_2) {
                        // console.error("err : " + err);
                        res.sendStatus(400);
                      } else {
                        res.sendStatus(200);
                      }
                    }
                  );
                  // console.log("rows: " + JSON.stringify(rows));
                }
              });
            }
          }
        );
      } else {
        res.status(403).json({
          message: "fobbiden",
        });
      }
    }
  },
};

module.exports = imageCtrl;

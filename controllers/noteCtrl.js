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

    const to_uid_sql = "SELECT user_uid FROM members WHERE nickname=?";

    const confirm_sql =
      "SELECT user_uid FROM members WHERE  user_uid  LIKE ? AND nickname LIKE ?";

    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());

      connection.query(to_uid_sql, to_nickname, (err_1, data_1) => {
        console.log("data_1  :  " + Object.values(data_1[0]));
        if (data_1.length > 0) {
          datas[0] = Object.values(data_1[0]);

          if (from_uid === result.user_uid) {
            try {
              connection.query(sql, datas, (err_2, row_2) => {
                if (err_2) {
                  console.log("note 에러  :   " + err_2);
                } else {
                  res.sendStatus(200);
                }
              });
            } catch (err_c) {
              console.log("note catch 에러  :   " + err_c);
            }
          } else {
            res.status(403).json({
              message: "fobbiden",
            });
            // res.sendStatus(403)
          }
        } else {
          res.sendStatus(400);
        }
      });
    }
  },
  getSentNote: async (req, res) => {
    const from_uid = req.body.from_uid;
    const from_nickname = req.body.from_nickname;
    const getsentnote_sql =
      "SELECT * FROM note WHERE from_uid  LIKE ? AND from_nickname LIKE ? AND from_delete LIKE 0";
    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());
      if (from_uid === result.user_uid) {
        connection.query(
          getsentnote_sql,
          [from_uid, from_nickname],
          (err, data) => {
            if (data.length > 0) {
              try {
                // console.log("sentnote data 보냄");
                res.send(data);
              } catch (err_c) {
                console.log("getsentnote catch 에러  :   " + err_c);
              }
            } else {
              res.sendStatus(400);
            }
          }
        );
      } else {
        res.status(403).json({
          message: "fobbiden",
        });
        // res.sendStatus(403)
      }
    }
  },
  getReceivedNote: async (req, res) => {
    const to_uid = req.body.to_uid;
    const to_nickname = req.body.to_nickname;
    const getreceivednote_sql =
      "SELECT * FROM note WHERE to_uid LIKE ? AND to_nickname LIKE ? AND to_delete LIKE 0";
    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());
      if (to_uid === result.user_uid) {
        connection.query(
          getreceivednote_sql,
          [to_uid, to_nickname],
          (err, data) => {
            if (data.length > 0) {
              try {
                // console.log("receivednote data 보냄");
                res.send(data);
              } catch (err_c) {
                console.log("receivednote catch 에러  :   " + err_c);
              }
            } else {
              res.sendStatus(400);
            }
          }
        );
      } else {
        res.status(403).json({
          message: "fobbiden",
        });
        // res.sendStatus(403)
      }
    }
  },
  deleteSentNoteDetail: async (req, res) => {
    const id_num = req.body.id_num;
    const from_uid = req.body.from_uid;
    const delsentdetail_sql =
      "UPDATE sunpercent.note SET from_delete=1 WHERE id_num LIKE ? AND from_uid LIKE ?";
    connection.query(delsentdetail_sql, [id_num, from_uid], (err, row) => {
      if (err) {
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
    });
  },
  deleteReceivedNoteDetail: async (req, res) => {
    const id_num = req.body.id_num;
    const to_uid = req.body.to_uid;
    const delreceiveddetail_sql =
      "UPDATE sunpercent.note SET to_delete=1 WHERE id_num LIKE ? AND to_uid LIKE ?";
    connection.query(delreceiveddetail_sql, [id_num, to_uid], (err, row) => {
      if (err) {
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
    });
  },
};

module.exports = noteCtrl;

const multer = require("multer");
const path = require("path");
const connection = require("../dbconfig");
const uuid = require("uuid-sequential");
const fs = require("fs");
const moment = require("moment");

const imageCtrl = {
  imageupload: (req, res, next) => {
    const uid = uuid();
    const arr_uid = uid.split("-");
    const content_uid = arr_uid[4];
    // const content_uid = req.body.content_uid;
    const user_uid = req.body.user_uid;
    const image_path = `/images/${req.file.filename}`; // image 경로 만들기
    const date = moment().format("YYYY-MM-DD hh:mm:ss A");
    const nickname = req.body.nickname;
    const gender = req.body.gender;
    const datas = [content_uid, user_uid, image_path, date, nickname, gender];

    const sql =
      "INSERT INTO images(content_uid, user_uid, image_path,date,nickname,gender) values(?,?,?,?,?,?)";
    connection.query(sql, datas, (err, rows) => {
      console.log(datas);
      if (err) {
        console.error("err : " + err);
        res.send(err);
      } else {
        console.log("rows: " + JSON.stringify(rows));
        res.send(rows);
      }
    });
  },
  getimage: (req, res, next) => {
    const content_uid = req.params.content_uid;
    const sql = "SELECT * FROM images WHERE content_uid=?";
    connection.query(sql, [content_uid], (err, row) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.send(row);
      }
    });
  },

  getAllimages: (req, res, next) => {
    const sql = "SELECT * FROM images";
    connection.query(sql, (err, row) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.send(row);
      }
    });
  },

  deleteImage: async (req, res) => {
    const image_path = req.body.image_path;
    try {
      fs.unlinkSync(`./public${image_path}`);
      connection.query(
        "DELETE FROM test.images WHERE content_uid=?",
        [req.params.content_uid],
        (error, rows) => {
          if (error) {
            console.log(err);
            res.send(error);
          } else {
            res.send(rows);
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
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
  },
};

module.exports = imageCtrl;

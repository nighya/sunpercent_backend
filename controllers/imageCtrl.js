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
    // const content_average_score = 0.0;
    // const score_count = 0;
    const gender = req.body.gender;
    const datas = [
      content_uid,
      user_uid,
      image_path,
      date,
      nickname,
      // content_average_score,
      // score_count,
      gender,
    ];

    const sql =
      "INSERT INTO images(content_uid, user_uid, image_path,date,nickname,gender) values(?,?,?,?,?,?)";
    connection.query(sql, datas, (err, rows) => {
      console.log(datas);
      if (err) {
        console.error("err : " + err);
        res.send(err);
      } else {
        res.sendStatus(200);
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
    const score_sql = "SELECT * FROM score WHERE content_uid=?";
    const content_sql = "DELETE FROM sunpercent.images WHERE content_uid=?";
    try {
      fs.unlinkSync(`./public${image_path}`);
      connection.query(content_sql, [req.params.content_uid], (error, rows) => {
        if (error) {
          console.log(err);
          res.send(error);
        } else {
          res.send(rows);
          connection.query(
            score_sql,
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
        }
      });
    } catch (err) {
      console.log(err);
    }
  },
  update_content_score: async (req, res) => {
    const content_uid = req.body.content_uid;
    const content_average_score = req.body.content_average_score;
    const score_count = req.body.score_count;
    const sql =
      "UPDATE images SET content_average_score=?,score_count=? WHERE content_uid =?";
    if (content_average_score != "NaN") {
      connection.query(
        sql,
        [content_average_score, score_count, content_uid],
        (error, rows) => {
          if (error) {
            throw error;
            // console.log(error)
          }
          res.status(200).json({
            content_average_score: content_average_score,
            score_count: score_count,
          });
        }
      );
    }
  },
};

module.exports = imageCtrl;

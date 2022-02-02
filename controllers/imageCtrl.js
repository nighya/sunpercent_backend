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
    const datas = [content_uid, user_uid, image_path, date];

    const sql =
      "INSERT INTO images(content_uid, user_uid, image_path,date) values(?, ?, ?,?)";
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
    const sql =
      "SELECT * FROM images WHERE content_uid=?";
    connection.query(sql, [content_uid], (err, row) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        console.log(row);
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
        console.log(row)
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
};

module.exports = imageCtrl;

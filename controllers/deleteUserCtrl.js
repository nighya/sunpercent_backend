const connection = require("../dbconfig");
const moment = require("moment");
let jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
var fs = require("fs");

const deleteUserCtrl = {
  delete_user: async (req, res) => {
    const user_uid = req.body.user_uid;
    const email = req.body.email;
    const nickname = req.body.nickname;
    const image_path = `/images/${req.file.filename}`;
    const select_user_sql =
      "SELECT * FROM sunpercent.members WHERE user_uid  LIKE ? AND email LIKE ? AND nickname LIKE ?";
    const select_profile_image_path_sql =
      "SELECT profile_image FROM sunpercent.members WHERE user_uid  LIKE ? AND email LIKE ? AND nickname LIKE ?";
    const select_image_path_sql =
      "SELECT FROM sunpercent.images WHERE user_uid LIKE ? AND nickname LIKE ?";

    const delete_score_sql = "DELETE FROM sunpercent.score WHERE to_uid=?";
    const delete_content_sql =
      "DELETE FROM sunpercent.images WHERE user_uid LIKE ? AND nickname LIKE ?";

    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());
      // console.log("result uid  :   " + result.user_uid);
      if (user_uid === result.user_uid) {
        //profile image 지우기
        connection.query(
          select_profile_image_path_sql,
          user_uid,
          (err_1, row_1) => {
            try {
              if (row_1.length > 0) {
                fs.unlinkSync(`public${Object.values(row_1[0])}`);
              }
            } catch (err) {}
          }
        );
        //image들 지우기
        connection.query(
          select_image_path_sql,
          [user_uid, nickname],
          (err_2, row_2) => {
            if (err_2) {
              console.log("err_2 에러  : " + err_2);
            }
            if (row_2.length > 0) {
              try {
                row_2.map((data) => {
                  fs.unlinkSync(`public${Object.values(data[0])}`);
                });
                //content 지우기
                connection.query(
                  delete_content_sql,
                  [user_uid, nickname],
                  (err_3, row_3) => {
                    if (err_3) {
                      console.log("err_3 에러  : " + err_3);
                    }
                  }
                );
                //score 지우기
                connection.query(delete_score_sql, user_uid, (err_4, row_4) => {
                  if (err_4) {
                    console.log("err_4 에러  : " + err_4);
                  }
                });
              } catch (err) {}
            }
          }
        );
      } else {
        res.status(403).json({
          message: "권한없음fobbiden",
        });
      }
    }
  },
};

module.exports = deleteUserCtrl;

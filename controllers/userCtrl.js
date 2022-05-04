const connection = require("../dbconfig");
const bcrypt = require("bcrypt");
const uuid = require("uuid-sequential");
const saltRounds = 10;
var fs = require("fs");
let jwt = require("jsonwebtoken");
require("dotenv").config();

const userCtrl = {
  login: async (req, res) => {
    const loginbody_param = [req.body.email, req.body.password];
    const sql = "SELECT * FROM members WHERE email=?";

    connection.query(sql, loginbody_param[0], (err, row) => {
      if (err)
        return res.status(400).json({
          error: [
            {
              msg: "id not found!",
            },
          ],
        });
      if (row.length > 0) {
        bcrypt.compare(loginbody_param[1], row[0].password, (error, result) => {
          let accessToken = jwt.sign(
            {
              email: loginbody_param[0],
              user_uid: row[0].user_uid,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "10s",
            }
          );
          let refreshToken = jwt.sign(
            {
              email: loginbody_param[0],
              user_uid: row[0].user_uid,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "14d",
            }
          );

          if (result) {
            //성공
            res.cookie("HrefreshToken", refreshToken, {
              maxAge: 14 * 24 * 60 * 60 * 1000,
              httpOnly: true,
              // secure : true,
            });
            res.status(200).json({
              user_uid: row[0].user_uid,
              email: row[0].email,
              nickname: row[0].nickname,
              gender: row[0].gender,
              max_score: row[0].max_score,
              profile_image:row[0].profile_image,
              // accessToken,
              // refreshToken,
            });
          } else {
            //실패
            return res.status(400).json({
              error: [
                {
                  msg: "Login fail!",
                },
              ],
            });
          }
        });
      } else {
        return res.status(400).json({
          error: [
            {
              msg: "id not found!!",
            },
          ],
        });
      }
    });
  },
  register: async (req, res, next) => {
    const uid = uuid();
    const arr_uid = uid.split("-");
    const short_uid = arr_uid[4];
    const body_param = [
      short_uid,
      req.body.email,
      req.body.nickname,
      req.body.password,
      req.body.gender,
    ];
    const sql = `INSERT INTO members(user_uid,email,nickname,password,gender) VALUES (?,?,?,?,?)`;
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(body_param[3], salt, function (err, hash) {
        body_param[3] = hash;
        connection.query(sql, body_param, (err, row) => {
          if (row) {
            res.status(200).json({
              message: "회원가입 성공",
            });
          } else {
            res.status(400).json({
              message: "회원가입 실패",
            });
          }
        });
      });
    });
    // bcrypt.hash(body_param[1], saltRounds, (error, hash) => {
    //   body_param[1] = hash;
    //   connection.query(sql, body_param, (err, row) => {});
    // });
  },

  getMember: async (req, res) => {
    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());
      if (req.params.id === result.id) {
        connection.query(
          "SELECT * FROM `test`.`member` WHERE id=?",
          [req.params.id],
          (error, rows) => {
            res.send(rows);
          }
        );
      } else {
        res.status(403).json({
          message: "fobbiden",
        });
      }
    }
  },
  update_profile_image: async (req, res) => {
    const user_uid = req.params.user_uid;
    const image_path = `/images/${req.file.filename}`;
    const update_sql = "UPDATE sunpercent.members SET profile_image=? WHERE user_uid =?";
    const sql_profile_image_path =
      "SELECT profile_image FROM sunpercent.members WHERE user_uid LIKE ?";
    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());
      console.log("result uid  :   "+result.user_uid)
      if (req.params.user_uid === result.user_uid) {
        connection.query(sql_profile_image_path, user_uid, (err, data) => {
          try {
            fs.unlinkSync(`public${Object.values(data[0])}`);
          } catch (err) {
            console.log("이미지 없음" + err);
          }
        });
        connection.query(update_sql, [image_path, user_uid], (error, rows) => {
          if (error) {
            throw error;
            // console.log(error)
          }
          res.status(200).json({
            profile_image:image_path,

          })
        });
      } else {
        res.status(403).json({
          message: "fobbiden",
        });
      }
    }
  },
};

module.exports = userCtrl;

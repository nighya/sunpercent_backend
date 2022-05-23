const connection = require("../dbconfig");
const bcrypt = require("bcrypt");
const uuid = require("uuid-sequential");
const saltRounds = 10;
var fs = require("fs");
let jwt = require("jsonwebtoken");
const { json } = require("body-parser");
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
              profile_image: row[0].profile_image,
              point: row[0].point,
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
  },
  email_validate: async (req, res) => {
    const emailbody_param = req.body.email;
    // console.log("email :   " + emailbody_param);
    const sql = "SELECT email FROM sunpercent.members WHERE email=?";
    connection.query(sql, emailbody_param, (err, row) => {
      if (err) {
        return res.status(200).json({
          error: [
            {
              msg: "mail validate error something",
            },
          ],
        });
      }
      if (row.length > 0) {
        res.status(200).json({
          msg: "Email Address Exists",
        });
      } else if (row.length == 0) {
        res.status(200).json({
          msg: "Email Address empty",
        });
      } else {
        console.log("이메일 유효성 검사 뭔가에러");
      }
    });
  },
  nickname_validate: async (req, res) => {
    const nicknamebody_param = req.body.nickname;
    // console.log("nicknamebody_param :   " + nicknamebody_param);
    const sql = "SELECT nickname FROM sunpercent.members WHERE nickname=?";
    connection.query(sql, nicknamebody_param, (err, row) => {
      if (err) {
        return res.status(200).json({
          error: [
            {
              msg: "error Nickname",
            },
          ],
        });
      }
      if (row.length > 0) {
        res.status(200).json({
          msg: "Nickname Exists",
        });
      } else if (row.length == 0) {
        res.status(200).json({
          msg: "Nickname empty",
        });
      } else {
        console.log("닉네임 유효성 검사 뭔가에러");
      }
    });
  },

  // getMember: async (req, res) => {
  //   const cookie = req.headers.cookie;
  //   const token = cookie.replace("HrefreshToken=", "");
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //   if (decoded) {
  //     var base64Payload = token.split(".")[1];
  //     var payload = Buffer.from(base64Payload, "base64");
  //     var result = JSON.parse(payload.toString());
  //     if (req.params.id === result.id) {
  //       connection.query(
  //         "SELECT * FROM `test`.`member` WHERE id=?",
  //         [req.params.id],
  //         (error, rows) => {
  //           res.send(rows);
  //         }
  //       );
  //     } else {
  //       res.status(403).json({
  //         message: "fobbiden",
  //       });
  //     }
  //   }
  // },
  getUserPoint: async (req, res) => {
    const cookie = req.headers.cookie;
    const user_uid = Object.keys(req.body)[0]
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());

      // console.log("req.body1 :  " + JSON.stringify(req.body));
      // console.log("req.body_confirm :  " + Object.keys(req.body)[0]);
      // console.log("result.user_uid :  " + (result.user_uid));

      if (user_uid === result.user_uid) {
        connection.query(
          "SELECT point FROM `sunpercent`.`members` WHERE user_uid=?",
          [user_uid],
          (error, rows) => {
            console.log("getUser point 성공")
            res.send(rows);
          }
        );
      } else {
        // console.log("else req.body2 :  " + JSON.stringify(req.body));
        res.status(403).json({
          message: "fobbiden",
        });
      }
    }
  },
  update_profile_image: async (req, res) => {
    const user_uid = req.params.user_uid;
    const image_path = `/images/${req.file.filename}`;
    const update_sql =
      "UPDATE sunpercent.members SET profile_image=? WHERE user_uid =?";
    const sql_profile_image_path =
      "SELECT profile_image FROM sunpercent.members WHERE user_uid LIKE ?";
    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      var result = JSON.parse(payload.toString());
      // console.log("result uid  :   " + result.user_uid);
      if (req.params.user_uid === result.user_uid) {
        connection.query(sql_profile_image_path, user_uid, (err, data) => {
          try {
            fs.unlinkSync(`public${Object.values(data[0])}`);
          } catch (err) {}
        });
        connection.query(update_sql, [image_path, user_uid], (error, rows) => {
          if (error) {
            throw error;
            // console.log(error)
          }
          res.status(200).json({
            profile_image: image_path,
          });
        });
      } else {
        res.status(403).json({
          message: "권한없음fobbiden",
        });
      }
    }
  },
};

module.exports = userCtrl;

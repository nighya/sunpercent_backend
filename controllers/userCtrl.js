const connection = require("../dbconfig");
const bcrypt = require("bcrypt");
const uuid = require("uuid-sequential");
const saltRounds = 10;

let jwt = require("jsonwebtoken");
require("dotenv").config();

const userCtrl = {
  login: async (req, res) => {
    const loginbody_param = [req.body.id, req.body.password];
    const sql = "SELECT * FROM member WHERE id=?";

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
              id: loginbody_param[0],
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "10s",
            }
          );
          let refreshToken = jwt.sign(
            {
              id: loginbody_param[0],
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
            });
            res.status(200).json({
              uid: row[0].uid,
              id: row[0].id,
              nickname: row[0].nickname,
              message: "토큰 발급됨",
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
          message: "fobbiden"
        })
      }
    }
  },
};

module.exports = userCtrl;

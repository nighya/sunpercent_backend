const connection = require("../dbconfig");
const bcrypt = require("bcrypt");
const uuid = require("uuid-sequential");
const saltRounds = 10;

let jwt = require("jsonwebtoken");
require("dotenv").config();

const testCtrl = {
  getDatas: async (req, res) => {
    
    connection.query(
      "SELECT * FROM `test`.`data` LIMIT 1000",
      (error, rows) => {
        if (error) throw error;
        res.send(rows);
      }
    );
  },
  getUsers: async (req, res) => {
    connection.query(
      "SELECT * FROM `test`.`user` LIMIT 1000",
      (error, rows) => {
        if (error) throw error;
        res.send(rows);
      }
    );
  },
  insertData: async (req, res) => {
    //javascript 구조분해할당
    const { dataId, data1, data2 } = req.body;
    //INSERT INTO `test`.`data` (`dataId`, `data1`, `data2`) VALUES ('네번째', '4444', '데이터4');
    const sql = `INSERT INTO test.data (dataId, data1, data2) VALUES ('${dataId}', '${data1}', '${data2}')`;
    connection.query(sql, (error, rows) => {
      if (error) throw error;
      res.send(rows);
    });
  },
  insertUser: async (req, res) => {
    //javascript 구조분해할당
    const { userId, password, local } = req.body;
    //INSERT INTO `test`.`user` (`userId`, `password`, `local`) VALUES ('최씨', '2222', '인천');
    const sql = `INSERT INTO test.user (userId, password, local) VALUES ('${userId}', '${password}', '${local}')`;
    connection.query(sql, (error, rows) => {
      if (error) throw error;
      res.send(rows);
    });
  },

  deleteData: async (req, res) => {
    connection.query(
      "DELETE FROM test.data WHERE  dataId=?",
      [req.params.contentId],
      (error, rows) => {
        if (error) throw error;
        res.send(rows);
      }
    );
  },
  deleteUser: async (req, res) => {
    connection.query(
      "DELETE FROM test.user WHERE  userId=?",
      [req.params.contentId],
      (error, rows) => {
        if (error) throw error;
        res.send(rows);
      }
    );
  },
  updateData: async (req, res) => {
    const dataId = req.body.dataId;
    const data1 = req.body.data1;
    const data2 = req.body.data2;
    const sql = "UPDATE test.data SET dataId=?,data1=?,data2=? WHERE dataId =?";
    connection.query(
      sql,
      [dataId, data1, data2, req.params.contentId],
      (error, rows) => {
        if (error) throw error;
        res.send(rows);
      }
    );
  },
  updateUser: async (req, res) => {
    const userId = req.body.userId;
    const password = req.body.password;
    const local = req.body.local;
    const sql =
      "UPDATE test.user SET userId=?,password=?,local=? WHERE userId =?";
    connection.query(
      sql,
      [userId, password, local, req.params.contentId],
      (error, rows) => {
        if (error) throw error;
        res.send(rows);
      }
    );
  },

  //회원등록 구현
  registerUser: async (req, res, next) => {
    const uid = uuid();
    const arr_uid = uid.split("-");
    const short_uid = arr_uid[4];
    const body_param = [
      short_uid,
      req.body.id,
      req.body.password,
      req.body.nickname,
    ];
    const sql = `INSERT INTO member(uid,id,password,nickname) VALUES (?,?,?,?)`;
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(body_param[2], salt, function (err, hash) {
        body_param[2] = hash;
        connection.query(sql, body_param, (err, row) => {});
      });
    });
    // bcrypt.hash(body_param[1], saltRounds, (error, hash) => {
    //   body_param[1] = hash;
    //   connection.query(sql, body_param, (err, row) => {});
    // });

    res.end();
  },

  //로그인 구현
  login: async (req, res, next) => {
    const loginbody_param = [req.body.id, req.body.password];
    const sql = "SELECT * FROM member WHERE id=?";

    connection.query(sql, loginbody_param[0], (err, row) => {
      if (err) throw err;
      if (row.length > 0) {
        bcrypt.compare(loginbody_param[1], row[0].password, (error, result) => {
          let accesstoken = jwt.sign(
            {
              id: loginbody_param[0],
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h",
            }
          );
          if (result) {
            //성공
            res.status(200).send({
              message: "Logged in!",
              accesstoken,
              
            })
          } else {
            //실패
            console.log("login 실패");
          }
        });
      } else {
        console.log("ID 없음");
      }
    });
    // res.end();
  },
};

module.exports = testCtrl;

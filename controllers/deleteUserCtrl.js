const connection = require("../dbconfig");
let jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
var fs = require("fs");
const dayjs = require("dayjs");

const deleteUserCtrl = {
  delete_user: async (req, res) => {
    const d = dayjs();
    const deleted_user_date = d.format("YYYY-MM-DD HH:mm:ss");

    const user_uid = req.body.user_uid;
    const email = req.body.email;
    const nickname = req.body.nickname;
    const password = req.body.password;

    const login_sql = "SELECT * FROM members WHERE email=?";
    const select_profile_image_path_sql =
      "SELECT profile_image FROM sunpercent.members WHERE user_uid  LIKE ? AND email LIKE ? AND nickname LIKE ?";
    const deleteProfileImage_sql =
      "UPDATE sunpercent.members SET profile_image=? WHERE user_uid =?";
    const select_image_path_sql =
      "SELECT image_path FROM sunpercent.images WHERE user_uid LIKE ? AND nickname LIKE ?";
    const delete_user_sql =
      "DELETE FROM sunpercent.members WHERE user_uid  LIKE ? AND email LIKE ? AND nickname LIKE ?";
    const delete_score_sql = "DELETE FROM sunpercent.score WHERE to_uid=?";
    const delete_content_sql =
      "DELETE FROM sunpercent.images WHERE user_uid LIKE ? AND nickname LIKE ?";
    const delete_note_sql =
      "DELETE FROM sunpercent.note WHERE to_uid LIKE ? AND to_nickname LIKE ?";

    const insert_deleted_user_sql = `INSERT INTO deleted_user(email,date) VALUES (?,?)`;

    const cookie = req.headers.cookie;
    const token = cookie.replace("HrefreshToken=", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //login 확인
    connection.query(login_sql, email, async (err_0, row_0) => {
      if (err_0) {
        return res.status(400).json({
          error: [
            {
              msg: "id not found!",
            },
          ],
        });
      } else if (row_0.length > 0) {
        bcrypt.compare(password, row_0[0].password, async (err_01, result) => {
          if (result) {
            if (decoded) {
              var base64Payload = token.split(".")[1];
              var payload = Buffer.from(base64Payload, "base64");
              var result = JSON.parse(payload.toString());
              // console.log("result uid  :   " + result.user_uid);
              if (user_uid === result.user_uid) {
                try {
                  //profile image 지우기
                  await connection.query(
                    select_profile_image_path_sql,
                    [user_uid, email, nickname],
                     (err_1, row_1) => {
                      //   console.log("row_1 랭스 : " + JSON.stringify(row_1));
                      //   console.log("row_2 랭스 : " + Object.values(row_1[0]));
                      console.log("log_1");
                      if (Object.values(row_1[0]) != "") {
                        fs.unlinkSync(`public${Object.values(row_1[0])}`);
                        connection.query(
                          deleteProfileImage_sql,
                          [null, user_uid],
                          (err_02, row_02) => {
                            if (err_02) {
                              console.log("err_02 에러 : " + err_02);
                            }
                          }
                        );
                      } else {
                        console.log("else 1");
                      }
                    }
                  );
                  //image들 지우기
                  await  connection.query(
                    select_image_path_sql,
                    [user_uid, nickname],
                    (err_2, row_2) => {
                      if (err_2) {
                        console.log("err_2 에러  : " + err_2);
                      }
                      else if (row_2[0] != null) {
                        console.log("log_2  : " + row_2[0]);
                        row_2.map((data) => {
                          console.log("data:  " + Object.values(data));
                          fs.unlinkSync(`public${Object.values(data)}`);
                        });
                      } else {
                        console.log("else 2")
                      }
                    }
                  );
                  //content 지우기
                  await  connection.query(
                    delete_content_sql,
                    [user_uid, nickname],
                    (err_3, row_3) => {
                      if (err_3) {
                        console.log("err_3 에러  : " + err_3);
                      } else {
                        console.log("else 3")
                      }
                    }
                  );
                  //score 지우기
                  await   connection.query(
                    delete_score_sql,
                    user_uid,
                    (err_4, row_4) => {
                      if (err_4) {
                        console.log("err_4 에러  : " + err_4);
                      } else {
                        console.log("else 4")
                      }
                    }
                  );
                  //note 지우기
                  await   connection.query(
                    delete_note_sql,
                    [user_uid, nickname],
                    (err_4_1, row_4_1) => {
                      if (err_4_1) {
                        console.log("err_4_1 에러  : " + err_4_1);
                      } else {
                        console.log("else 5")
                      }
                    }
                  );
                  //user 지우기
                  await  connection.query(
                    delete_user_sql,
                    [user_uid, email, nickname],
                    (err_5, row_5) => {
                      if (err_5) {
                        console.log("err_5 에러  : " + err_5);
                      } else {
                        console.log("else 6")
                      }
                    }
                  );
                  //지우고 로그
                  await  connection.query(
                    insert_deleted_user_sql,
                    [email, deleted_user_date],
                    (err_6, row_6) => {
                      if (err_6) {
                        console.log("err_5 에러  : " + err_6);
                        res.sendStatus(400);
                      } else {
                        console.log(
                          "user 지우고 지우기로그 성공  : " +
                            JSON.stringify(row_6)
                        );
                        res.sendStatus(200);
                      }
                    }
                  );
                } catch (err) {
                  console.log("catch_1 에러");
                }
              } else {
                res.status(403).json({
                  message: "권한없음fobbiden",
                });
              }
            }
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
        res.sendStatus(400);
      }
    });
  },
};

module.exports = deleteUserCtrl;

const connection = require("../dbconfig");
const moment = require("moment");

const noteCtrl = {
  SendNote: async (req, res) => {
    const to_uid = req.body.to_uid;
    const from_uid = req.body.from_uid;
    const nickname = req.body.nickname;
    const title = req.body.title;
    const message = req.body.message;
    const from_gender = req.body.from_gender;
    const date = moment().format("YYYY-MM-DD hh:mm:ss A");
    const datas = [to_uid, from_uid, nickname, title, message, from_gender, date];
    const sql =
      "INSERT INTO note(to_uid, from_uid, nickname, title, message, from_gender,date) values(?,?,?,?,?,?,?)";
    connection.query(sql, datas, (err_1, row_1) => {
      if (err_1) {
        console.log("note 에러  :   "+err_1)
      } else {
        res.sendStatus(200)
      }
    })


  },
};

module.exports = noteCtrl;

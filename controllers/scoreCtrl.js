const connection = require("../dbconfig");


const scoreCtrl = {
    getscore: (req, res, next) => {
        const content_uid = req.params.content_uid;
        const sql = "SELECT * FROM score WHERE content_uid=?";
        connection.query(sql, [content_uid], (err, row) => {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            res.send(row);
          }
        });
      },
}

module.exports = scoreCtrl;
const connection = require("../dbconfig");

const roomCtrl = {
  create_Room: async (req, res) => {
    const room_id = req.body.room_id;
    const room_name = req.body.room_name;
    const create_room_sql =
      "INSERT INTO room_list(room_id, room_name) values(?,?)";
    if (room_name != null) {
      connection.query(
        create_room_sql,
        [room_id, room_name],
        (err_1, row_1) => {
          if (err_1) {
            console.log("create_room_sql 에러 :  " + err_1);
          } else {
            res.sendStatus(200);
          }
        }
      );
    }
  },
  get_room_list: async (req, res) => {
    const select_sql = "SELECT * FROM room_list";
    connection.query(select_sql, (err_1, row_1) => {
      if (err_1) {
        console.log("create_room_sql 에러 :  " + err_1);
      } else {
        res.send(row_1);
      }
    });
  },
  delete_room: async (req, res) => {
    const delete_sql = "DELETE FROM sunpercent.room_list WHERE room_id=?";
    const room_id = req.body.room_id;
    connection.query(delete_sql, room_id, (err_1, row_1) => {
      if (err_1) {
        console.log("delete_room 에러 :  " + err_1);
      } else {
        res.sendStatus(200);
      }
    });
  },
};

module.exports = roomCtrl;

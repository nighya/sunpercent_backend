const jwt = require("jsonwebtoken");

module.exports = {
  tokenCheck: (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = decoded;
        next();
      } else {
        const cookie = req.headers.cookie;
        const token = cookie.replace("HrefreshToken=", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = decoded;
        next();
      }
    } catch (err) {
      console.log("tokenCheck 에러  :  "+err);
      res.status(403).send({
        message: "token Check forbidden Page",
      });
    }
  },
};

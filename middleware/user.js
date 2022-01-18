const jwt = require("jsonwebtoken")

module.exports = {
    isLoggedIn : (req,res,next) => {
        try {
            const authHeader = req.headers.authorization
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.userData = decoded
            next()
        } catch (err) {
            console.log(err)
            res.status(403).send({
                message: "error"
            })
        }
    }
}
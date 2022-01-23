const testCtrl = require("../controllers/testCtrl");
const userCtrl = require("../controllers/userCtrl");
const router = require("express").Router();
const middleware = require("../middleware/tokenCheck");

const multer = require("multer");
const path = require("path");
const imageCtrl = require("../controllers/imageCtrl");

// api/test/data
// router.route("/data").get(middleware.isLoggedIn, testCtrl.getDatas).post(testCtrl.insertData);
router
  .route("/data")
  .get(middleware.tokenCheck, testCtrl.getDatas)
  .post(testCtrl.insertData);

router
  .route("/UserDataView/:contentId")
  .delete(testCtrl.deleteData)
  .post(testCtrl.updateData);
router.route("/UserDataView/:contentId/Edit").post(testCtrl.updateData);

//api/test/user
// router.route("/user").get(middleware.isLoggedIn, testCtrl.getUsers).post(testCtrl.insertUser);
router
  .route("/user")
  .get(middleware.tokenCheck, testCtrl.getUsers)
  .post(testCtrl.insertUser);
router
  .route("/UserUserView/:contentId")
  .delete(testCtrl.deleteUser)
  .post(testCtrl.updateUser);
router.route("/UserUserView/:contentId/Edit").post(testCtrl.updateUser);

// /login
router.route("/login").post(userCtrl.login);

// /registerUser
router.route("/register").post(userCtrl.register);

//api/test/Mypage
router.route("/Mypage/:id").get(middleware.tokenCheck, userCtrl.getMember);

//image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

router.post("/imageupload", upload.single("image"), imageCtrl.imageupload);

//image load
router.route("/getimage/:content_uid").get(imageCtrl.getimage);

router.route("/getAllimages").get(imageCtrl.getAllimages)

//image delete
router.route("/getimage/:content_uid").post(imageCtrl.deleteImage)

module.exports = router;

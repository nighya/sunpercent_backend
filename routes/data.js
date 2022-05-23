// const testCtrl = require("../controllers/testCtrl");
const userCtrl = require("../controllers/userCtrl");
const scoreCtrl = require("../controllers/scoreCtrl");
const router = require("express").Router();
const middleware = require("../middleware/tokenCheck");

const multer = require("multer");
const path = require("path");
const imageCtrl = require("../controllers/imageCtrl");

// api/test/data
// router.route("/data").get(middleware.isLoggedIn, testCtrl.getDatas).post(testCtrl.insertData);
// router
//   .route("/data")
//   .get(middleware.tokenCheck, testCtrl.getDatas)
//   .post(testCtrl.insertData);

// router
//   .route("/UserDataView/:contentId")
//   .delete(testCtrl.deleteData)
//   .post(testCtrl.updateData);
// router.route("/UserDataView/:contentId/Edit").post(testCtrl.updateData);

//api/test/user
// router.route("/user").get(middleware.isLoggedIn, testCtrl.getUsers).post(testCtrl.insertUser);
// router
//   .route("/user")
//   .get(middleware.tokenCheck, testCtrl.getUsers)
//   .post(testCtrl.insertUser);
// router
//   .route("/UserUserView/:contentId")
//   .delete(testCtrl.deleteUser)
//   .post(testCtrl.updateUser);
// router.route("/UserUserView/:contentId/Edit").post(testCtrl.updateUser);

// /login
router.route("/login").post(userCtrl.login);

// /registerUser
router.route("/register").post(userCtrl.register);
router.route("/email_validate").post(userCtrl.email_validate);
router.route("/nickname_validate").post(userCtrl.nickname_validate);


//  /getUser
router.route("/getUserPoint").post(middleware.tokenCheck, userCtrl.getUserPoint);

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

router
  .route("/imageupload")
  .post(middleware.tokenCheck, upload.single("image"), imageCtrl.imageupload);

//image load
router.route("/getimage/:content_uid").get(imageCtrl.getimage);

router.route("/getAllimages").get(imageCtrl.getAllimages);

//image delete
router
  .route("/getimage/:content_uid")
  .post(middleware.tokenCheck, imageCtrl.deleteImage);

//image contentscore
router
  .route("/contentscore")
  .post(middleware.tokenCheck, scoreCtrl.scoreupload);

// image contentscore scorecount
router
  .route("/contentscore/:content_uid")
  .post(middleware.tokenCheck, imageCtrl.update_content_score);

//get content score
router
  .route("/getscore/:content_uid")
  .post(middleware.tokenCheck, scoreCtrl.getscore);
 
// profile_image update
router
  .route("/Mypage/:user_uid")
  .post(
    middleware.tokenCheck,
    upload.single("image"),
    userCtrl.update_profile_image
  );

// getmycontent image
router
  .route("/Mypage/mycontentimage/:user_uid")
  .get(middleware.tokenCheck, imageCtrl.getMycontentimage);

//search content
router.route("/content/search").post(imageCtrl.search_content);

module.exports = router;

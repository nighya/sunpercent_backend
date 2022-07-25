// const testCtrl = require("../controllers/testCtrl");
const userCtrl = require("../controllers/userCtrl");
const scoreCtrl = require("../controllers/scoreCtrl");
const noteCtrl = require("../controllers/noteCtrl");
const router = require("express").Router();
const middleware = require("../middleware/tokenCheck");

const multer = require("multer");
const path = require("path");
const imageCtrl = require("../controllers/imageCtrl");

// /login
router.route("/login").post(userCtrl.login);

// /registerUser
router.route("/register").post(userCtrl.register);
router.route("/email_validate").post(userCtrl.email_validate);
router.route("/nickname_validate").post(userCtrl.nickname_validate);

//  /getUser
router
  .route("/getUserPoint")
  .post(middleware.tokenCheck, userCtrl.getUserPoint);

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

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

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
// profile_image delete
router
  .route("/Mypage/deleteProfileImage/:user_uid")
  .post(middleware.tokenCheck, userCtrl.deleteProfileImage);

// userpage_profile
router.route("/userpageProfile/:nickname/:user_uid").post(userCtrl.get_userProfile);

// userpage_profile_image
router
  .route("/userpageProfileImage/:nickname/:user_uid")
  .post(userCtrl.get_userProfile_image);

// getmycontent image
router
  .route("/Mypage/mycontentimage/:user_uid")
  .get(middleware.tokenCheck, imageCtrl.getMycontentimage);

//search content
router.route("/content/search").post(imageCtrl.search_content);

//resetpassword
router.route("/login/forgotpassword").post(userCtrl.PasswordResetMailSend);

//changepassword
router
  .route("/login/changepassword")
  .post(middleware.tokenCheck, userCtrl.ChangePassword);

//report
router.route("/report").post(middleware.tokenCheck, imageCtrl.report_content);

//send note
router.route("/note/sendnote").post(middleware.tokenCheck, noteCtrl.SendNote);

//getsentnote
router
  .route("/note/getsentnote")
  .post(middleware.tokenCheck, noteCtrl.getSentNote);

//getreceivednote
router
  .route("/note/getreceivednote")
  .post(middleware.tokenCheck, noteCtrl.getReceivedNote);

//delete note detail
router
  .route("/notedelete/deleteSentNoteDetail")
  .post(middleware.tokenCheck, noteCtrl.deleteSentNoteDetail);

router
  .route("/notedelete/deleteReceivedNoteDetail")
  .post(middleware.tokenCheck, noteCtrl.deleteReceivedNoteDetail);

//delete note selected
router
  .route("/notedelete/deleteSentNoteSelected")
  .post(middleware.tokenCheck, noteCtrl.deleteSentNoteSelected);

router
  .route("/notedelete/deleteReceivedNoteSelected")
  .post(middleware.tokenCheck, noteCtrl.deleteReceivedNoteSelected);

module.exports = router;

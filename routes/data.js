const uuid = require("uuid-sequential");
// const testCtrl = require("../controllers/testCtrl");
const userCtrl = require("../controllers/userCtrl");
const scoreCtrl = require("../controllers/scoreCtrl");
const noteCtrl = require("../controllers/noteCtrl");
const router = require("express").Router();
const middleware = require("../middleware/tokenCheck");
const multer = require("multer");
const path = require("path");
const imageCtrl = require("../controllers/imageCtrl");
const deleteUserCtrl = require("../controllers/deleteUserCtrl");

//bulid route start
router.get(
  [
    "/",
    "/content",
    "/Content_multi",
    "/login",
    "/findpassword",
    "/changepassword",
    "/register",
    "/mypage/:user_uid",
    "/contentupload",
    "/contentupload_multi",
    "/content/:content_uid",
    "/content_multi/:content_uid",
    "/search",
    "/note/:nickname/:user_uid",
    "/MyNote/:user_uid",
    "/userpage/:nickname/:user_uid",
    "/withdrawal",
    "/TermsOfUse",
    "/PolicyPrivacy",
    "/404",
  ],
  function (req, res, next) {
    res.sendFile(path.join(__dirname, "../public/", "index.html"));
  }
);
//bulid route end

// login
router.route("/sun/login").post(userCtrl.login);

// /registerUser
router.route("/sun/register").post(userCtrl.register);
router.route("/sun/email_validate").post(userCtrl.email_validate);
router.route("/sun/nickname_validate").post(userCtrl.nickname_validate);

//  /getUser
router
  .route("/sun/getUserPoint")
  .post(middleware.tokenCheck, userCtrl.getUserPoint);

//image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    const uid = uuid();
    const arr_uid = uid.split("-");
    const filename_uid = arr_uid[4];
    const filename = filename_uid.substring(6, filename_uid.length);
    const ext = path.extname(file.originalname);
    cb(null, filename + "-" + Date.now() + ext);
    // const ext = path.extname(file.originalname);
    // cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
  },
});
const storage_multi = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/multi_images/");
  },
  filename: function (req, file, cb) {
    const uid = uuid();
    const arr_uid = uid.split("-");
    const filename_uid = arr_uid[4];
    const filename = filename_uid.substring(6, filename_uid.length);
    const ext = path.extname(file.originalname);
    cb(null, filename + "-" + Date.now() + ext);
    // const ext = path.extname(file.originalname);
    // cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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
const upload_multi = multer({
  storage: storage_multi,
  limits: { fileSize: 5 * 1024 * 1024 },
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
  .route("/sun/imageupload")
  .post(middleware.tokenCheck, upload.single("image"), imageCtrl.imageupload);
router
  .route("/sun/imageupload_multi")
  .post(
    middleware.tokenCheck,
    upload_multi.array("image", 3),
    imageCtrl.imageupload_multi
  );

//image load
router.route("/sun/getimage/:content_uid").get(imageCtrl.getimage);
router.route("/sun/getimage_multi/:content_uid").get(imageCtrl.getimage_multi);

router.route("/sun/getAllimages").get(imageCtrl.getAllimages);
router.route("/sun/getAllimages_multi").get(imageCtrl.getAllimages_multi);

//image delete
router
  .route("/sun/getimage/:content_uid")
  .post(middleware.tokenCheck, imageCtrl.deleteImage);
router
  .route("/sun/getimage_multi/:content_uid")
  .post(middleware.tokenCheck, imageCtrl.deleteImage_multi);

//image contentscore
router
  .route("/sun/contentscore")
  .post(middleware.tokenCheck, scoreCtrl.scoreupload);
router
  .route("/sun/contentscore_multi")
  .post(middleware.tokenCheck, scoreCtrl.scoreupload_multi);

// image contentscore scorecount
router
  .route("/sun/contentscore/:content_uid")
  .post(middleware.tokenCheck, imageCtrl.update_content_score);
router
  .route("/sun/contentscore_multi/:content_uid")
  .post(middleware.tokenCheck, imageCtrl.update_content_score_multi);

//get content score
router
  .route("/sun/getscore/:content_uid")
  .post(middleware.tokenCheck, scoreCtrl.getscore);
router
  .route("/sun/getscore_multi/:content_uid")
  .post(middleware.tokenCheck, scoreCtrl.getscore_multi);

// profile_image update
router
  .route("/sun/Mypage/:user_uid")
  .post(
    middleware.tokenCheck,
    upload.single("image"),
    userCtrl.update_profile_image
  );
// profile_image delete
router
  .route("/sun/Mypage/deleteProfileImage/:user_uid")
  .post(middleware.tokenCheck, userCtrl.deleteProfileImage);

// userpage_profile
router
  .route("/sun/userpageProfile/:nickname/:user_uid")
  .post(userCtrl.get_userProfile);

// userpage_profile_image
router
  .route("/sun/userpageProfileImage/:nickname/:user_uid")
  .post(userCtrl.get_userProfile_image);

// getmycontent image
router
  .route("/sun/Mypage/mycontentimage/:user_uid")
  .get(middleware.tokenCheck, imageCtrl.getMycontentimage);

//search content
router.route("/sun/content_search").post(imageCtrl.search_content);

//resetpassword
router.route("/sun/login/forgotpassword").post(userCtrl.PasswordResetMailSend);

//changepassword
router
  .route("/sun/login/changepassword")
  .post(middleware.tokenCheck, userCtrl.ChangePassword);

//report
router
  .route("/sun/report")
  .post(middleware.tokenCheck, imageCtrl.report_content);
router
  .route("/sun/report_multi")
  .post(middleware.tokenCheck, imageCtrl.report_content_multi);

//send note
router
  .route("/sun/note/sendnote")
  .post(middleware.tokenCheck, noteCtrl.SendNote);

//getsentnote
router
  .route("/sun/note/getsentnote")
  .post(middleware.tokenCheck, noteCtrl.getSentNote);

//getreceivednote
router
  .route("/sun/note/getreceivednote")
  .post(middleware.tokenCheck, noteCtrl.getReceivedNote);

//delete note detail
router
  .route("/sun/notedelete/deleteSentNoteDetail")
  .post(middleware.tokenCheck, noteCtrl.deleteSentNoteDetail);

router
  .route("/sun/notedelete/deleteReceivedNoteDetail")
  .post(middleware.tokenCheck, noteCtrl.deleteReceivedNoteDetail);

//delete note selected
router
  .route("/sun/notedelete/deleteSentNoteSelected")
  .post(middleware.tokenCheck, noteCtrl.deleteSentNoteSelected);

router
  .route("/sun/notedelete/deleteReceivedNoteSelected")
  .post(middleware.tokenCheck, noteCtrl.deleteReceivedNoteSelected);

//confirm received note
router
  .route("/sun/confirm_received_NoteDetail")
  .post(middleware.tokenCheck, noteCtrl.confirm_received_NoteDetail);

//delete user
router
  .route("/sun/delete_user_goodbye")
  .post(middleware.tokenCheck, deleteUserCtrl.delete_user);
module.exports = router;

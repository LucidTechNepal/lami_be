// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },

//   filename: function (req, file, cb) {
//     let ext = path.extname(file.originalname);
//     cb(null, Date.now() + `${file.fieldname}${ext}`);
//   },
// });

// const filter = function (req, file, cb) {
//   if (
//     file.mimetype == "image/jpg" ||
//     file.mimetype == "image/png" ||
//     file.mimetype == "image/jpeg"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const image_upload = multer({
//   storage: storage,
//   fileFilter: filter,
// });

// module.exports = image_upload;


// const multer = require('multer');
// const multerS3 = require('multer-s3');
// const aws = require('aws-sdk');
// const path = require("path");




//  const filter = function (req, file, cb) {
//   if (
//     file.mimetype == "image/jpg" ||
//     file.mimetype == "image/png" ||
//     file.mimetype == "image/jpeg"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

//   const image_upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'lamibe', // Replace this with your bucket name
//     key: function (req, file, cb) {
//       let ext = path.extname(file.originalname);
//       cb(null, Date.now() + `${file.fieldname}${ext}`);
//     }
//   }),
//   fileFilter: filter
// });


// module.exports = image_upload;

const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

// Configure AWS SDK
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION // Replace with your desired region
});

const s3 = new aws.S3();

const filter = function (req, file, cb) {
  if (
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const image_upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_URL, // Replace with your bucket name
    key: function (req, file, cb) {
      let ext = path.extname(file.originalname);
      cb(null, Date.now() + `${file.fieldname}${ext}`);
    }
  }),
  fileFilter: filter
});

module.exports = image_upload;

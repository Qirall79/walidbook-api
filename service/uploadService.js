const multer = require("multer");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "docpycf9f",
  api_key: process.env.CLOUDINARY_API_KEY || "422224551253893",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "sQ5Lfkoq-YOVPRu6J-Z7ls5eM7E",
});

const memoryStorage = multer.memoryStorage();
const upload = multer({
  storage: memoryStorage,
});

const uploadToCloudinary = async (fileString, format) => {
  try {
    const { uploader } = cloudinary;
    const res = await uploader.upload(
      `data:image/${format};base64,${fileString}`
    );
    return res;
  } catch (err) {
    return console.log(err);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
};

const { uploadToCloudinary } = require("../service/uploadService");
const { bufferToDataURI } = require("../utils/file");

const uploadImage = async (req, res, next) => {
  try {
    const { file } = req;
    if (!file) {
      res.locals.imageDetails = null;
      return next();
    }

    const fileFormat = file.mimetype.split("/")[1];
    const { base64 } = bufferToDataURI(fileFormat, file.buffer);

    const imageDetails = await uploadToCloudinary(base64, fileFormat);

    res.locals.imageDetails = imageDetails;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = uploadImage;

const ImageKit = require("@imagekit/nodejs");

function getImageKitEnv() {
  return {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
  };
}

function isImageKitConfigured() {
  const { publicKey, privateKey, urlEndpoint } = getImageKitEnv();
  return Boolean(publicKey && privateKey && urlEndpoint);
}

const imageKitClient = isImageKitConfigured() ? new ImageKit(getImageKitEnv()) : null;

module.exports = {
  imageKitClient,
  isImageKitConfigured,
};

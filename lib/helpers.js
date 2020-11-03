/**
 * Helpers for Various task
 */
//Dependencies
const crypto = require("crypto");
const config = require("../config");

// Constainer for the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = (str) => {
  if (typeof str == "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

//Parse a JSON string to and Object in all cases, without throwing
helpers.parsejsonToObj = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

//Creat a string of aplhanumeric characters of a given length
helpers.createRandomString = (strlength) => {
  strlength = typeof strlength == "number" && strlength > 0 ? strlength : false;
  if (strlength) {
    // define all possible charachters that could go into a string
    const charaters = "abcdefghijklmnopqrstuvwxyz0123456789";

    //start the final string
    let str = "";
    for (let i = 1; i <= strlength; i++) {
      const randomCharater = charaters.charAt(
        Math.floor(Math.random() * charaters.length)
      );
      str += randomCharater;
    }
    return str;
  } else {
    return false;
  }
};
module.exports = helpers;

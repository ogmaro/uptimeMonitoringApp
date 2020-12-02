/**
 * Helpers for Various task
 */
//Dependencies
const crypto = require("crypto");
const config = require("../config");
const https = require("https");
const querystring = require("querystring");

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

//Create a string of aplhanumeric characters of a given length
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

// Send SMS  Message via twilo
helpers.sendTwilosSMS = (phone, msg, callback) => {
  phone = typeof phone == "string" && phone.trim() == 10 ? phone.trim() : false;
  msg =
    typeof msg == "string" && msg.trim().length <= 1600 ? msg.trim() : false;
  if (phone && msg) {
    // Configure the request payload
    const payload = {
      From: config.twilio.fromPhone,
      To: "+234" + phone,
      body: msg,
    };
    //Stringfy the payload
    const stringPayload = querystring(payload);

    //Configure the request detail
    const requestDetails = {
      protocol: "https:",
      hostname: "api.twilio.com",
      method: "POST",
      path:
        "/2010-04-01/Accounts/" + config.twilio.accountSid + "/Messages.json",
      auth: config.twilio.accountSid + ":" + config.twilio.authToken,
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(stringPayload),
      },
    };
    //Instantiate the request object
    const req = https.request(requestDetails, (res) => {
      //Get the status of the sent request
      const status = res.statusCode;
      //Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback("Status code return was " + status);
      }
    });
    //Bind to the error event so it doens't get thrown
    req.on("error", (e) => {
      callback(e);
    });
    //And the payload
    req.write(stringPayload);

    //End the request
    req.end();
  } else {
    callback("Given parameters were missing or invalid");
  }
};

module.exports = helpers;

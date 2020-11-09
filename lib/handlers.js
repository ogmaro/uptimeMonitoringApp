/**
 * Requests handlers
 */

//Dependencies
const config = require("../config");
const _data = require("./data");
const helpers = require("./helpers");

//define the handlers
const handlers = {};

//Users
handlers.users = (data, callback) => {
  const accepteableMethods = ["post", "get", "put", "delete"];
  if (accepteableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405, { msg: "Method not recognuzed" });
  }
};

// Container for the user submethods
handlers._users = {};

// User - post
handlers._users.post = (data, callback) => {
  const firstname =
    typeof data.payload.firstname == "string" &&
    data.payload.firstname.trim().length > 0
      ? data.payload.firstname
      : false;
  const lastname =
    typeof data.payload.lastname == "string" &&
    data.payload.lastname.trim().length > 0
      ? data.payload.lastname
      : false;
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;
  if (firstname && lastname && phone && password && tosAgreement) {
    //Make sure that the user doesn't already exist
    _data.read("users", phone, (err, data) => {
      if (err) {
        //Hash the password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          //Create user Obj
          const userOBJ = {
            firstname: firstname,
            lastname: lastname,
            phone: phone,
            password: hashedPassword,
            tosAgreement: true,
          };
          _data.create("users", phone, userOBJ, (err) => {
            if (!err) {
              callback(200, { msg: "user created" });
            } else {
              callback(500, { error: "could not create the new user" });
            }
          });
        } else {
          callback(500, { msg: "could not hash password" });
        }
      } else {
        callback(400, { error: "user with that phone number already exist" });
      }
    });
  } else {
    callback(400, { error: "Missing required fields" });
  }
};

// User - get
//Require data: Phone
//@TODO Only allow authenticated user access thir object, don't let the access any one elses
handlers._users.get = (data, callback) => {
  //Check that the phone number is valid
  const phone =
    typeof data.queryStringOBJ.phone == "string" &&
    data.queryStringOBJ.phone.trim().length == 10
      ? data.queryStringOBJ.phone.trim()
      : false;
  if (phone) {
    //Get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    //Verify that the given token is valid for the phone number
    handlers._token.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        //lookup the user
        _data.read("users", phone, (err, data) => {
          if (!err && data) {
            //Remove the hash password from the obj before returning to the user
            delete data.password;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid",
        });
      }
    });
  } else {
    callback(400, { error: "missing a require field" });
  }
};

// User - put
//Required data: phone
handlers._users.put = (data, callback) => {
  //Check for the rquired field
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone
      : false;

  //Check of optional field
  const firstname =
    typeof data.payload.firstname == "string" &&
    data.payload.firstname.trim().length > 0
      ? data.payload.firstname
      : false;
  const lastname =
    typeof data.payload.lastname == "string" &&
    data.payload.lastname.trim().length > 0
      ? data.payload.lastname
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password
      : false;

  //error if phone is invalid
  if (phone) {
    // error if nothing is sent to update
    if (firstname || lastname || password) {
      //Get the token from the headers
      const token =
        typeof data.headers.token == "string" ? data.headers.token : false;

      //Verify that the given token is valid for the phone number
      handlers._token.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          //lookUp the user
          _data.read("users", phone, (err, userData) => {
            if (!err && userData) {
              //Update neccessary fields
              if (firstname) {
                userData.firstname = firstname;
              }
              if (lastname) {
                userData.lastname = lastname;
              }
              if (password) {
                userData.password = helpers.hash(pasword);
              }
              _data.update("users", phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, { error: err });
                }
              });
            } else {
              callback(404);
            }
          });
        } else {
          callback(403, {
            Error: "Missing required token in header, or token is invalid",
          });
        }
      });
    } else {
      callback(400, { error: "missing required field" });
    }
  } else {
    callback(400, { error: "missing a required field" });
  }
};

// User - delete
// Required field: phone
//@TODO Only allow authenticated user access thir object, don't let the access any one elses
handlers._users.delete = (data, callback) => {
  //Check that the phone number is valid
  const phone =
    typeof data.queryStringOBJ.phone == "string" &&
    data.queryStringOBJ.phone.trim().length == 10
      ? data.queryStringOBJ.phone.trim()
      : false;
  if (phone) {
    //Get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    //Verify that the given token is valid for the phone number
    handlers._token.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        //lookup the user
        _data.read("users", phone, (err, data) => {
          if (!err && data) {
            _data.delete("users", phone, (err) => {
              if (!err) {
                callback(200);
              } else {
                callback(500, { error: "error deleting user" });
              }
            });
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid",
        });
      }
    });
  } else {
    callback(404, { error: "cannot find user" });
  }
};

//Users
handlers.tokens = (data, callback) => {
  const accepteableMethods = ["post", "get", "put", "delete"];
  if (accepteableMethods.indexOf(data.method) > -1) {
    handlers._token[data.method](data, callback);
  } else {
    callback(405, { msg: "Method not recognuzed" });
  }
};

// Container for the user submethods
handlers._token = {};

//Tokens - post
//Required data: phone, password
handlers._token.post = (data, callback) => {
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password
      : false;

  if (phone && password) {
    //Lookup the user who matches the phone number
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        //Hash the sent password, and compare it to the pasword stored in the onj
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.password) {
          // if valid, create a new token with a random name, set expiration date to 1hr in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObj = {
            phone: phone,
            id: tokenId,
            expires: expires,
          };
          // Store the token
          _data.create("tokens", tokenId, tokenObj, (err) => {
            if (!err) {
              callback(200, tokenObj);
            } else {
              callback(500, {
                Error: "Could not create the new token",
                msg: err,
              });
            }
          });
        } else {
          callback(400, {
            Error: "Password did not match the spcified user's stored password",
          });
        }
      } else {
        callback(400, { error: "Could not find the specified user" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};
//TOKEN - post
handlers._token.get = (data, callback) => {
  //Check that the id number is valid
  const id =
    typeof data.queryStringOBJ.id == "string" &&
    data.queryStringOBJ.id.trim().length == 20
      ? data.queryStringOBJ.id.trim()
      : false;
  if (id) {
    //lookup the user
    _data.read("tokens", id, (err, userData) => {
      if (!err && userData) {
        callback(200, userData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "missing a require field" });
  }
};

//Token - put
handlers._token.put = (data, callback) => {
  const id =
    typeof data.payload.id == "string" && data.payload.id.trim().length > 0
      ? data.payload.id
      : false;
  const extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;

  if (id && extend) {
    //Lookup the token
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        //Check to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          //Set the expiration an hour from now
          tokenData.expires = Date.now() * 1000 * 60 * 60;

          //Store the new updates
          _data.update("tokens", id, tokenData, (err) => {
            if (!err) {
              callback(200, { msg: "Time extended" });
            } else {
              callback(500, {
                Error: "Could not update the token's expiration",
              });
            }
          });
        } else {
          callback(400, {
            Error: " The token has already expired, and cannot be extended",
          });
        }
      } else {
        callback(400, { Error: "Specified token does'nt exist" });
      }
    });
  } else {
    callback(400, { Error: "Missing required Field" });
  }
};

//Token - delete
handlers._token.delete = (data, callback) => {
  //Check that the phone number is valid
  const id =
    typeof data.queryStringOBJ.id == "string" &&
    data.queryStringOBJ.id.trim().length == 20
      ? data.queryStringOBJ.id.trim()
      : false;
  if (id) {
    //lookup the user
    _data.read("tokens", id, (err, data) => {
      if (!err && data) {
        _data.delete("tokens", id, (err) => {
          if (!err) {
            callback(200, { msg: " token deleted" });
          } else {
            callback(500, { Error: "error deleting token" });
          }
        });
      } else {
        callback(404);
      }
    });
  } else {
    callback(404, { Error: "cannot find token" });
  }
};

//Verify if a given token id is currently valid for a given user
handlers._token.verifyToken = (id, phone, callback) => {
  //Lookup the token
  _data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      //Check that the token is for the given user has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

//Checks
handlers.checks = (data, callback) => {
  const accepteableMethods = ["post", "get", "put", "delete"];
  if (accepteableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405, { msg: "Method not recognuzed" });
  }
};

// Container for the user submethods
handlers._checks = {};

//Checks - Post
//Required data: protocol, url, method, successCode, timeoutSeconds
handlers._checks.post = (data, callback) => {
  const protocol =
    typeof data.payload.protocol == "string" &&
    ["https", "http"].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;
  const url =
    typeof data.payload.url == "string" && data.payload.url.trim().length > 0
      ? data.payload.url
      : false;
  const method =
    typeof data.payload.method == "string" &&
    ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;
  const successCodes =
    typeof data.payload.successCodes == "object" &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  const timeOutSeconds =
    typeof data.payload.timeOutSeconds == "number" &&
    data.payload.timeOutSeconds % 1 === 0 &&
    data.payload.timeOutSeconds >= 1 &&
    data.payload.timeOutSeconds <= 5
      ? data.payload.timeOutSeconds
      : false;

  if (protocol && url && method && successCodes && timeOutSeconds) {
    // Get the tkoken from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    //Lookup the user by reading the token
    _data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = tokenData.phone;

        //Lookup the user data
        _data.read("users", userPhone, (err, userData) => {
          if (!err && userData) {
            const userChecks =
              typeof userData.checks == "object" &&
              userData.checks instanceof Array
                ? userData.checks
                : [];
            //Verify that the user has less than the number of max-checks-per-user
            if (userChecks.length < config.maxChecks) {
              // Create a random Id for the check
              const checkId = helpers.createRandomString(20);

              //create the check object and include the user's phone
              const checkOBJ = {
                id: checkId,
                userPhone: userPhone,
                protocol: protocol,
                url: url,
                method: method,
                successCodes: successCodes,
                timeOutSeconds: timeOutSeconds,
              };

              //Save the Obj
              _data.create("checks", checkId, checkOBJ, (err) => {
                if (!err) {
                  // Add a check id to the user's obj
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  //Save the new user data
                  _data.update("users", userPhone, userData, (err) => {
                    if (!err) {
                      // Return the data about the new check
                      callback(200, { msg: checkOBJ });
                    } else {
                      callback(500, {
                        error: "Could not update the new check",
                      });
                    }
                  });
                } else {
                  callback(500, { error: "Could not create the new check" });
                }
              });
            } else {
              callback(400, {
                error:
                  "the user already has the max amount of checks  ('+config.maxChecks+')",
              });
            }
          } else {
            callback(403);
          }
        });
      } else {
        callback(400, {
          Error: "Missing required inputs, or inputs are invalid",
        });
      }
    });
  } else {
    callback(400, { error: "Missing required input or inputs are invalid" });
  }
};

// Checks - get
//Required data - id
handlers._checks.get = (data, callback) => {
  const id =
    typeof data.queryStringOBJ.id == "string" &&
    data.queryStringOBJ.id.trim().length == 20
      ? data.queryStringOBJ.id.trim()
      : false;
  if (id) {
    _data.read("checks", id, (err, userData) => {
      if (!err && userData) {
        callback(200, userData);
      } else {
        callback(403);
      }
    });
  } else {
    callback(400);
  }
};

//Ping handler
handlers.ping = (data, callback) => {
  callback(200, { msg: "in the ping route" });
};
//not found handler
handlers.notfound = (data, callback) => {
  callback(404, { msg: "not found route" });
};

module.exports = handlers;

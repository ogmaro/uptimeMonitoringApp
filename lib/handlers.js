/**
 * Requests handlers
 */

//Dependencies
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
        const hashedpPassword = helpers.hash(password);

        if (hashedpPassword) {
          //Create user Obj
          const userOBJ = {
            firstname: firstname,
            lastname: lastname,
            phone: phone,
            password: hashedpPassword,
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
handlers._users.get = (data, callback) => {};

// User - put
handlers._users.put = (data, callback) => {};

// User - delete
handlers._users.delete = (data, callback) => {};

//Ping handler
handlers.ping = (data, callback) => {
  callback(200, { msg: "in the ping route" });
};
//not found handler
handlers.notfound = (data, callback) => {
  callback(404, { msg: "not found route" });
};

module.exports = handlers;

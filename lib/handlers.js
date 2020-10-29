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
        const hashedPassword = helpers.hash(password);

        if (hashedpPassword) {
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
    callback(404, { error: "cannot find user" });
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

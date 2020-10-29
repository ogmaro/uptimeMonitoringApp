//Dependencies
const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");
const helpers = require("./helpers");

//Constainer for the modeule to be exported
const lib = {};

//Base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

//Write data to a file
lib.create = (dir, file, data, callback) => {
  //Open the file for writing
  fs.open(lib.baseDir + dir + "/" + file + ".json", "wx", (err, fd) => {
    if (!err && fd) {
      //Convert data to string
      const stringData = JSON.stringify(data);

      //Write to file and close it
      fs.writeFile(fd, stringData, (err) => {
        if (!err) {
          fs.close(fd, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback("error cloosing file");
            }
          });
        } else {
          callback("Error writing to new file");
        }
      });
    } else {
      callback("Could not create new file, file may aready exist");
    }
  });
};

// Read data from a file
lib.read = (dir, file, callback) => {
  fs.readFile(
    lib.baseDir + dir + "/" + file + ".json",
    "utf-8",
    (err, data) => {
      if (!err && data) {
        const parsedDataa = helpers.parsejsonToObj(data);
      } else {
        callback(err, data);
      }
    }
  );
};

// Upadte data inside a file
lib.update = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(lib.baseDir + dir + "/" + file + ".json", "r+", (err, fd) => {
    if (!err && fd) {
      //Convert data to string
      const stringData = JSON.stringify(data);

      //Truncate the file
      fs.ftruncate(fd, (err) => {
        if (!err) {
          // Write to the file and close it
          fs.writeFile(fd, stringData, (err) => {
            if (!err) {
              fs.close(fd, (err) => {
                if (!err) {
                  callback(false);
                } else {
                  callback("Error closing existing file");
                }
              });
            } else {
              callback("Error writing to existing file");
            }
          });
        } else {
          callback("Error truncating file");
        }
      });
    } else {
      callback("Could not open the file for updating, it may not exist yet");
    }
  });
};

// Delete a file
lib.delete = (dir, file, callback) => {
  //unlink the file
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting file");
    }
  });
};
module.exports = lib;

/**
 *  Worker-related tasks
 *
 */

//Dependencies
const path = require("path");
const fs = require("fs");
const _data = require("./data");
const http = require("http");
const https = require("https");
const helpers = require("./handlers");
const url = require("url");

//Instatiate the worker object
const workers = {};

// Lookup all checks, get their data, send to a validator
workers.gatherAllChecks = () => {
  // Get all the checks
  _data.list("checks", (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach(
        (check = {
          //Read in the check data
        })
      );
    } else {
      console.log("Error reading on of the check's data");
    }
  });
};

//Timer to excute the worker-process once per minute
workers.loop = () => {
  const TIME_INTERVAL_TO_LOOP = 1000 * 60;
  setInterval(() => {
    workers.gatherAllChecks();
  }, TIME_INTERVAL_TO_LOOP);
};

//Init script
workers.init = () => {
  //Excute all the check immediatly
  workers.gatherAllChecks();

  //Call the loop so the checks will excute later on
  workers.loop();
};

//Export the module
module.exports = workers;

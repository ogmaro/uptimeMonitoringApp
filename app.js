/**
 * Primary file for the API
 *
 */

//Dependencies
const server = require("./lib/server");
const workers = require("./lib/workers");

// app constainer
const app = {};

// init function
app.init = () => {
  // Start the server
  server.init();

  // Start the workers
  workers.init();
};

//Excute
app.init();

module.exports = app;

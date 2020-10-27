/**
 * Create and Export configuration variables
 */

var enviroments = {};

//Staging (default) enviroment
enviroments.staging = {
  port: 3000,
  envName: "staging",
};

//Production envirooment

enviroments.production = {
  port: 5000,
  envName: "production",
};

//Determine which enviroment was passed as a a Command line argument

var currentEnviroment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

//Check that the current envrioment is one of the enviroment above, if not defaault to staging
var enviromentToExport =
  typeof enviroments[currentEnviroment] == "object"
    ? enviroments[currentEnviroment]
    : enviroments.staging;

module.exports = enviromentToExport;

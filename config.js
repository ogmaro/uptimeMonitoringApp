/**
 * Create and Export configuration variables
 */

var enviroments = {};

//Staging (default) enviroment
enviroments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  hashingSecret: "hidden",
};

//Production envirooment

enviroments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "hidden",
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

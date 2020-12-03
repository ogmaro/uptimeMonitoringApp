/**
 * Primary file for the API
 *
 */

//Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const { StringDecoder } = require("string_decoder");
const config = require("../config");
const fs = require("fs");
const handlers = require("./handlers");
const helpers = require("./helpers");
const path = require("path");

// Declare the server
const server = {};

//Create http server
server.httpServer = http.createServer((req, res) => {
  uniServer(req, res);
});

//Create https server
server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, "/../https/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "/../https/cert.pem")),
};
server.httpsServer = https.createServer(
  server.httpsServerOptions,
  (req, res) => {
    uniServer(req, res);
  }
);

//the server should respond to all request with a string
server.uniServer = (req, res) => {
  //Get the url and parse it
  const parsedURL = url.parse(req.url, true);

  //get the path
  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "").toLowerCase();

  //get HTTP method
  const method = req.method.toLowerCase();

  //get query string as an obj
  const queryStringOBJ = parsedURL.query;

  //get the headers as an obj
  const headers = req.headers;

  //Get the payload if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", (data) => {
    buffer += decoder.write(data);
  });
  req.on("end", () => {
    buffer += decoder.end();

    //Choose the handler this request should go to, if not found default to not found handler
    let choosenHandler =
      typeof server.router[trimmedPath] !== "undefined"
        ? server.router[trimmedPath]
        : server.router.notfound;

    //Construct a data obj to send to the choosen handler
    const data = {
      trimmedPath: trimmedPath,
      queryStringOBJ: queryStringOBJ,
      method: method,
      headers: headers,
      payload: helpers.parsejsonToObj(buffer),
    };
    //Route the request to the handler specified in the router
    choosenHandler(data, (statusCode, payload) => {
      //Use the statusCode called back by the handler, or default to 200
      statusCode = typeof statusCode === "number" ? statusCode : 200;

      //Use the payload called backe by the handler, or defaualt to {}
      payload = typeof payload === "object" ? payload : {};

      //Cconvert payload to string
      const payloadString = JSON.stringify(payload);

      res.setHeader("Content-type", "application/json");

      res.writeHead(statusCode);
      console.log(statusCode, " ", payloadString);
      //send response
      res.end(payloadString);
    });
  });
};
// initialize server
server.init = () => {
  //Start http server
  server.httpServer.listen(config.httpPort, () => {
    console.log(`listening on port ${config.httpPort} in ${config.envName}`);
  });
  //Start https server
  server.httpsServer.listen(config.httpsPort, () => {
    console.log(`listening on port ${config.httpsPort} in ${config.envName}`);
  });
};

// define request router
server.router = {
  ping: handlers.ping,
  notfound: handlers.notfound,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks,
};

module.exports = server;

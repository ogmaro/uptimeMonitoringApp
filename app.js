/**
 * Primary file for the API
 *
 */

const http = require("http");
const url = require("url");
const { StringDecoder } = require("string_decoder");
const config = require("./config");

//the server should respond to all request with a string
const server = http.createServer((req, res) => {
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
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : router.notfound;

    //Construct a data obj to send to the choosen handler
    const data = {
      trimmedPath: trimmedPath,
      queryStringOBJ: queryStringOBJ,
      method: method,
      headers: headers,
      payload: buffer,
    };
    //Route the request to the handler specified in the router
    choosenHandler(data, (statusCode, payload) => {
      //Use the statusCode called back by the handler, or default to 200
      statusCode = typeof statusCode === "number" ? statusCode : 200;

      //Use the payload called backe by the handler, or defaualt to {}
      payload = typeof payload === "object" ? payload : {};

      //Cconvert payload to string
      const payloadSting = JSON.stringify(payload);

      res.setHeader("Content-type", "application/json");

      res.writeHead(statusCode);
      console.log(statusCode, " ", payloadSting);
      //send response
      res.end(payloadSting);
    });
  });
});

server.listen(config.port, () => {
  console.log(`listening on port ${config.port} in ${config.envName}`);
});

//define the handlers
const handlers = {};

//Sample handler
handlers.sample = (data, callback) => {
  callback(200, { msg: "in the sample route" });
};
//not found handler
handlers.notfound = (data, callback) => {
  callback(404, { msg: "not found route" });
};
// define request router

let router = {
  sample: handlers.sample,
  notfound: handlers.notfound,
};

/**
 * Primary file for the API
 *
 */

const http = require("http");
const url = require("url");
const { StringDecoder } = require("string_decoder");

//the server should respond to all request with a string
const server = http.createServer((req, res) => {
  //Get the url and parse it
  const parsedURL = url.parse(req.url, true);

  //get the path
  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

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

    console.log(buffer);

    //send response
    res.end("welcome");
  });
});

server.listen(3000, () => {
  console.log("listening on port 3000");
});

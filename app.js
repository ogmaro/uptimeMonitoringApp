/**
 * Primary file for the API
 *
 */

const http = require("http");
const url = require("url");

//the server should respond to all request with a string
const server = http.createServer((req, res) => {
  //Get the url and parse it
  const parsedURL = url.parse(req.url, true);

  //get the path
  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  console.log(trimmedPath);

  //send response
  res.end("welcome");
});

server.listen(3000, () => {
  console.log("listening on port 3000");
});

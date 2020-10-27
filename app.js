/**
 * Primary file for the API
 *
 */

const http = require("http");

//the server should respond to all request with a string
const server = http.createServer((req, res) => {
  res.end("Hello World");
});

server.listen(3000, () => {
  console.log("listening on port 3000");
});

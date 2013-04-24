var Throttle = require("throttle");
var http = require('http');
var url = require('url');

/**
 * Incoming connection handler
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {Throttle} throttle
 */
function connectionHandler(request, response, throttle) {

  var options = url.parse(request.url);
  options.method = request.method;
  options.headers = request.headers;

  var proxyRequest = http.request(options);

  proxyRequest.on('response', function (proxyResponse) {
    response.setHeader('via', 'throttle-proxy');
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    proxyResponse.pipe(throttle).pipe(response);
  });

  proxyRequest.on('error', function (err) {
    response.writeHead(500);
    response.end();
  });

  request.pipe(proxyRequest);

}

/**
 * Server factory
 * @param {Number} speed
 * @type {Function}
 */
module.exports = exports = function (speed) {
  return http.createServer(function (request, response) {
    connectionHandler(request, response, new Throttle(speed));
  });
};

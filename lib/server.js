var Throttle = require("throttle");
var http = require('http');
var url = require('url');

/**
 * Incoming connection handler
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {Throttle} throttle
 * @param {String} match
 */
function connectionHandler(request, response, throttle, match) {

  var options = url.parse(request.url);
  options.method = request.method;
  options.headers = request.headers;
  var throttleEnabled = !match || (new RegExp(match)).exec(request.url);

  var proxyRequest = http.request(options);

  proxyRequest.on('response', function (proxyResponse) {
    response.setHeader('via', 'throttle-proxy');
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    if (throttleEnabled) {
      proxyResponse.pipe(throttle).pipe(response);
    } else {
      proxyResponse.pipe(response);
    }
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
 * @param {String} match
 * @type {Function}
 */
module.exports = exports = function (speed, match) {
  return http.createServer(function (request, response) {
    connectionHandler(request, response, new Throttle(speed), match);
  });
};

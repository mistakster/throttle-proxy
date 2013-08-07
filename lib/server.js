var Throttle = require('throttle');
var http = require('http');
var url = require('url');

function processWildcards(match) {
  var patternString = match
    // Escape existing RegEx characters
    .replace(/\\/g, '\\\\')
    .replace(/\//g, '\\/')
    .replace(/\^/g, '\\^')
    .replace(/\$/g, '\\$')
    .replace(/\+/g, '\\+')
    .replace(/\./g, '\\.')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\=/g, '\\=')
    .replace(/\!/g, '\\!')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\,/g, '\\,')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\-/g, '\\-')
    // Convert wildcard chars to RegEx sequences
    .replace(/\?/g, '.')
    .replace(/\*/g, '.*');
  return new RegExp('^.*' + patternString + '$');
}

/**
 * Incoming connection handler
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {Throttle} throttle
 * @param {RegExp|Boolean} pattern
 */
function connectionHandler(request, response, throttle, pattern) {

  var options = url.parse(request.url);
  options.method = request.method;
  options.headers = request.headers;

  var proxyRequest = http.request(options);

  proxyRequest.on('response', function (proxyResponse) {
    var throttleEnabled = pattern && pattern.test(request.url);
    if (throttleEnabled) {
      response.setHeader('throttle-proxy', 'skipped');
    }
    response.setHeader('via', 'throttle-proxy');
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    if (throttleEnabled) {
      proxyResponse.pipe(throttle).pipe(response);
    } else {
      proxyResponse.pipe(response);
    }
  });

  proxyRequest.on('error', function (err) {
    // response.writeHead(500);
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
  var pattern = match && processWildcards(match);
  return http.createServer(function (request, response) {
    connectionHandler(request, response, new Throttle(speed), pattern);
  });
};

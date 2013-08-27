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
  return new RegExp('^' + patternString + '$');
}

/**
 * Incoming connection handler
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {Function} throttleFactory
 * @param {Function} matcher callback for filtering request through trottle
 */
function connectionHandler(request, response, throttleFactory, matcher) {

  var options = url.parse(request.url);
  options.method = request.method;
  options.headers = request.headers;

  var proxyRequest = http.request(options);

  proxyRequest.on('response', function (proxyResponse) {
    var throttleEnabled = matcher ? matcher(request.url) : true;
    response.setHeader('x-throttle-proxy', throttleEnabled ? 'throttled' : 'skipped');
    response.setHeader('via', 'throttle-proxy');
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    if (throttleEnabled) {
      proxyResponse.pipe(throttleFactory()).pipe(response);
    } else {
      proxyResponse.pipe(response);
    }
  });

  proxyRequest.on('error', function (err) {
    // response.writeHead(500);
    response.end();
  });

  request.pipe(throttleFactory()).pipe(proxyRequest);

}

/**
 * Server factory
 * @param {Number} speed
 * @param {String} [pattern]
 * @param {Boolean} [skip]
 * @type {Function}
 */
module.exports = exports = function (speed, pattern, skip) {
  var matcher = (function () {
    if (!pattern) {
      return false;
    }
    var rx = processWildcards(pattern);
    return function (url) {
      var val = rx.test(url);
      return skip ? !val : val;
    };
  }());
  return http.createServer(function (request, response) {
    connectionHandler(
			request, response,
			function () {
				return new Throttle(speed);
			},
			matcher);
  });
};

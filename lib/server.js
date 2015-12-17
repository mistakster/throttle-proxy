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
 * @param {Throttle} throttle for incoming data
 * @param {Throttle} outgoing for outgoing data
 * @param {Function} matcher callback for filtering request through throttle
 */
function connectionHandler(request, response, throttle, outgoing, matcher) {

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
      proxyResponse.pipe(throttle).pipe(response);
    } else {
      proxyResponse.pipe(response);
    }
  });

  proxyRequest.on('error', function (err) {
    // response.writeHead(500);
    response.end();
  });

  if (outgoing) {
    request.pipe(outgoing).pipe(proxyRequest);
  } else {
    request.pipe(proxyRequest);
  }

}

/**
 * Server factory
 * @param {Number} speed
 * @param {Number} [outgoing]
 * @param {String} [pattern]
 * @param {Boolean} [skip]
 * @param {Number} [delay]
 * @type {Function}
 */
module.exports = exports = function (speed, outgoing, pattern, skip, delay) {
  var connections = 0;
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
    connections += 1;
    response.once('finish', function () {
      connections -= 1;
    });
    setTimeout(function () {
      connectionHandler(
        request, response,
        new Throttle(connections > 0 ? speed / connections : speed),
        outgoing ? new Throttle(connections > 0 ? outgoing / connections : outgoing) : null,
        matcher);
    }, delay || 0);
  });
};

var Throttle = require("throttle");
var http = require('http');
var url = require('url');

var server = http.createServer(function(request, response) {

  var options = url.parse(request.url);
  options.method = request.method;
  options.headers = request.headers;

  var proxyRequest = http.request(options);

  proxyRequest.on('response', function (proxyResponse) {
    var throttle = new Throttle(config.speed);
    response.setHeader("via", "throttle-proxy");
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    proxyResponse.pipe(throttle).pipe(response);
  });

  proxyRequest.on('error', function (err) {
    response.writeHead(500);
    response.end();
  });

  request.pipe(proxyRequest);

});

module.exports = exports = server;

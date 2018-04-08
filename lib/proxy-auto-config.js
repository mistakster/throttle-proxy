const debug = require('debug')('throttle-proxy:pac');
const http = require('http');
const url = require('url');

function getBody(host, port) {
  return `function FindProxyForURL(url, host)
{
  return "SOCKS ${host}:${port}";
}
`;
}

function sendOkay(req, res, port) {
  debug('sending pac file');

  const parsedUrl = url.parse(`http://${req.headers.host}`);
  const body = getBody(parsedUrl.hostname, port);

  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'application/x-ns-proxy-autoconfig'
  });
  res.end(body);
}

function sendError(req, res) {
  debug('sending error');

  const body = 'Not found\n';

  res.writeHead(404, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/plain'
  });
  res.end(body);
}

module.exports = options => {
  const server = http.createServer((req, res) => {
    const url = req.url;

    if (url === '/' || url === '/wpad.dat' || url === '/proxy.pac') {
      return sendOkay(req, res, options.port);
    }

    sendError(req, res);
  });

  server
    .on('error', err => {
      debug(err.code);
    })
    .on('listening', () => {
      debug('ready');
    });

  server.listen(options.pacPort);
};

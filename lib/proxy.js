const debug = require('debug')('throttle-proxy:server');
const createProxyServer = require('./proxy/server');

const proxy = createProxyServer();

proxy
  .on('error', err => {
    debug('error', err.code);
    process.exit(1);
  })
  .on('connection', () => {
    debug('connection');
  })
  .on('listening', () => {
    debug('ready');
  })
  .listen(51080);

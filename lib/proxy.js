const debug = require('debug')('throttle-proxy:server');
const createProxyServer = require('./proxy/server');

/**
 *
 * @param {Object} options
 * @param {Number} options.port
 * @param {Number} options.incomingSpeed in bytes per second
 * @param {Number} options.outgoingSpeed in bytes per second
 * @param {Number} options.delay in ms
 * @return {net.Server}
 */
module.exports = options => {
  debug(options);

  const proxy = createProxyServer(options);

  return proxy
    .on('error', err => {
      debug('error', err.code);

      setTimeout(() => {
        debug('restarting...');
        proxy.close();
        proxy.listen(options.port);
      }, 1000);
    })
    .on('connection', () => {
      debug('connection');
    })
    .on('listening', () => {
      debug('ready');
    })
    .listen(options.port);
};

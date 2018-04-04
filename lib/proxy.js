const debug = require('debug')('throttle-proxy:server');
const createProxyServer = require('./proxy/server');

const DEFAULTS = {
  port: 1080,
  incomingSpeed: 100000,
  outgoingSpeed: 100000,
  delay: 0
};

/**
 *
 * @param {Object} options
 * @param {Number} [options.port]
 * @param {Number} [options.incomingSpeed] in bytes per second
 * @param {Number} [options.outgoingSpeed] in bytes per second
 * @param {Number} [options.delay] in ms
 */
module.exports = options => {
  options = Object.assign({}, options || {}, DEFAULTS);

  debug(options);

  const proxy = createProxyServer(options);

  proxy
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

module.exports();

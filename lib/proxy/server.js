const debug = require('debug')('throttle-proxy:server');
const net = require('net');
const socks = require('socks-handler');
const handlerFactory = require('./handler');

/**
 *
 * @param {Object} options
 * @param {Number} options.port
 * @param {Number} options.incomingSpeed in bytes per second
 * @param {Number} options.outgoingSpeed in bytes per second
 * @param {Number} options.delay in ms
 */
module.exports = options => {
  const handler = handlerFactory(options);

  return net.createServer(clientConnection => {
    clientConnection
      .on('error', err => {
        debug(err.code);
      });

    setTimeout(() => {
      socks.handle(clientConnection, (err, stream) => {
        if (err) {
          debug(err);
          return;
        }

        stream
          .on('error', err => {
            debug(err);
          })
          .on('request', handler(clientConnection));
      });
    }, options.delay || 0);
  });
};

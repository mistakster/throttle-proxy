const debug = require('debug')('throttle-proxy:server');
const net = require('net');
const socks = require('socks-handler');
const createHandler = require('./handler');

module.exports = () => (
  net.createServer(clientConnection => {
    clientConnection
      .on('error', err => {
        debug(err.code);
      });

    socks.handle(clientConnection, (err, stream) => {
      if (err) {
        debug(err);
        return;
      }

      stream
        .on('error', err => {
          debug(err);
        })
        .on('request', createHandler(clientConnection));
    });
  })
);

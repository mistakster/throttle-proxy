const net = require('net');

class UpstreamError extends Error {
  constructor(code) {
    super('Upstream Error');

    this.code = code;
  }
}

/**
 * Create a socket with defined connection timeout
 * @param {Object} options
 * @param {String} options.host
 * @param {Number} options.port
 * @param {Number} options.timeout
 * @return {net.Socket}
 */
module.exports = options => {
  const {host, port, timeout} = options;

  if (!host || !port || !timeout) {
    throw new Error('Required parameter is missing');
  }

  const upstream = net.createConnection(port, host);
  const timeoutId = setTimeout(() => {
    upstream.destroy(new UpstreamError('UPSTREAM_TIMEOUT'));
  }, timeout);

  upstream
    .on('connect', () => {
      clearTimeout(timeoutId);
    })
    .on('error', () => {
      clearTimeout(timeoutId);
    });

  return upstream;
};

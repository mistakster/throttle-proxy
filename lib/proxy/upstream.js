const net = require('net');

class UpstreamError extends Error {
  constructor(code) {
    super('Upstream Error');

    this.code = code;
  }
}

module.exports = (port, host) => {
  const upstream = net.createConnection(port, host);
  const timeout = setTimeout(() => {
    upstream
      .destroy(new UpstreamError('UPSTREAM_TIMEOUT'));
  }, 3000);

  upstream
    .on('connect', () => {
      clearTimeout(timeout);
    })
    .on('error', () => {
      clearTimeout(timeout);
    });

  return upstream;
};

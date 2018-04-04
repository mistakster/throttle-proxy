const debug = require('debug')('throttle-proxy:handler');
const socks = require('socks-handler');
const net = require('net');
const ChunkSizeLogger = require('./chunk-size-logger');
const Channel = require('./throttle');
const createUpstream = require('./upstream');

function replyStatusError(version, err) {
  if (version === 5) {
    switch (err.code) {
      case 'EHOSTUNREACH':
        return socks[5].REQUEST_STATUS.HOST_UNREACHABLE;
      case 'ECONNREFUSED':
        return socks[5].REQUEST_STATUS.CONNECTION_REFUSED;
      case 'ENETUNREACH':
        return socks[5].REQUEST_STATUS.NETWORK_UNREACHABLE;
      default:
        return socks[5].REQUEST_STATUS.SERVER_FAILURE;
    }
  }

  return socks[4].REQUEST_STATUS.FAILED;
}

function replyStatusUnsupported(version) {
  return version === 5
    ? socks[5].REQUEST_STATUS.COMMAND_NOT_SUPPORTED
    : socks[4].REQUEST_STATUS.REFUSED;

}

function replyStatusSuccess(version) {
  return version === 5
    ? socks[5].REQUEST_STATUS.SUCCESS
    : socks[4].REQUEST_STATUS.GRANTED;
}

function createVersionedReply(version) {
  return callback => (fn, data) => {
    const statuses = socks[version].REQUEST_STATUS;
    const statusCode = fn(version, data);
    const statusText = Object.keys(statuses).find(k => statuses[k] === statusCode);

    debug(`sending status ${statusText}`);

    callback(statusCode);
  }
}

const BPS = 4000;
const inputChannel = new Channel(BPS);
const outputChannel = new Channel(BPS);

module.exports = clientConnection => (
  (arg, callback) => {
    const {version, command, host, port} = arg;
    const doReply = createVersionedReply(version)(callback);

    // only "CONNECT" command is supported
    if (command !== socks[5].COMMAND.CONNECT) {
      debug(`unknown command "${command}"`);

      return doReply(replyStatusUnsupported);
    }

    debug(`version: ${version}`);
    debug(`connect to ${host}:${port}`);

    const upstream = createUpstream({host, port, timeout: 3000});
    const inputThrottle = inputChannel.createThrottle();
    const outputThrottle = outputChannel.createThrottle();
    const logger = new ChunkSizeLogger();

    clientConnection
      .pipe(inputThrottle)
      .pipe(upstream)
      .pipe(outputThrottle)
//      .pipe(logger)
      .pipe(clientConnection);

    function onConnectError(err) {
      debug(`error ${err.code}, ${host}:${port}`);

      doReply(replyStatusError, err);
    }

    upstream
      .on('close', () => {
        debug('close');
      })
      .on('error', onConnectError)
      .on('connect', socket => {
        debug('connection established');

        upstream.removeListener('error', onConnectError);

        return doReply(replyStatusSuccess);
      });
  }
);

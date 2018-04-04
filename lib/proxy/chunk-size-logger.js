const debug = require('debug')('throttle-proxy:chunk');
const {Transform} = require('stream');

class ChunkSizeLogger extends Transform {
  _transform(chunk, encoding, callback) {
    debug(`passing through ${chunk.length} bytes`);
    callback(null, chunk);
  }
}

module.exports = ChunkSizeLogger;

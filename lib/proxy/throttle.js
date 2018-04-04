const debug = require('debug')('throttle-proxy:throttle');
const {Transform} = require('stream');
const Parser = require('stream-parser');

let totalBytes, startTime;

function reset() {
  totalBytes = 0;
  startTime = Date.now();
}

class Throttle extends Transform {
  constructor(bps) {
    super();

    this.bps = bps;
    this.chunkSize = Math.max(1, Math.round(bps / 10));

    reset();

    this._processNextChunk();
  }

  _processNextChunk() {
    this._passthrough(this.chunkSize, this._sendNextChunk);
    totalBytes += this.chunkSize;
  };

  _sendNextChunk(output, done) {
    const totalSeconds = (Date.now() - startTime) / 1000;
    const expected = totalSeconds * this.bps;
    const remainder = totalBytes - expected;
    const sleepTime = Math.max(0, remainder / this.bps * 1000);

    setTimeout(() => {
      this._processNextChunk();
      done();
    }, sleepTime);

    if (totalSeconds > 1) {
      debug(`piped ${totalBytes} bytes in ${totalSeconds.toFixed(1)} seconds`);
      reset();
    }
  }
}

Parser(Throttle.prototype);

module.exports = Throttle;

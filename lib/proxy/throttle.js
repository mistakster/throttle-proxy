const debug = require('debug')('throttle-proxy:throttle');
const {Transform} = require('stream');
const Parser = require('stream-parser');

class Throttle extends Transform {
  constructor(channel) {
    super();

    this.channel = channel;
    this.chunkSize = Math.max(1, Math.round(this.channel.bps / 10));

    this._processNextChunk();
  }

  _processNextChunk() {
    this._passthrough(this.chunkSize, this._sendNextChunk);
    this.channel.totalBytes += this.chunkSize;
  };

  _sendNextChunk(output, done) {
    this.channel.sleep(() => {
      this._processNextChunk();
      done();
    });
  }
}

Parser(Throttle.prototype);

class Channel {
  constructor(bps) {
    this.bps = bps;
    this.reset();
    this.schedule();
  }

  reset() {
    this.totalBytes = 0;
    this.startTime = Date.now();
  }

  schedule() {
    setTimeout(() => {
      // debug(`piped ${this.totalBytes} bytes`);
      this.reset();
      this.schedule();
    }, 1000);
  }

  sleep(done) {
    const totalSeconds = (Date.now() - this.startTime) / 1000;
    const expected = totalSeconds * this.bps;
    const remainder = this.totalBytes - expected;
    const sleepTime = Math.max(0, remainder / this.bps * 1000);

    // debug(`sleep for ${sleepTime}ms`);

    setTimeout(done, sleepTime);
  }

  createThrottle() {
    return new Throttle(this);
  }
}

module.exports = Channel;

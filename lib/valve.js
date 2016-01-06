var async = require('async');
var Throttle = require('./throttle');

var DEBUG = false;

function Valve(bps, name) {
	this._name = name;
	this._bps = bps;
	this._id = 0;
	this._resetStats();
	this._queue = async.queue(this._worker.bind(this), 1);
}

Valve.prototype.link = function (readable, writable) {
	var proxy = this.createStream();

	function cleanUp() {
		readable.removeListener('error', handleError);
		writable.removeListener('error', handleError);
		proxy.removeListener('finish', cleanUp);
	}

	function handleError(e) {
		readable.unpipe(proxy);
		proxy.unpipe(writable);

		if (readable.destroy) {
			readable.destroy();
		}
		if (writable.destroy) {
			writable.destroy();
		}

		cleanUp();
	}

	readable.addListener('error', handleError);
	writable.addListener('error', handleError);
	proxy.addListener('finish', cleanUp);

	readable.pipe(proxy).pipe(writable);
};

Valve.prototype.createStream = function () {
	var stream;

	stream = new Throttle(this._sync.bind(this));
	stream._id = this._id++;

	if (DEBUG) {
		console.log('connection #%d to "%s"', stream._id, this._name);
	}

	return stream;
};

Valve.prototype._sync = function (bytesSent, callback) {
	this._queue.push(bytesSent, callback);
};

Valve.prototype._worker = function (bytesSent, callback) {
	var sleepTime;
	var diff = process.hrtime(this._startTime);
	var totalSeconds = diff[0] + diff[1] * 1e-9;
	var expected = totalSeconds * this._bps;

	this._totalBytes += bytesSent;

	if (totalSeconds > 1) {
		this._resetStats();
	}

	if (DEBUG) {
		console.info('sent through "%s": %d, expected: %d', this._name, this._totalBytes, expected);
	}

	if (this._totalBytes > expected) {
		sleepTime = 1000 * (this._totalBytes - expected) / this._bps;
		if (DEBUG) {
			console.info('sleep time: %d', sleepTime);
		}
		setTimeout(function () {
			this._resetStats();
			callback();
		}.bind(this), sleepTime);
	} else {
		callback();
	}
};

Valve.prototype._resetStats = function () {
	this._totalBytes = 0;
	this._startTime = process.hrtime();
};

module.exports = Valve;

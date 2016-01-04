var Transform = require('stream').Transform;
var util = require('util');

function Throttle(sync) {
	Transform.call(this);
	this._sync = sync;
}

util.inherits(Throttle, Transform);

Throttle.prototype._transform = function (chunk, encoding, callback) {
	var loop = (function (startPos) {
		var endPos;

		if (startPos >= chunk.length) {
			callback();
			return;
		}

		endPos = Math.min(startPos + 1000, chunk.length);

		this.push(chunk.slice(startPos, endPos));
		this._sync(endPos - startPos, function () {
			loop(endPos);
		});
	}).bind(this);

	loop(0);
};

module.exports = Throttle;

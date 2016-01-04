var createProxy = require('./proxy');

module.exports = exports = function () {

	var argv = require('optimist')
		.usage('Throttle HTTP proxy server')
		.describe('port', 'incoming port number')
		.default('port', 3128)
		.alias('port', 'p')
		.describe('speed', 'throttle incoming data speed to value')
		.default('speed', 100000)
		.alias('speed', 's')
		.describe('outgoing', 'throttle outgoing data speed to value')
		.describe('delay', 'delay response by time in ms')
		.alias('delay', 'd')
		.default('delay', 0)
		.check(function (config) {

			function checkString(val) {
				if (typeof val == "boolean" && val) {
					return true;
				} else if (typeof val == "undefined" || (typeof val == "boolean" && !val)) {
					return false;
				} else {
					return !(typeof val == "string" && val.length > 0);
				}
			}

			config.port = parseInt(config.port);
			if (isNaN(config.port)) {
				throw new Error("port must be a number");
			}
			config.speed = parseInt(config.speed);
			if (isNaN(config.speed) || config.speed < 1) {
				throw new Error("speed must be a number");
			}
			config.delay = parseInt(config.delay);
			if (isNaN(config.delay) || config.delay < 0) {
				throw new Error('delay must be a number');
			}
			config.outgoing = config.outgoing && config.outgoing !== true ? parseInt(config.outgoing) : null;
			if (config.outgoing && (isNaN(config.outgoing) || config.outgoing < 1)) {
				throw new Error("outgoing speed must be a number");
			}

			return true;
		});

	var config = argv.argv;

	var proxy = createProxy(config.speed, config.outgoing || config.speed, config.delay);

	proxy.addListener('listening', function () {
		console.log("Proxy server started on port %d", config.port);
		console.log("Incoming network speed is limited to %d bytes per second", config.speed);
		if (config.outgoing) {
			console.log("Outgoing network speed is limited to %d bytes per second", config.outgoing);
		}
		if (config.delay > 0) {
			console.log("Artificial delay %d ms", config.delay);
		}
	});

	proxy.listen({
		host: '127.0.0.1',
		port: config.port
	});
};

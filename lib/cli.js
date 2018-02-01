var url = require('url');
var proxy = require('./server.js');

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
		.describe('match', 'throttle requests matching')
		.describe('skip', 'bypass throttling requests matching')
		.string(['match', 'skip'])
		.describe('delay', 'delay response by time in ms')
		.alias('delay', 'd')
		.default('delay', 0)
		.describe('proxy', 'use the specified external proxy')
		.boolean('help')
		.alias('help', '?')
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
			if (config.match && config.skip) {
				throw new Error("simultaneous use of --match and --skip is not allowed");
			}
			if (checkString(config.match)) {
				throw new Error("wrong --match pattern");
			}
			if (checkString(config.skip)) {
				throw new Error("wrong --skip pattern");
			}
			if (config.proxy) {
				try {
					url.parse(config.proxy);
				} catch (ex) {
					throw new Error("malformed --proxy");
				}
			}

			return true;
		});

	var config = argv.argv;

	if (config.help) {
		argv.showHelp();
		process.exit(0);
	}

	var pattern = config.match ? config.match : config.skip;
	var skip = !!config.skip;

	proxy(config.speed, config.outgoing, pattern, skip, config.delay, config.proxy)
		.listen(config.port, function () {
			console.log("Proxy server started on port %d", config.port);
			console.log("Incoming network speed is limited to %d bytes per second", config.speed);
			if (config.outgoing) {
				console.log("Outgoing network speed is limited to %d bytes per second", config.outgoing);
			}
			if (pattern) {
				console.log("%s %s", skip ? "Skipping" : "Matching", pattern);
			} else {
				console.log("For any request");
			}
			if (config.delay > 0) {
				console.log("Artificial delay %d ms", config.delay);
			}
			if (config.proxy) {
				console.log("Use proxy %s", config.proxy)
			}
		});

};

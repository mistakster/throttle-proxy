var net = require('net');
var dns = require('dns');
var socks = require('socksv5');
var Valve = require('./valve');

function createProxy(incomingSpeed, outgoingSpeed, delay) {
	var incomingValve = new Valve(incomingSpeed, 'in');
	var outgoingValve = new Valve(outgoingSpeed, 'out');

	var proxy = socks.createServer(function (info, accept, deny) {
		setTimeout(function () {
			var connect = new net.Socket();

			function preConnectErrorHandler(e) {
				cleanUp(connect);
				deny();
			}

			function connectHandler() {
				var socket = accept(true);

				cleanUp(connect);

				incomingValve.link(connect, socket);
				outgoingValve.link(socket, connect);
			}

			function cleanUp(connect) {
				connect.removeListener('error', preConnectErrorHandler);
				connect.removeListener('error', connectHandler);
			}

			connect.addListener('error', preConnectErrorHandler);
			connect.addListener('connect', connectHandler);

			dns.lookup(info.dstAddr, function (err, host) {
				if (err) {
					connect.emit('error', err);
					return;
				}
				connect.connect({
					port: info.dstPort,
					host: host
				});
			});
		}, delay);
	});

	proxy.useAuth(socks.auth.None());

	return proxy;
}

module.exports = createProxy;

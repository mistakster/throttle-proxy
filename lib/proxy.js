var net = require('net');
var socks = require('socks-handler');
var Valve = require('./valve');

function log(streamName, stream) {
	var e = stream.emit;
	stream.emit = function (name) {
		console.log(streamName, name);
		return e.apply(this, arguments);
	}
}


function Proxy(incomingSpeed, outgoingSpeed, delay) {
	this._incomingValve = new Valve(incomingSpeed, 'in');
	this._outgoingValve = new Valve(outgoingSpeed, 'out');
	this._delay = delay;
}

Proxy.prototype.requestHandler = function (clientConnection, info, callback) {
	var serverConnection;
	var version = info.version;
	var command = info.command;

	if (command !== socks[5].COMMAND.CONNECT) {
		if (version === 5) {
			callback(socks[5].REQUEST_STATUS.COMMAND_NOT_SUPPORTED);
		} else {
			callback(socks[4].REQUEST_STATUS.REFUSED);
		}
		return;
	}

	serverConnection = net.createConnection(info.port, info.host);

	function onConnectError(err) {
		var status;
		if (version === 5) {
			status = (function () {
				switch (err.code) {
					case 'ENOTFOUND':
					case 'EHOSTUNREACH':
						return socks[5].REQUEST_STATUS.HOST_UNREACHABLE;
					case 'ECONNREFUSED':
						return socks[5].REQUEST_STATUS.CONNECTION_REFUSED;
					case 'ENETUNREACH':
						return socks[5].REQUEST_STATUS.NETWORK_UNREACHABLE;
					default:
						return socks[5].REQUEST_STATUS.SERVER_FAILURE;
				}
			})();
		} else {
			status = socks[4].REQUEST_STATUS.FAILED;
		}
		callback(status);
	}

	function onConnect() {
		serverConnection.removeListener('error', onConnectError);
		callback(version === 5 ? socks[5].REQUEST_STATUS.SUCCESS : socks[4].REQUEST_STATUS.GRANTED);
	}

	serverConnection
		.on('error', onConnectError)
		.on('connect', onConnect);

	this._incomingValve.link(clientConnection, serverConnection);
	this._outgoingValve.link(serverConnection, clientConnection);
};

function createProxy(incomingSpeed, outgoingSpeed, delay) {
	var proxy = new Proxy(incomingSpeed, outgoingSpeed, delay);

	return net.createServer(function (clientConnection) {

		clientConnection.once('error', function (err) {
			// suppress early client connection errors
			// console.error('client connection', err);
		});

		socks.handle(clientConnection, function (err, handler) {
			if (err) {
				return;
			}
			handler.on('request', function (info, callback) {
				proxy.requestHandler(clientConnection, info, callback);
			});
		});
	});
}

module.exports = createProxy;

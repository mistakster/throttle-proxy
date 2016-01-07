var net = require('net');
var socks = require('socks-handler');
var Valve = require('./valve');

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

	var onConnect = function () {
		serverConnection.removeListener('error', onConnectError);
		callback(version === 5 ? socks[5].REQUEST_STATUS.SUCCESS : socks[4].REQUEST_STATUS.GRANTED);

		setTimeout(function () {
			this._outgoingValve.link(clientConnection, serverConnection);
			this._incomingValve.link(serverConnection, clientConnection);
		}.bind(this), this._delay);
	}.bind(this);

	serverConnection
		.on('error', onConnectError)
		.on('connect', onConnect);
};

function createProxy(incomingSpeed, outgoingSpeed, delay) {
	var proxy = new Proxy(incomingSpeed, outgoingSpeed, delay);

	return net.createServer(function (clientConnection) {

		clientConnection.once('error', function (err) {
			// suppress early client connection errors
			// console.error('client connection', err);
		});

		socks.handle(clientConnection, function (err, handler) {
			if (!err) {
				handler.on('request', function (info, callback) {
					proxy.requestHandler(clientConnection, info, callback);
				});
			}
		});
	});
}

exports.createProxy = createProxy;

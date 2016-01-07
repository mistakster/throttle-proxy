# Throttle SOCKS proxy server

Sometimes in development environment you need to reduce network bandwidth.
The simplest way is setup SOCKS proxy server and use it as default proxy in OS.

## Install

Install proxy server as npm package

    npm install -g throttle-proxy

## Start

To start proxy server with default configuration use

    throttle-proxy

Proxy server can be used as regular Node.js module

    var throttle = require('throttle-proxy');
    throttle.createProxy(speed).listen(port);

## Options

You can change throttle speed, port number.

    throttle-proxy --speed 50000 --port 9999

Also you can use aliases `-s`, `-p` instead of full words.

When you are testing file upload the throttling outgoing data stream can be helpful to you.

	throttle-proxy --outgoing 50000

You may add artificial delay in ms to all responses.

    throttle-proxy --delay 2000

### Defaults

 * port: 3128
 * incoming speed: 100000 bps
 * outgoing speed: 100000 bps
 * no delay

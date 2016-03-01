# Throttle HTTP proxy server

Sometimes in development environment you need to reduce network bandwidth.
The simplest way is setup HTTP proxy server and use it as default proxy in OS.

## Install

Install proxy server as npm package

    npm install -g throttle-proxy

## Start

To start proxy server with default configuration use

    throttle-proxy

Proxy server can be used as regular Node.js module

    var proxy = require('throttle-proxy');
    proxy(speed).listen(port);

## Options

The `--port` (or `-p` alias) option will change from the default port:

    throttle-proxy --port 8080

The default incoming speed throttle is 100000 bytes per second. You can change this using the `--speed` (or `-s` alias) option: 

    throttle-proxy --speed 50000

Outgoing data is not limited by default. When testing outgoing traffic such as file uploads, the throttling outgoing data stream limited using the `--outgoing` option (again in bytes per second):

	throttle-proxy --outgoing 50000

Artificial delay (in ms) can be added to all responses with the `--delay` option:

    throttle-proxy --delay 2000

Specifying a URL matching string using the `--match` option allows you to simulate latency only for specific assets, for example:

    throttle-proxy --match */app.js

Or only specific assets can be excluded from throttling using the `--skip` option:

    throttle-proxy --skip *.css

For `--match` and `--skip` the characters `*` and `?` have special meaning in matching pattern.
`*` = matches up with any combination of characters.
`?` = matches up with any single character

### Defaults

 * port: 3128
 * incoming speed: 100000
 * outgoing speed: unlimited
 * throttle all requests
 * no delay

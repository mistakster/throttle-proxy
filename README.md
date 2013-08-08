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

You can change throttle speed, port number.

    throttle-proxy --speed 50000 --port 9999

Also you can use aliases `-s`, `-p` instead of full words.

Specifying a URL matching string allows you to simulate latency for specific assets.

    throttle-proxy --match */app.js

Or you can exclude assets from throttling.

    throttle-proxy --skip *.css

Characters `*` and `?` has special meaning in matching pattern.
`*` = matches up with any combination of characters.
`?` = matches up with any single character

### Defaults

 * speed: 100000
 * port: 3128
 * throttle all requests
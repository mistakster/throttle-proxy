# Throttle HTTP proxy server

Sometimes in development environment you need to reduce network bandwidth.
The simplest way is setup HTTP proxy server and use it as default proxy in OS.

## Install

Install proxy server as npm package

    npm install -g throttle-proxy

## Start

To start proxy server with default configuration use

    throttle-proxy

Proxy server can be used as regular NodeJS module

    var proxy = require('throttle-proxy');
    proxy(speed).listen(port);

## Options

You can change throttle speed, port number, and URL matching string.

    throttle-proxy --speed 50000 --port 9999 --match app.js

Also you can use aliases `-s`, `-p`, and `-m` instead of full words.

Specifiying a URL matching string allows you to simulate latency for specific assets. The URL matching string is interpreted as a RegExp.

### Defaults

 * speed: 100000
 * port: 3128
 * match: false (match all request urls)
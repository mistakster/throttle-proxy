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

You can change throttle speed and port number

    throttle-proxy --speed 50000 --port 9999

Also you can use aliases `-s` and `-p` instead of full words.

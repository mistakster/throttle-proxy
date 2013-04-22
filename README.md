# Throttle HTTP proxy server

Sometimes in development environment you need to reduce network bandwidth.
The simplest way is setup HTTP proxy server and use it as default proxy in OS.

## Install

Install proxy server as npm package

    npm install throttle-proxy

## Start

To start proxy server with default configuration use

    npm start

or

    node lib/server.js

## Options

You can change throttle speed and port number

    node lib/server.js --speed 50000 --port 9999

Also you can use aliases `-s` and `-p` instead of full words.

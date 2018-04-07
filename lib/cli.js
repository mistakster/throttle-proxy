const debug = require('debug')('throttle-proxy:cli');
const program = require('commander');
const proxy = require('./proxy');
const proxyAutoConfig = require('./proxy-auto-config');
const packageInfo = require('../package.json');

const DEFAULT_PORT = 1080;
const DEFAULT_PAC_PORT = 3128;
const DEFAULT_INCOMING_SPEED = 100000;
const DEFAULT_OUTGOING_SPEED = 100000;
const DEFAULT_DELAY = 0;

function parser(str, defaultValue) {
  const value = parseInt(str, 10);

  return isNaN(value) ? defaultValue : value;
}

program
  .option(
    '-p, --port <n>',
    'incoming port number',
    parser,
    DEFAULT_PORT
  )
  .option(
    '-s, --incoming-speed <n>',
    'max incoming speed (bps)',
    parser,
    DEFAULT_INCOMING_SPEED
  )
  .option(
    '    --outgoing-speed <n>',
    'max outgoing speed (bps)',
    parser,
    DEFAULT_OUTGOING_SPEED
  )
  .option(
    '-d, --delay <n>',
    'delay response by time (ms)',
    parser,
    DEFAULT_DELAY
  )
  .option(
    '    --pac-port <n>',
    'start proxy auto-config server on the port',
    parser,
    DEFAULT_PAC_PORT
  )
  .version(packageInfo.version)
  .parse(process.argv);

proxy({
  port: program.port,
  incomingSpeed: program.incomingSpeed,
  outgoingSpeed: program.outgoingSpeed,
  delay: program.delay
});

if (program.pacPort) {
  proxyAutoConfig({
    port: program.port,
    pacPort: program.pacPort
  });
}

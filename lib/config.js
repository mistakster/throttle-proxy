var argv = require('optimist')
  .usage('Throttle HTTP proxy server')
  .describe('speed', 'throttle network speed to value')
  .default('speed', 100000)
  .alias('speed', 's')
  .describe('port', 'incoming port number')
  .default('port', 3128)
  .alias('port', 'p');

var config = argv.argv;

if (isNaN(parseInt(config.speed)) || isNaN(parseInt(config.port))) {
  console.log(argv.help());
  process.exit(1);
}

module.exports = exports = config;

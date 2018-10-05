const args = require('./args');
const proxy = require('./proxy');
const proxyAutoConfig = require('./proxy-auto-config');

proxy({
  port: args.port,
  incomingSpeed: args.incomingSpeed,
  outgoingSpeed: args.outgoingSpeed,
  delay: args.delay
});

if (args.pacPort) {
  proxyAutoConfig({
    port: args.port,
    pacPort: args.pacPort
  });
}

const port = process.env.PORT || '3009';
if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
  console.error('PORT must be an integer between 1 and 65535.');
  process.exit(1);
}
process.env.PORT = port;
process.env.HOSTNAME = '0.0.0.0';
require('../server.js');

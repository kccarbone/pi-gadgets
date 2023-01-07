const lib = require('./index.js');
const logger = require('node-consolog');
const log = logger.getLogger('test');

logger.config.threshold = logger.levels.TRACE;

async function test() {
  log.info('test start');
  const bus = await lib.sn3218.init();
  log.info('test complete');
}

test();
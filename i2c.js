/* Base driver */
const fs = require('fs');
const _ = require('lodash');
const log = require('node-consolog').getLogger('i2c');

async function init(deviceId, address, blockSize = 32) {
  let bus;

  if (fs.existsSync(`/dev/i2c-${deviceId}`)) {
    try {
      log.debug(`Opening /dev/i2c-${deviceId}...`);
      const i2cBus = require('i2c-bus');
      bus = await i2cBus.openPromisified(deviceId);
    }
    catch (e) {
      log.error('Unable to open i2c device!');
    }
  }
  else {
    log.warn('i2c device not available! Running in mock mode...');
    bus = {
      writeI2cBlock: () => Promise.resolve()
    };
  }

  async function sendCommand(cmd, byte) {
    log.trace(`Command: ${hex(cmd)} - ${byte}`);
    await bus.writeByte(address, cmd, byte);
  }

  async function writeBlock(offset, data) {
    try {
      _.chunk(data, blockSize).forEach(async (x, i) => {
        const cursor = (i * blockSize) + offset;
        const bytes = Buffer.from(x);
        log.trace(`Write: (${hex(address)}): ${hex(cursor)} - ${JSON.stringify(x)}`);
        await bus.writeI2cBlock(address, cursor, bytes.length, bytes);
      });
    }
    catch (e) {
      log.error(e);
    }
  };

  async function writeStream(buf) {
    log.trace(`Stream: ${JSON.stringify(buf)}`);
    await bus.i2cWrite(address, buf.length, buf);
  }

  function hex(int, size = 2) {
    return `0x${int.toString(16).toUpperCase().padStart(size, '0')}`;
  }

  return {
    sendCommand,
    writeBlock,
    writeStream
  };
}

module.exports = {
  init
};
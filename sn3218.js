/* SN3218 Device */
const i2c = require('./i2c.js');
const log = require('node-consolog').getLogger('SN3218');

const MODE_REGISTER = 0x00;
const ENABLE_REGISTER = 0x13;
const APPLY_REGISTER = 0x16;

async function init(deviceId = 1, address = 0x54) {
  log.debug(`Initializing SN3218 (0x${address.toString(16)})`);
  const interface = await i2c.init(deviceId, address);
  await enable();

  async function enable() {
    await interface.writeBlock(MODE_REGISTER, [1]);
    await interface.writeBlock(ENABLE_REGISTER, [0b00111111, 0b00111111, 0b00111111]);
    log.debug(`Device enabled`);
  }

  async function disable() {
    await interface.writeBlock(ENABLE_REGISTER, [0, 0, 0]);
    await interface.writeBlock(MODE_REGISTER, [0]);
    log.debug(`Device disabled`);
  }

  async function setLED(index, brightness) {
    await interface.writeBlock(index + 1, [brightness]);
  }

  async function resetAll() {
    await interface.writeBlock(1, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }

  async function apply() {
    await interface.writeBlock(APPLY_REGISTER, [0xFF]);
    log.debug(`Updates applied`);
  }

  return {
    enable,
    disable,
    setLED,
    resetAll,
    apply
  };
}

module.exports = {
  init
};
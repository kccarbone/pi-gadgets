/* PiGlow */
const sn3218 = require('./sn3218.js');
const log = require('node-consolog').getLogger('PiGlow');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const colors = {
  WHITE: 0,
  BLUE: 1,
  GREEN: 2,
  YELLOW: 3,
  ORANGE: 4,
  RED: 5,
  ALL: [0, 1, 2, 3, 4, 5]
};

const map = [
  [9, 4, 5, 8, 7, 6],
  [12, 14, 3, 2, 1, 0],
  [10, 11, 13, 15, 16, 17]
];

async function init(deviceId = 1, address = 0x54) {
  log.info(`Initializing PiGlow`);
  const device = await sn3218.init(deviceId, address);

  async function setLED(leg, color, bri) {
    log.debug(`Set leg ${leg} color ${Object.keys(colors)[color]} to ${bri}`);
    try {
      await device.setLED(map[leg][color], bri);
    }
    catch (e) { log.error(JSON.stringify(e)); }
  }

  async function setLegs(leg, color, bri) {
    if (Array.isArray(leg)) {
      for (let i = 0; i < leg.length; i++) {
        await setLED(leg[i], color, bri);
      }
    }
    else {
      await setLED(leg, color, bri);
    }
  }

  async function set(leg, color, bri) {
    if (Array.isArray(color)) {
      for (let i = 0; i < color.length; i++) {
        await setLegs(leg, color[i], bri);
      }
    }
    else {
      await setLegs(leg, color, bri);
    }
  }

  async function apply() {
    try {
      await device.apply();
    }
    catch (e) { log.error(JSON.stringify(e)); }
  }

  async function resetAll() {
    try {
      await device.resetAll();
    }
    catch (e) { log.error(JSON.stringify(e)); }
  }

  async function close() {
    log.debug('shutting down');
    await device.resetAll();
    await device.apply();
    await device.disable();
  }

  async function fade(leg, color, start, end, duration) {
    const step = (end - start) / 100;
    const delay = duration / 100;

    for (let i = 0; i <= 100; i++) {
      const bri = Math.round((step * i) + start);
      await set(leg, color, bri);
      await apply();
      await sleep(delay);
    }
  }

  async function pulse(leg, color, start, peak, duration) {
    await fade(leg, color, start, peak, Math.round(duration / 2));
    await fade(leg, color, peak, start, Math.round(duration / 2));
  }

  async function burst(duration) {
    const delay = duration / 150;
    const bri = (i, start, end) => {
      const mid = start + Math.floor((end - start) / 2);
      if (i > start && i <= mid)
        return i - start;
      if (i > mid && i < end)
        return (end - start) - (i - start);
      return 0;
    }

    for (let i = 0; i <= 150; i++) {
      await set([0, 1, 2], colors.WHITE, bri(i, 0, 50));
      await set([0, 1, 2], colors.BLUE, bri(i, 20, 70));
      await set([0, 1, 2], colors.GREEN, bri(i, 40, 90));
      await set([0, 1, 2], colors.YELLOW, bri(i, 60, 110));
      await set([0, 1, 2], colors.ORANGE, bri(i, 80, 130));
      await set([0, 1, 2], colors.RED, bri(i, 100, 150));
      await apply();
      await sleep(delay);
    }
  }

  return {
    set,
    apply,
    close,
    fade,
    pulse,
    burst,
    resetAll
  };
}

module.exports = {
  init,
  colors
};
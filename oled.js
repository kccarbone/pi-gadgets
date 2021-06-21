const i2c = require('./i2c');
const fonts = require('oled-font-pack');
const log = require('node-consolog').getLogger('oled');

const COMMAND_BYTE = 0x80;
const DISPLAY_BYTE = 0x40;

const SET_CONTRAST = 0x81;
const SET_ENTIRE_ON = 0xA4;
const SET_NORM_INV = 0xA6;
const SET_DISP = 0xAE;
const SET_MEM_ADDR = 0x20;
const SET_COL_ADDR = 0x21;
const SET_PAGE_ADDR = 0x22;
const SET_DISP_START_LINE = 0x40;
const SET_SEG_REMAP = 0xA0;
const SET_MUX_RATIO = 0xA8;
const SET_COM_OUT_DIR = 0xC0;
const SET_DISP_OFFSET = 0xD3;
const SET_COM_PIN_CFG = 0xDA;
const SET_DISP_CLK_DIV = 0xD5;
const SET_PRECHARGE = 0xD9;
const SET_VCOM_DESEL = 0xDB;
const SET_CHARGE_PUMP = 0x8D;
const SET_SCROLL_RIGHT = 0x26;
const SET_SCROLL_LEFT = 0x27;
const SET_SCROLL_ACTIVE = 0x2F;
const SET_SCROLL_INACTIVE = 0x2E;

async function init(width, height, deviceId = 1, address = 0x3c) {
  log.debug(`Initializing OLED`);
  const interface = await i2c.init(deviceId, address);
  const screenBytes = (width * height) / 8;
  const buffer = Buffer.alloc(screenBytes);

  async function enableDisplay() {
    const startup = [
      SET_DISP | 0x00,
      SET_MEM_ADDR,
      0x00,
      SET_DISP_START_LINE | 0x00,
      SET_SEG_REMAP | 0x01,
      SET_MUX_RATIO,
      height - 1,
      SET_COM_OUT_DIR | 0x08,
      SET_DISP_OFFSET,
      0x00,
      SET_COM_PIN_CFG,
      ((height === 32 || height === 16) && (width !== 64)) ? 0x02 : 0x12,
      SET_DISP_CLK_DIV,
      0x80,
      SET_PRECHARGE,
      0xF1,
      SET_VCOM_DESEL,
      0x30,
      SET_CONTRAST,
      0xFF,
      SET_ENTIRE_ON,
      SET_NORM_INV,
      SET_CHARGE_PUMP,
      0x14,
      SET_DISP | 0x01
    ];

    log.debug('Sending startup commands');
    for (let i = 0; i < startup.length; i++) {
      await interface.sendCommand(COMMAND_BYTE, startup[i]);
    }
  }

  async function update() {
    const stream = Buffer.concat([Buffer.from([DISPLAY_BYTE]), buffer]);
    log.debug('Updating OLED');

    await interface.sendCommand(COMMAND_BYTE, SET_COL_ADDR);
    await interface.sendCommand(COMMAND_BYTE, 0);
    await interface.sendCommand(COMMAND_BYTE, width - 1);
    await interface.sendCommand(COMMAND_BYTE, SET_PAGE_ADDR);
    await interface.sendCommand(COMMAND_BYTE, 0);
    await interface.sendCommand(COMMAND_BYTE, (height / 8) - 1);
    await interface.writeStream(stream);
  }

  function writePixel(x, y, color = 1) {
    if (x < 0 || x > width || y < 0 || y > height) {
      log.warn(`Pixel value (${x},${y}) out of bounds for this display!`);
      return;
    }

    const byteOffset = Math.floor(y / 8) * width + x;
    const bitMask = 1 << (y % 8);

    if (color === 0) {
      buffer[byteOffset] = buffer[byteOffset] & ~bitMask;
    }
    else if (color === 1) {
      buffer[byteOffset] = buffer[byteOffset] | bitMask;
    }
    else {
      buffer[byteOffset] = buffer[byteOffset] ^ bitMask;
    }
  }

  function writeRect(x1, y1, x2, y2, color = 1) {
    for (let x=x1; x<=x2; x++){
      for (let y=y1; y<=y2; y++){
        writePixel(x, y, color);
      }
    }
  }
  
  function writeHLine(y, color = 1) {
    writeRect(0, y, width-1, y, color);
  }
  
  function writeVLine(x, color = 1) {
    writeRect(x, 0, x, height-1, color);
  }

  function writeText(x, y, text, typeFace, color = 1) {
    font = ((typeof typeFace === 'string') ? fonts[typeFace] : typeFace) || fonts.small_6x8;

    for (let i = 0; i < text.length; i++) {
      const cIndex = font.lookup.indexOf(text[i]) * font.width;
      const cBytes = font.fontData.slice(cIndex, cIndex + font.width);

      for (let cx = 0; cx < font.width; cx++) {
        for (let cy = 0; cy < font.height; cy++) {
          if (cBytes[cx] & (1 << cy)) {
            writePixel((x + cx) + (i * (font.width - 0)), y + cy, color);
          }
        }
      }
    }
  }

  async function startScroll(direction, rowStart = 0, rowEnd = 0x0f) {
    const commands = [
      (direction === 'right') ? SET_SCROLL_RIGHT : SET_SCROLL_LEFT,
      0x00,
      rowStart,
      0x00,
      rowEnd,
      0x00,
      0xFF,
      SET_SCROLL_ACTIVE
    ];

    for (let i = 0; i < commands.length; i++) {
      await interface.sendCommand(COMMAND_BYTE, commands[i]);
    }
  }

  async function stopScroll() {
    await interface.sendCommand(COMMAND_BYTE, SET_SCROLL_INACTIVE);
  }

  // Send startup sequence
  await enableDisplay();

  // Clear screen
  buffer.fill(0);
  await update();

  //console.log(fonts.oled_5x7);

  return {
    buffer,
    update,
    writeText,
    writePixel,
    writeRect,
    writeHLine,
    writeVLine,
    startScroll,
    stopScroll
  };
}

module.exports = {
  init,
  fonts
};
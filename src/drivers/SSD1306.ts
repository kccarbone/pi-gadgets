import { env } from 'node:process';
import { getLogger } from 'bark-logger';
import BaseDevice from '../base';

/* SSD1306
 * Driver for SSD1306 and related monochrome OLED displays
 * 
 * Datasheet:
 *   https://www.digikey.com/htmldatasheets/production/2047793/0/0/1/SSD1306.pdf
 */


// Register byte: <continuation> <control> 000000 (six zeros)
//   continuation bit = type of message; 0 for data stream, 1 for single-byte
//   control bit = type of next byte; 0 for command, 1 for data
const COMMAND_STREAM = 0b00000000;
const COMMAND_BYTE   = 0b10000000;
const DATA_STREAM    = 0b01000000;
const DATA_BYTE      = 0b11000000;


const log = getLogger('SSD1306');


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

const width = 128;
const height = 32;

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
  0x02,
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



class SSD1306 {
  private device: BaseDevice;

  constructor(i2cAddress = 0x3c) {
    this.device = new BaseDevice(i2cAddress, false);
  }

  init() {
    //this.device.writeByte(COMMAND_BYTE, 0x00);

    for (let i = 0; i < startup.length; i++) {
      this.device.writeByte(COMMAND_BYTE, startup[i]);
    }
  }

  test() {
    this.device.writeByte(COMMAND_BYTE, SET_COL_ADDR);
    this.device.writeByte(COMMAND_BYTE, 0);
    this.device.writeByte(COMMAND_BYTE, width - 1);
    this.device.writeByte(COMMAND_BYTE, SET_PAGE_ADDR);
    this.device.writeByte(COMMAND_BYTE, 0);
    this.device.writeByte(COMMAND_BYTE, (height / 8) - 1);

    const data = new Array(512).fill(0x01);

    this.device.writeBlock(DATA_STREAM, data);
  }

}

export default SSD1306;
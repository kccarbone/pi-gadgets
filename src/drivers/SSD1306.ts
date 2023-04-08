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



class SSD1306 {
  private device: BaseDevice;

  constructor(i2cAddress = 0x3c) {
    this.device = new BaseDevice(i2cAddress);
  }

  init() {
    this.device.writeByte(COMMAND_BYTE, 0x00);
  }

}

export default SSD1306;
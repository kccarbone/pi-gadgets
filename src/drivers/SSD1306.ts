import { env } from 'node:process';
import { getLogger } from 'bark-logger';
import BaseDevice from '../base';
import { hex } from '../utils/formatting';

/* SSD1306
 * Driver for SSD1306 and related monochrome OLED displays
 * 
 * Datasheet:
 *   https://www.digikey.com/htmldatasheets/production/2047793/0/0/1/SSD1306.pdf
 */

const log = getLogger('SSD1306');

function failHard(message: string) {
  log.fatal(message);
  throw new Error(message);
}

// Register byte: <continuation> <control> 000000 (six zeros)
//   continuation bit = type of message; 0 for data stream, 1 for single-byte
//   control bit = type of next byte; 0 for command, 1 for data
const COMMAND_STREAM = 0b00000000;
const COMMAND_BYTE   = 0b10000000;
const DATA_STREAM    = 0b01000000;
const DATA_BYTE      = 0b11000000;

// Fundamental commands
const SET_CONTRAST = 0x81;
const SET_ALL_ON = 0xA4;
const SET_INVERSE = 0xA6;
const SET_DISP = 0xAE;
const SET_ADDR_MODE = 0x20;
const SET_COL_ADDR = 0x21;
const SET_PAGE_ADDR = 0x22;
const SET_DISP_START_LINE = 0x40;
const SET_SEG_REMAP = 0xA0;
const SET_MUX_RATIO = 0xA8;
const SET_COM_OUT_DIR = 0xC0;
const SET_DISP_OFFSET = 0xD3;
const SET_COM_OPTS = 0xDA;
const SET_DISP_CLK_DIV = 0xD5;
const SET_PRECHARGE = 0xD9;
const SET_DESEL_LEVEL = 0xDB;
const SET_CHARGE_PUMP = 0x8D;
const SET_SCROLL_OPTS = 0x26;
const SET_SCROLL_ON = 0x2E;

export enum COLOR {
  BLACK = 0,
  WHITE = 1,
  INVERT = 2
}

export enum ORIENTATION {
  NORMAL = 0,
  UPSIDEDOWN = 1
}

export enum ADDR_MODE {
  HORIZONTAL = 0,
  VERTICAL = 1,
  PAGE = 2
}

export enum SEG_MODE {
  COL0 = 0,
  COL127 = 1
}

export enum SCAN_DIR {
  NORMAL = 0,
  REMAPPED = 8,
}

export enum SCROLL_DIR {
  RIGHT = 0,
  LEFT = 1,
}

export enum PIN_MODE {
  SEQUENTIAL = 2,
  ALTERNATIVE = 18
}

export enum PIN_REMAP {
  DISABLE = 2,
  ENABLE = 34
}

export enum DESEL_LEVEL {
  mV_650 = 0,
  mV_770 = 32,
  mV_830 = 48
}

export enum CHARGE_PUMP {
  DISABLE = 16,
  ENABLE = 20
}

export enum INTERVAL {
  FRAMES_5 = 0,
  FRAMES_64 = 1,
  FRAMES_128 = 2,
  FRAMES_256 = 3,
  FRAMES_3 = 4,
  FRAMES_4 = 5,
  FRAMES_25 = 6,
  FRAMES_2 = 7
}

export class Rect {
  public readonly w: number;
  public readonly h: number;
  public readonly x: number;
  public readonly y: number;

  constructor(w: number, h: number, x = 0, y = 0) {
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
  }
}

export interface Font {
  name: string,
  monospace: boolean,
  width: number,
  height: number,
  fontData: number[],
  lookup: string[]
}

class SSD1306 {
  /* 
  * TODO:
  *   - Fix hardcoded width/height
  *   - Methods for individual options
  *   - Optimize write
  */

  private deviceId: String;
  private device: BaseDevice;
  private bounds: Rect;
  private buffer: Buffer;

  constructor(width: number, height: number, i2cAddress = 0x3c) {
    if (width > 128) {
      failHard(`Width (${width}) is not supported by this driver`);
    }
    if (height > 64) {
      failHard(`Height (${height}) is not supported by this driver`);
    }
    if ((height % 8) > 0) {
      failHard(`Height (${height}) must be a multiple of 8`);
    }

    this.deviceId = `${hex(i2cAddress)}`;
    this.device = new BaseDevice(i2cAddress, 400, false);
    this.bounds = new Rect(width, height);
    this.buffer = Buffer.alloc((width * height) / 8, 0);
  }

  /** Initialize device with default settings */
  initDefault() {
    this.setDisplayEnabled(false);
    this.setAddressMode(ADDR_MODE.HORIZONTAL);
    this.setStartLine(0);
    this.setSegMode(SEG_MODE.COL0);
    this.setMuxRatio(this.bounds.h - 1);
    this.setComOutput(SCAN_DIR.NORMAL);
    this.setDisplayOffset(0);
    this.setComOptions(PIN_MODE.SEQUENTIAL, PIN_REMAP.DISABLE);
    this.setDisplayClockDivider(1, 8);
    this.setPrechargeTiming(1, 15);
    this.setComDeselect(DESEL_LEVEL.mV_830);
    this.setContrast(256);
    this.setAllOn(false);
    this.setInverseMode(false);
    this.setChargePumpEnabled(true);
    this.setDisplayEnabled(true);
    this.setWriteContext(this.bounds);
  }

  /** Enable or disable the device */
  setDisplayEnabled(enabled: boolean) {
    this.device.writeByte(COMMAND_BYTE, SET_DISP | (~~enabled));
  }

  /** Set the orientation of the display */
  setDisplayOrientation(orientation: ORIENTATION) {
    if (orientation == ORIENTATION.NORMAL) {
      this.setSegMode(SEG_MODE.COL0);
      this.setComOutput(SCAN_DIR.NORMAL);
    }
    else {
      this.setSegMode(SEG_MODE.COL127);
      this.setComOutput(SCAN_DIR.REMAPPED);
    }
  }

  /** Enable or disable the charge pump regulator */
  setChargePumpEnabled(enabled: boolean) {
    this.device.writeBlock(COMMAND_STREAM, [SET_CHARGE_PUMP, (0x10 | (~~enabled << 2))]);
  }

  /** Set the precharge period, 1 - 15 for each phase */
  setPrechargeTiming(phase1Cycles: number, phase2Cycles: number) {
    this.device.writeBlock(COMMAND_STREAM, [SET_PRECHARGE, (phase1Cycles | (phase2Cycles << 4))]);
  }

  /** Set the COM output scan direction */
  setComOutput(scanDirection: SCAN_DIR) {
    this.device.writeByte(COMMAND_BYTE, SET_COM_OUT_DIR | scanDirection);
  }

  /** Set COM output options */
  setComOptions(pinMode: PIN_MODE, remapMode: PIN_REMAP) {
    this.device.writeBlock(COMMAND_STREAM, [SET_COM_OPTS, (pinMode | remapMode)]);
  }

  /** Set COM deselect voltage level */
  setComDeselect(deselLevel: DESEL_LEVEL) {
    this.device.writeBlock(COMMAND_STREAM, [SET_DESEL_LEVEL, deselLevel]);
  }

  /** Set the display divider ratio (1 - 16) and oscillator frequency (0 - 15) */
  setDisplayClockDivider(ratio: number, freq: number) {
    this.device.writeBlock(COMMAND_STREAM, [SET_DISP_CLK_DIV, ((ratio - 1) | (freq << 4))]);
  }

  /** Set display contrast, 1 - 256 */
  setContrast(contrast: number) {
    this.device.writeBlock(COMMAND_STREAM, [SET_CONTRAST, (contrast - 1)])
  }

  /** Enable or disable inverse mode */
  setInverseMode(enabled: boolean) {
    this.device.writeByte(COMMAND_BYTE, SET_INVERSE | (~~enabled));
  }

  /** Fill display ON */
  setAllOn(allOn: boolean) {
    this.device.writeByte(COMMAND_BYTE, SET_ALL_ON | (~~allOn));
  }

  /** Set the memory addressing mode */
  setAddressMode(addrMode: ADDR_MODE) {
    this.device.writeBlock(COMMAND_STREAM, [SET_ADDR_MODE, addrMode]);
  }

  /** Set the display segment "re-map" to 0 or 127 */
  setSegMode(segMode: SEG_MODE) {
    this.device.writeByte(COMMAND_BYTE, SET_SEG_REMAP | segMode);
  }

  /** Set the display start line register, 0-63 */
  setStartLine(startLine: number) {
    this.device.writeByte(COMMAND_BYTE, SET_DISP_START_LINE | startLine);
  }

  /** Set the vertical shift offset, 0 - 63 */
  setDisplayOffset(offset: number) {
    this.device.writeBlock(COMMAND_STREAM, [SET_DISP_OFFSET, offset]);
  }

  /** Set the multiplex ratio, 16 - 64 */
  setMuxRatio(ratio: number) {
    this.device.writeBlock(COMMAND_STREAM, [SET_MUX_RATIO, ratio]);
  }

  /** Set the start and end address for columns, 0 - 127 */
  setColumnRange(start: number, end: number) {
    this.device.writeBlock(COMMAND_STREAM, [SET_COL_ADDR, start, end])
  }

  /** Set the start and end address for pages, 0 - 7 */
  setPageRange(start: number, end: number) {
    this.device.writeBlock(COMMAND_STREAM, [SET_PAGE_ADDR, start, end])
  }

  /** Enable or disable scrolling */
  setScrollEnabled(enabled: boolean) {
    this.device.writeByte(COMMAND_BYTE, SET_SCROLL_ON | (~~enabled));
  }

  /** Configure scroll options
   * @param direction Direction of scroll
   * @param startPage Fist page of scroll area, 0 - 7
   * @param delay Number of frames between animation steps
   * @param endPage Last page of scroll area, 0 - 7
   */
  setScrollOptions(startPage: number, endPage: number, direction: SCROLL_DIR, delay: INTERVAL) {
    this.device.writeBlock(COMMAND_BYTE, [
      SET_SCROLL_OPTS | direction,
      0x00,
      startPage,
      delay,
      endPage,
      0x00,
      0xFF
    ]);
  }

  /** Set the bounding area for incoming writes
   * @param writeArea Rectangle that will be used for incoming data
   */
  setWriteContext(writeArea: Rect) {
    if ((writeArea.y % 8) > 0) {
      failHard(`Y-value of write area (${writeArea.y}) must be a multiple of 8`);
    }
    if ((writeArea.h % 8) > 0) {
      failHard(`Height of write area (${writeArea.h}) must be a multiple of 8`);
    }
    if (writeArea.x < 0
      || writeArea.y < 0
      || (writeArea.x + writeArea.w) > this.bounds.w
      || (writeArea.y + writeArea.h) > this.bounds.h) {
      failHard(`Write area extends outside of bounds of this display (${this.bounds.w}x${this.bounds.h})`);
    }
    const maxCol = (writeArea.x + writeArea.w - 1);
    const startPage = (writeArea.y / 8);
    const maxPage = ((writeArea.y + writeArea.h) / 8) - 1;

    this.setColumnRange(writeArea.x, maxCol);
    this.setPageRange(startPage, maxPage);
  }

  /** Draw a single pixel
   * @param x X position of pixel
   * @param y Y position of pixel
   */
  drawPixel(x: number, y: number, color = COLOR.WHITE) {
    if (x < 0 || y < 0 || x >= this.bounds.w || y >= this.bounds.h) {
      log.warn(`Pixel value (${x},${y}) out of bounds for this display!`);
      return;
    }

    /*    Bytes
    *   |0123456...
    *  -+----------
    *  B|0000000...
    *  i|1111111...
    *  t|..........
    *  s|6666666...
    *   |7777777...
    */
    const offset = (Math.trunc(y / 8) * this.bounds.w) + x;
    const bitMask = 1 << (y % 8);
    const curByte = this.buffer[offset];
    let newByte = 0;

    switch (color) {
      case COLOR.BLACK: newByte = curByte & ~bitMask; break;
      case COLOR.WHITE: newByte = curByte | bitMask; break;
      case COLOR.INVERT: newByte = curByte ^ bitMask; break;
      default: break;
    }

    if (curByte !== newByte) {
      this.buffer[offset] = newByte;
    }
  }

  /** Draw a simple rectangle
   * @param x1 Starting corner
   * @param y1 Starting corner
   * @param x2 Ending corner
   * @param y2 Ending corner
   */
  drawRect(x1: number, y1: number, x2: number, y2: number, color = COLOR.WHITE) {
    for (let x=x1; x<=x2; x++){
      for (let y=y1; y<=y2; y++){
        this.drawPixel(x, y, color);
      }
    }
  }
  
  /** Draw a horizontal line 
   * @param y Position of the line
   */
  drawHLine(y: number, color = COLOR.WHITE) {
    this.drawRect(this.bounds.x, y, this.bounds.w - 1, y, color);
  }
  
  /** Draw a vertical line
   * @param x Position of the line
   */
  drawVLine(x: number, color = COLOR.WHITE) {
    this.drawRect(x, this.bounds.y, x, this.bounds.h - 1, color);
  }

  /** Draw text using a font pack
   * @param x Starting coordinate for the text
   * @param y Starting coordinate for the text
   * @param text Text to draw
   * @param font Font from a monochrome font pack
   */
  drawText(x: number, y: number, text: string, font: Font, color = COLOR.WHITE) {
    for (let i = 0; i < text.length; i++) {
      const cIndex = font.lookup.indexOf(text[i]) * font.width;
      const cBytes = font.fontData.slice(cIndex, cIndex + font.width);

      for (let cx = 0; cx < font.width; cx++) {
        for (let cy = 0; cy < font.height; cy++) {
          if (cBytes[cx] & (1 << cy)) {
            this.drawPixel((x + cx) + (i * (font.width - 0)), y + cy, color);
          }
        }
      }
    }
  }

  /** Push the contents of the display buffer to the device */
  update() {
    log.debug(`Updating display ${this.deviceId}`);
    this.device.writeBlock(DATA_STREAM, Array.from(this.buffer));
  }

  erase() {
    const data = new Array(512).fill(0b00000000);

    this.buffer.fill(0);
    this.device.writeBlock(DATA_STREAM, data);
  }

  lines() {
    const data = new Array(512).fill(0b00000001);

    this.device.writeBlock(DATA_STREAM, data);
  }

  /** Debug only */
  test() {
    const data = new Array(512).fill(0b00000001);

    this.device.writeBlock(DATA_STREAM, data);
  }

}

export default SSD1306;
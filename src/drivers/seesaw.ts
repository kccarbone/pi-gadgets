import { getLogger } from 'bark-logger';
import BaseDevice from '../base';
import { RGB, Pixel } from '../utils/color';
import { bytesToInt, intToBytes } from '../utils/bytelib';
import { hex } from '../utils/formatting';

/* seesaw
 * Driver for Adafruit's wonderful seesaw platform
 * 
 * Documentation:
 *   https://cdn-learn.adafruit.com/downloads/pdf/adafruit-seesaw-atsamd09-breakout.pdf
 */

const log = getLogger('seesaw');

enum REGISTER {
  STATUS   = 0x00,
  GPIO     = 0x01,
  SERCOM0  = 0x02,
  SERCOM1  = 0x03,
  SERCOM2  = 0x04,
  SERCOM3  = 0x05,
  SERCOM4  = 0x06,
  SERCOM5  = 0x07,
  PWM      = 0x08,
  ADC      = 0x09,
  DAC      = 0x0a,
  INT      = 0x0b,
  DAP      = 0x0c,
  EEPROM   = 0x0d,
  NEOPIXEL = 0x0e,
  TOUCH    = 0x0f,
  KEYPAD   = 0x10,
  ENCODER  = 0x11
}

enum STATUS {
  HWID    = 0x01,
  VERSION = 0x02,
  OPTIONS = 0x03,
  TEMP    = 0x04,
  SWRST   = 0x7f
}

enum NEOPX {
  PIN    = 0x01,
  SPEED  = 0x02,
  LENGTH = 0x03,
  DATA   = 0x04,
  SHOW   = 0x05
}

export class Device {
  private device: BaseDevice;
  private npPin = 0;
  private npChannelCount = 0;
  private npStartIndex = 0;
  private npState: number[] | undefined;

  // Channels per pixel
  // TODO: Add support for other pixel types (eg. RGBW)
  private cpp = 3

  constructor(i2cAddress = 0x49) {
    log.debug(`Init seesaw (${hex(i2cAddress)})`);
    this.device = new BaseDevice(i2cAddress);
  }

  private resetNeopixelState() {
    this.npState = new Array((this.npChannelCount || 0) + 2).fill(0);
  }

  /** Set the output pin for neopixels
   * @param pin hardware pin defined by the firmware running on-chip. See {@link PinMapping} using MTC-flashed device
   */
  setNeopixelPin(pin: number) {
    if (this.npPin !== pin) {
      log.debug(`Setting neopixel output pin to ${pin}`);
      this.device.writeBlock(REGISTER.NEOPIXEL, [NEOPX.PIN, pin]);
      this.npPin = pin;
    }
  }

  /** Set the number of pixels to control
   * @param pixelCount number of pixels (aka. string length)
   */
  setNeopixelPixelCount(pixelCount: number) {
    // RGB pixels use 3 channels per logical pixel
    // TODO: Add support for different pixel types (eg. RGBW)
    const channelCount = pixelCount * this.cpp;

    if (this.npChannelCount !== channelCount) {
      log.debug(`Setting neopixel channel count to ${channelCount} (for ${pixelCount} pixels)`);
      this.device.writeBlock(REGISTER.NEOPIXEL, [NEOPX.LENGTH, ...intToBytes(channelCount, 2)]);
      this.npChannelCount = channelCount;
    }

    this.resetNeopixelState();
  }

  /** Set the start index for the next show command
   * @param startIndex the "address" (index) of the pixel to start with, between zero and pixelCount
   */
  setNeopixelStartIndex(startIndex: number) {
    this.resetNeopixelState();

    if (this.npStartIndex !== startIndex) {
      log.debug(`Setting neopixel start index to ${startIndex}`);
      const channelBytes = intToBytes((startIndex * this.cpp), 2);
      this.npState![0] = channelBytes[0];
      this.npState![1] = channelBytes[1];
      this.npStartIndex = startIndex;
    }
  }

  /** Set the color of a single pixel
   * @param color new color of the pixel
   * @param offset zero-based offset for pixel index
   */
  setPixel(color: RGB, offset = 0) {
    const pixel = Pixel.fromRGB(color);

    if (this.npState === undefined) {
      this.resetNeopixelState();
    }

    if (((offset + 1) * this.cpp) > this.npChannelCount) {
      log.warn(`Unable to update pixel at index ${offset} because only ${this.npChannelCount} have been configured`);
    }
    else {
      log.debug(`Updating pixel at index: ${offset}`);

      // TODO: Harcoding GRB order for now
      this.npState![(offset * this.cpp) + 2] = pixel.G;
      this.npState![(offset * this.cpp) + 3] = pixel.R;
      this.npState![(offset * this.cpp) + 4] = pixel.B;
    }
  }

  /** Writes the current pixel state to the physical neopixels */
  showNeopixels() {
    if (this.npState === undefined) {
      log.warn('Neopixels have not been initialized!');
    }
    else {
      log.debug(`Writing ${this.npState.length} bytes of new neopixel data`);
      this.device.writeBlock(REGISTER.NEOPIXEL, [NEOPX.DATA, ...this.npState]);
      this.device.writeBlock(REGISTER.NEOPIXEL, [NEOPX.SHOW]);
    }
  }
}

/** Pin mappings as defined by the megaTinyCore project:
 *  https://github.com/SpenceKonde/megaTinyCore
 */
export const PinMapping = {
  'ATtinyXY2': {
    'PA0': 5,
    'PA1': 2,
    'PA2': 3,
    'PA3': 4,
    'PA6': 0,
    'PA7': 1
  },
  'ATtinyXY4': {
    'PA0': 11,
    'PA1': 8,
    'PA2': 9,
    'PA3': 10,
    'PA4': 0,
    'PA5': 1,
    'PA6': 2,
    'PA7': 3,
    'PB0': 7,
    'PB1': 6,
    'PB2': 5,
    'PB3': 4
  },
  'ATtinyXY6': {
    'PA0': 17,
    'PA1': 14,
    'PA2': 15,
    'PA3': 16,
    'PA4': 0,
    'PA5': 1,
    'PA6': 2,
    'PA7': 3,
    'PB0': 9,
    'PB1': 8,
    'PB2': 7,
    'PB3': 6,
    'PB4': 5,
    'PB5': 4,
    'PC0': 10,
    'PC1': 11,
    'PC2': 12,
    'PC3': 13
  },
  'ATtinyXY7': {
    'PA0': 21,
    'PA1': 18,
    'PA2': 19,
    'PA3': 20,
    'PA4': 0,
    'PA5': 1,
    'PA6': 2,
    'PA7': 3,
    'PB0': 11,
    'PB1': 10,
    'PB2': 9,
    'PB3': 8,
    'PB4': 7,
    'PB5': 6,
    'PB6': 5,
    'PB7': 4,
    'PC0': 12,
    'PC1': 13,
    'PC2': 14,
    'PC3': 15,
    'PC4': 16,
    'PC5': 17
  }
}
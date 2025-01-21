import { getLogger } from 'bark-logger';
import BaseDevice from '../base';
import * as Color from '../utils/color';
import { bytesToInt, intToBytes, chunkArray } from '../utils/bytelib';
import { hex } from '../utils/formatting';
import { sleep } from '../utils/timing';

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

enum GPIO {
  DIRSET     = 0x02,
  DIRCLR     = 0x03,
  GPIO       = 0x04,
  SET        = 0x05,
  CLR        = 0x06,
  TOGGLE     = 0x07,
  INTENSET   = 0x08,
  INTENCLR   = 0x09,
  INTFLAG    = 0x0a,
  PULLENSET  = 0x0b,
  PULLENCLR  = 0x0c
}

enum PWM {
  VALUE = 0x01,
  FREQ  = 0x02
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
  private chunkSize = 12;
  private npPin = 0;
  private npChannelsPerPixel = 0;
  private npChannelCount = 0;
  private npState: number[] | undefined;

  constructor(i2cAddress = 0x49) {
    log.debug(`Init seesaw (${hex(i2cAddress)})`);
    this.device = new BaseDevice(i2cAddress);
  }

  protected async readRegister(reg1: number, reg2: number, length: number) {
    this.device.writeByte(reg1, reg2);
    await sleep(2);
    const result = this.device.readRaw(length);
    await sleep(2);
    return result;
  }

  async getDeviceInfo() {
    const hardwareID = await this.readRegister(REGISTER.STATUS, STATUS.HWID, 1);
    const version = await this.readRegister(REGISTER.STATUS, STATUS.VERSION, 4);
    const options = await this.readRegister(REGISTER.STATUS, STATUS.OPTIONS, 4);
    const temperature = await this.readRegister(REGISTER.STATUS, STATUS.TEMP, 4);

    log.info(`Hardware ID: ${hex(hardwareID)}`);
    log.info(`Version: ${hex(version)}`);
    log.info(`Options: ${hex(options)}`);
    log.info(`Temperature: ${bytesToInt(temperature)}`);
  }

  async getGPIOState() {
    const bytes = await this.readRegister(REGISTER.GPIO, GPIO.GPIO, 4);
    const result = bytesToInt(bytes, false);
    log.info(`GPIO state: ${result} [${result.toString(2)}]`);
  }

  setOutputGPIO(pin: number, value: boolean) {
    const bitwise = 1 << pin;

    if (value) {
      this.device.writeBlock(REGISTER.GPIO, [GPIO.SET, ...intToBytes(bitwise, 4)]);
    }
    else {
      this.device.writeBlock(REGISTER.GPIO, [GPIO.CLR, ...intToBytes(bitwise, 4)]);
    }
  }

  setOutputPWM(pin: number, value: number, frequency = 256) {
    // Byte order: [PIN, VAL, 0] (LSB not used)
    this.device.writeBlock(REGISTER.PWM, [PWM.VALUE, pin, value, 0]);

    // Byte order: [PIN, FREQ_MSB, FREQ_LSB]
    this.device.writeBlock(REGISTER.PWM, [PWM.FREQ, pin, ...intToBytes(frequency, 2)]);
  }

  /** Configure device for controling a string of neopixels
   * @param pin hardware pin defined by the firmware running on-chip. See {@link PinMapping} using MTC-flashed device
   * @param pixelCount number of pixels (aka. string length)
   * @param channelsPerPixel number of channels for each pixel (eg. RGB = 3 channels)
   */
  initNeopixels(pin: number, pixelCount: number, channelsPerPixel = 3) {
    if (this.npPin !== pin) {
      log.debug(`Setting neopixel output pin to ${pin}`);
      this.device.writeBlock(REGISTER.NEOPIXEL, [NEOPX.PIN, pin]);
      this.npPin = pin;
    }
    
    this.npChannelsPerPixel = channelsPerPixel;
    const channelCount = pixelCount * channelsPerPixel;

    if (this.npChannelCount !== channelCount) {
      log.debug(`Setting neopixel channel count to ${channelCount} (for ${pixelCount} pixels)`);
      this.device.writeBlock(REGISTER.NEOPIXEL, [NEOPX.LENGTH, ...intToBytes(channelCount, 2)]);
      this.npChannelCount = channelCount;
    }

    // Initialize a new buffer for pixel state
    this.npState = new Array(this.npChannelCount || 0).fill(0);
  }

  /** Set the color of a single pixel */
  setPixel(pixel: Pixel, offset = 0) {
    const cpp = this.npChannelsPerPixel;

    if (this.npState === undefined) {
      log.warn('Neopixels have not been initialized!');
    }
    else {
      if (((offset + 1) * cpp) > this.npChannelCount) {
        log.warn(`Unable to update pixel at index ${offset} because only ${this.npChannelCount} have been configured`);
      }
      else {
        if (cpp > 0) this.npState[(offset * cpp) + 0] = pixel.R ?? 0;
        if (cpp > 1) this.npState[(offset * cpp) + 1] = pixel.G ?? 0;
        if (cpp > 2) this.npState[(offset * cpp) + 2] = pixel.B ?? 0;
        if (cpp > 3) this.npState[(offset * cpp) + 3] = pixel.WW ?? 0;
        if (cpp > 4) this.npState[(offset * cpp) + 4] = pixel.CW ?? 0;
      }
    }
  }

  /** Writes the current pixel state to the physical neopixels */
  showNeopixels() {
    if (this.npState === undefined) {
      log.warn('Neopixels have not been initialized!');
    }
    else {
      // TODO: Optimize this by comparing buffer states and only sending data when needed
      const chunks = chunkArray(this.npState, this.chunkSize);
      log.debug(`Writing ${this.npState.length} bytes of new neopixel data`);

      if (chunks.length > 1)
        log.debug(`(sending in ${chunks.length} chunks)`);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const startInd = i * this.chunkSize;
        const header = intToBytes(startInd, 2);

        this.device.writeBlock(REGISTER.NEOPIXEL, [NEOPX.DATA, ...header, ...chunk]);
      }
      
      this.device.writeBlock(REGISTER.NEOPIXEL, [NEOPX.SHOW]);
    }
  }

  /** Clears the internal display buffer for neopixels */
  clearPixelBuffer() {
    if (this.npState) {
      this.npState.fill(0);
    }
  }
}

/** Single generic pixel */
export class Pixel {
  /** The red channel for this pixel */
  readonly R?: number;
  /** The green channel for this pixel */
  readonly G?: number;
  /** The blue channel for this pixel */
  readonly B?: number;
  /** The warm white channel for this pixel */
  readonly WW?: number;
  /** The cool white channel for this pixel */
  readonly CW?: number;

  /** Instantiate a new pixel from raw color intensities */
  constructor(
    red = undefined as (number | undefined),
    green = undefined as (number | undefined),
    blue = undefined as (number | undefined),
    warmWhite = undefined as (number | undefined),
    coolWhite = undefined as (number | undefined)
  ) {
    this.R = red;
    this.G = green;
    this.B = blue;
    this.WW = warmWhite;
    this.CW = coolWhite;
  }

  /** Create a pixel from RGB values */
  static fromRGB(input: Color.RGB) {
    return new Pixel(input[0], input[1], input[2]);
  }

  /** Create a pixel from GRB values */
  static fromGRB(input: Color.RGB) {
    return new Pixel(input[1], input[0], input[2]);
  }

  /** Create a pixel from RGBW values */
  static fromRGBW(input: Color.RGBW) {
    return new Pixel(input[0], input[1], input[2], input[3]);
  }

  /** Create a pixel from GRBW values */
  static fromGRBW(input: Color.RGBW) {
    return new Pixel(input[1], input[0], input[2], input[3]);
  }

  /** Create a pixel from RGBWC values */
  static fromRGBWC(input: Color.RGBWC) {
    return new Pixel(input[0], input[1], input[2], input[3], input[4]);
  }

  /** Create a pixel from GRBWC values */
  static fromGRBWC(input: Color.RGBWC) {
    return new Pixel(input[1], input[0], input[2], input[3], input[4]);
  }

  // TODO: More initializers for eg. Hex, HSB, etc...
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
import { env } from 'node:process';
import { getLogger } from 'bark-logger';
import BaseDevice from '../base';

/* FL3731
 * Driver for IS31FL3731 and related LED control chips
 * 
 * Datasheet:
 *   https://www.lumissil.com/assets/pdf/core/IS31FL3731_DS.pdf
 */

const FRAME_REGISTER = 0xfd;
const SETTINGS_FRAME = 0x0b;
const OFFSET_ENABLE = 0x00;
const OFFSET_BLINK = 0x12;
const OFFSET_PWM = 0x24;

export enum SETTING {
  OPERATING_MODE = 0x00,
  DISPLAY_FRAME = 0x01,
  AUTO_PLAY_MODE = 0x02,
  AUTO_PLAY_DELAY = 0x03,
  DISPLAY_MODE = 0x05,
  AUDIO_SYNC = 0x06,
  FRAME_STATE = 0x07, // Read-only
  BREATH_RAMP = 0x08,
  BREATH_MODE = 0x09,
  SHUTDOWN = 0x0a,
  AUDIO_GAIN = 0x0b,
  AUDIO_SAMPLING = 0x0c
}

export enum OPERATING_MODE {
  /** Control display changes manually */
  FIXED = 0x00,
  /** Loop through display pages automatically */
  AUTO_PLAY = 0x01,
  /** Responds to audio input */
  AUDIO = 0x10
}

class FL3731 {
  private device: BaseDevice;

  constructor(i2cAddress = 0x74) {
    this.device = new BaseDevice(i2cAddress);
  }

  /** (low-level operation) Set input register to given frame */
  setFrame(frame: number) {
    // TODO: only update if it's a different frame
    this.device.writeByte(FRAME_REGISTER, frame);
  }

  /** (low-level operation) Read a particular value in the SETTINGS data space */
  readSetting(setting: SETTING) {
    this.setFrame(SETTINGS_FRAME);
    this.device.readBlock(setting, 1);
  }

  /** (low-level operation) Write a particular value in the SETTINGS data space */
  writeSetting(setting: SETTING, value: number) {
    this.setFrame(SETTINGS_FRAME);
    // TODO: only update if the setting/value is different
    this.device.writeByte(setting, value);
  }

  /** Put device in SHUTDOWN mode */
  disableDevice() {
    this.writeSetting(SETTING.SHUTDOWN, 0);
  }

  /** Take device out of SHUTDOWN mode */
  enableDevice() {
    this.writeSetting(SETTING.SHUTDOWN, 1);
  }

  /** Set the operating mode of this device */
  setOperatingMode(mode: OPERATING_MODE, startFrame = 0) {
    this.writeSetting(SETTING.OPERATING_MODE, (mode << 3) + startFrame);
  }

  /** Set the default values for an entire frame */
  enableFrame(frame: number) {
    const bytes = [
      ...new Array(18).fill(0xFF), // Enable
      ...new Array(18).fill(0x00), // Blink
      ...new Array(144).fill(0x00) // PWM
    ];
    this.setFrame(frame);
    this.device.writeBlock(OFFSET_ENABLE, bytes);
  }

  /** Display a specific frame (fixed mode only) */
  displayFrame(frame: number) {
    this.writeSetting(SETTING.DISPLAY_FRAME, frame);
  }

  setLed(frame: number, index: number, pwm: number) {
    this.setFrame(frame);
    this.device.writeByte(OFFSET_PWM + index, pwm);
  }

}

export default FL3731;
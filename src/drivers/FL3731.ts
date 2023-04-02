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

  // TODO: implement READ (setting 0x07)

  constructor(i2cAddress = 0x74) {
    this.device = new BaseDevice(i2cAddress);
  }

  /** (low-level operation) Set a particular value in the SETTINGS data space */
  setSetting(setting: SETTING, value: number) {
    // TODO: only update we aren't already in settings
    this.device.writeByte(FRAME_REGISTER, SETTINGS_FRAME);
    // TODO: only update if the setting/value is different
    this.device.writeByte(setting, value);
  }

  /** Put device in SHUTDOWN mode */
  disableDevice() {
    this.setSetting(SETTING.SHUTDOWN, 0);
  }

  /** Take device out of SHUTDOWN mode */
  enableDevice() {
    this.setSetting(SETTING.SHUTDOWN, 1);
  }

  /** Set the operating mode of this device */
  setOperatingMode(mode: OPERATING_MODE, startFrame = 0) {
    this.setSetting(SETTING.OPERATING_MODE, (mode << 3) + startFrame);
  }

  /** Set the frame that should be displayed (fixed mode only) */
  setDisplayFrame(frame: number) {
    this.setSetting(SETTING.DISPLAY_FRAME, frame);
  }

  /** Enable all bits for the given frame */
  enableFrame(frame: number) {
    const bytes = new Array(18).fill(0xff);
    this.device.writeBlock(frame, bytes);
  }

}

export default FL3731;
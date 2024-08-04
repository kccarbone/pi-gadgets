import { getLogger } from 'bark-logger';
import BaseDevice from '../base';

/* FL3731
 * Driver for IS31FL3731 and related LED control chips
 * 
 * Datasheet:
 *   https://www.lumissil.com/assets/pdf/core/IS31FL3731_DS.pdf
 */

const log = getLogger('FL3731');

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
  DISPLAY_OPTIONS = 0x05,
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

const bit = (bool: boolean) => (bool ? 1 : 0);

export class Device {
  private device: BaseDevice;
  private curFrame = 0;
  private curSetting = new Array(12).fill(-1);

  constructor(i2cAddress = 0x74) {
    this.device = new BaseDevice(i2cAddress);
  }

  /** (low-level operation) Set input register to given frame */
  setFrame(frame: number) {
    if (frame !== this.curFrame) {
      this.device.writeByte(FRAME_REGISTER, frame);
      this.curFrame = frame;
    }
  }

  /** (low-level operation) Read a particular value in the SETTINGS data space */
  readSetting(setting: SETTING) {
    this.setFrame(SETTINGS_FRAME);
    return this.device.readByte(setting);
  }

  /** (low-level operation) Write a particular value in the SETTINGS data space */
  writeSetting(setting: SETTING, value: number) {
    this.setFrame(SETTINGS_FRAME);
    
    if (value !== this.curSetting[setting]) {
      this.device.writeByte(setting, value);
      this.curSetting[setting] = value;
    }
  }

  /** Put device in SHUTDOWN mode */
  disableDevice() {
    this.writeSetting(SETTING.SHUTDOWN, 0);
  }

  /** Take device out of SHUTDOWN mode */
  enableDevice() {
    this.writeSetting(SETTING.SHUTDOWN, 1);
  }

  /** Fixed mode: Display one frame at a time
   * @param frame (optional) The initial frame to display
   */
  setModeFixed(frame?: number) {
    this.writeSetting(SETTING.OPERATING_MODE, (OPERATING_MODE.FIXED << 3));

    if (typeof frame === 'number') {
      this.displayFrame(frame)
    }
  }

  /** AutoPlay mode: Automatically rotate through frames
   * @param frameStart (optional) The first frame in the rotation
   * @param framesToPlay (optional) The number of frames to loop through (starting with frameStart), 0 = all
   * @param frameHold (optional) Time to stay on each frame (1-63) using x * 11ms, 0 = 64
   * @param loopCount (optional) Number of times to run the loop before stopping (1-7), 0 = unlimited
   */
  setModeAutoPlay(frameStart = 0, framesToPlay = 0, frameHold = 0, loopCount = 0) {
    this.writeSetting(SETTING.AUTO_PLAY_MODE, ((loopCount << 4) + framesToPlay));
    this.writeSetting(SETTING.AUTO_PLAY_DELAY, frameHold);
    this.writeSetting(SETTING.OPERATING_MODE, (OPERATING_MODE.AUTO_PLAY << 3) + frameStart);
  }

  /** Audio mode: Sync to audio input */
  setModeAudio() {
    this.writeSetting(SETTING.OPERATING_MODE, (OPERATING_MODE.AUDIO << 3));
    this.enableAudioSync();
  }

  /** Enable audio sync (set mode first) 
   * @param sampleRate (optional) Sample rate of ADC (0 - 255), 0 = 256
   * @param useAgc (optional) Enable audio gain control
   * @param agcFast (optional) Use "fast mode" for audio gain control
   * @param gain (optional) Audio gain (0-7) using x * 3db
  */
  enableAudioSync(sampleRate = 0, useAgc = false, agcFast = false, gain = 0) {
    this.writeSetting(SETTING.AUDIO_SAMPLING, sampleRate);
    this.writeSetting(SETTING.AUDIO_GAIN, ((bit(agcFast) << 4) + (bit(useAgc) << 3) + gain));
    this.writeSetting(SETTING.AUDIO_SYNC, 1);
  }

  /** Disable audio sync (set mode first) */
  disableAudioSync() {
    this.writeSetting(SETTING.AUDIO_SYNC, 0);
  }

  /** Enable blink function
   * @param blinkDelay Delay time (0-7) using x * 270ms
   */
  enableBlink(blinkDelay: number) {
    this.writeSetting(SETTING.DISPLAY_OPTIONS, ((1 << 3) + blinkDelay));
  }

  /** Disable blink function */
  disableBlink() {
    this.writeSetting(SETTING.DISPLAY_OPTIONS, 0);
  }

  /** Enable breath function
   * @param fadeIn Ramp up time (0-7) using 2^x * 26ms
   * @param fadeOut Ramp down time (0-7) using 2^x * 26ms
   * @param frameDelay (optional) Delay between frames (0-7) using 2^x * 3.5ms
   */
  enableBreath(fadeIn: number, fadeOut: number, frameDelay = 0) {
    this.writeSetting(SETTING.BREATH_RAMP, ((fadeOut << 4) + fadeIn));
    this.writeSetting(SETTING.BREATH_MODE, ((1 << 4) + frameDelay));
  }

  /** Disable breath function */
  disableBreath() {
    this.writeSetting(SETTING.BREATH_MODE, 0);
  }

  /** Set the default values for an entire frame
   * @param frame The frame (0-7)
   */
  enableFrame(frame: number) {
    const bytes = [
      ...new Array(18).fill(0xFF), // Enable
      ...new Array(18).fill(0x00), // Blink
      ...new Array(144).fill(0x00) // PWM
    ];
    this.setFrame(frame);
    this.device.writeBlock(OFFSET_ENABLE, bytes);
  }

  /** Sets all PWM channels in the given frame to the given value
   * @param frame The frame (0-7)
   * @param pwm PWM value (0-255)
   */
  fillFrame(frame: number, pwm: number) {
    this.setFrame(frame);
    this.device.writeBlock(OFFSET_PWM, new Array(144).fill(pwm));
  }

  /** Sets all PWM channels in the given frame to zero
   * @param frame The frame (0-7)
   */
  clearFrame(frame: number) {
    this.fillFrame(frame, 0);
  }

  /** Display a specific frame (fixed mode only) 
   * @param frame The frame (0-7)
  */
  displayFrame(frame: number) {
    this.writeSetting(SETTING.DISPLAY_FRAME, frame);
  }

  /** Set the blink state of a specific channel 
   * @param frame The frame (0-7)
   * @param channel ID of the channel (0-143)
   * @param blink Blink enabled?
  */
  setBlink(frame: number, channel: number, blink: boolean) {
    const register = ~~(channel / 8);
    const bit = channel % 8;
    const mask = 1 << bit;

    this.setFrame(frame);

    // TODO: refactor to use buffer and preserve other bits
    this.device.writeByte(OFFSET_BLINK + register, mask);
  }

  /** Set the PWM state of a specific channel 
   * @param frame The frame (0-7)
   * @param channel ID of the channel (0-143)
   * @param pwm PWM value (0-255)
  */
  setChannel(frame: number, channel: number, pwm: number) {
    this.setFrame(frame);
    this.device.writeByte(OFFSET_PWM + channel, pwm);
  }
}
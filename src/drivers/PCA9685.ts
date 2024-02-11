import { getLogger } from 'bark-logger';
import BaseDevice from '../base';
import { hex } from '../utils/formatting';
import { setBit } from '../utils/bytelib';

/* PCA9685
 * Driver for PCA9685 pwm driver
 * 
 * Datasheet:
 *   https://www.nxp.com/docs/en/data-sheet/PCA9685.pdf
 */

const log = getLogger('PCA9685');

enum REGISTER {
  MODE1 = 0x00,
  MODE2 = 0x01,
  SUBADR1 = 0x02,
  SUBADR2 = 0x03,
  SUBADR3 = 0x04,
  ALLCALL = 0x05
}

enum MODE1 {
  ALLCALL_EN = 0,
  SUB3 = 1,
  SUB2 = 2,
  SUB1 = 3,
  SLEEP = 4,
  AUTO_INC = 5,
  EXTCLK = 6,
  RESTART = 7
}

enum MODE2 {
  OUTNE0 = 0,
  OUTNE1 = 1,
  OUTDRV = 2,
  OUTCH = 3,
  INVRT = 4
}

export class Device {
  private device: BaseDevice;
  private settings: number[] = [];

  constructor(i2cAddress = 0x40) {
    log.debug(`Init PCA9685 (${hex(i2cAddress)})`);
    this.device = new BaseDevice(i2cAddress);
    this.settings[REGISTER.MODE1] = this.device.readByte(REGISTER.MODE1);
    this.settings[REGISTER.MODE2] = this.device.readByte(REGISTER.MODE2);
  }

  /** Internal helper to update a single bit in one of the "MODE" registers
   * @param register MODE1 or MODE2
   * @param bit "index" of the bit to change in this register
   * @param value New bit value (true=1, false=0)
   */
  protected updateSetting(register: number, bit: number, value: boolean) {
    const newValue = setBit(this.settings[register], bit, value);
    this.device.writeByte(register, newValue);
    this.settings[register] = newValue;
  }

  /** Enable PWM outputs for this device */
  enable() {
    this.updateSetting(REGISTER.MODE1, MODE1.SLEEP, false);
  }

  /** Disable PWM outputs for this device */
  disable() {
    this.updateSetting(REGISTER.MODE1, MODE1.SLEEP, true);
  }

}
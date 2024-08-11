import { getLogger } from 'bark-logger';
import BaseDevice from '../base';
import { hex } from '../utils/formatting';
import { getBit, setBit, intToBytes } from '../utils/bytelib';
import { sleep } from '../utils/timing';
import { gamma } from '../utils/color';

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

enum DRIVEMODE {
  LOW = 0,
  HIGH = 1,
  HIGHZ = 2
}

const CHANNEL_ALL = 0xfa;
const CHANNEL = [
  0x6,
  0xa,
  0xe,
  0x12,
  0x16,
  0x1a,
  0x1e,
  0x22,
  0x26,
  0x2a,
  0x2e,
  0x32,
  0x36,
  0x3a,
  0x3e,
  0x42
]

export class Device {
  private device: BaseDevice;
  private settings: number[] = [];
  private globalGamma = 1;

  constructor(i2cAddress = 0x40) {
    log.debug(`Init PCA9685 (${hex(i2cAddress)})`);
    this.device = new BaseDevice(i2cAddress);
    this.settings[REGISTER.MODE1] = this.device.readByte(REGISTER.MODE1);
    this.settings[REGISTER.MODE2] = this.device.readByte(REGISTER.MODE2);
    this.setAutoIncrement(true);
  }

  /** Internal helper to read a single bit in one of the "MODE" registers
   * @param register MODE1 or MODE2
   * @param bit "index" of the bit to change in this register
   */
  protected getSetting(register: number, bit: number) {
    return getBit(this.settings[register], bit);
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

  /** Set a global "gamma curve" to be applied to all outputs (not retroactive) */
  setGamma(newValue: number) {
    this.globalGamma = newValue;
  }

  /** Perform a soft restart (clears all PWM settings) */
  async restart() {
    // If device is in sleep mode, wake it up
    if (this.getSetting(REGISTER.MODE1, MODE1.SLEEP)) {
      this.updateSetting(REGISTER.MODE1, MODE1.SLEEP, false);
      await sleep(10);
    }
    // Writing a bit to the restart register automatically clears the bit
    this.updateSetting(REGISTER.MODE1, MODE1.RESTART, true);
    await sleep(10);
  }

  /** Switch device to external clock (must restart to undo this) */
  async useExternalClock() {
    this.updateSetting(REGISTER.MODE1, MODE1.SLEEP, true);
    await sleep(10);
    this.updateSetting(REGISTER.MODE1, MODE1.EXTCLK, true);
    await sleep(10);
  }

  /** When enabled, the control register us automatically incremented after every read or write */
  protected setAutoIncrement(enabled: boolean) {
    this.updateSetting(REGISTER.MODE1, MODE1.AUTO_INC, enabled);
  }

  /** When enabled, the output logic state is inverted */
  setInvert(enabled: boolean) {
    this.updateSetting(REGISTER.MODE2, MODE2.INVRT, enabled);
  }

  /** When enabled, pwm values only change on ACK, instead of STOP */
  setSyncOnAck(enabled: boolean) {
    this.updateSetting(REGISTER.MODE2, MODE2.OUTCH, enabled);
  }

  /** When enabled, logic is pulled down/up, instead of open drain */
  setInternalPull(enabled: boolean) {
    this.updateSetting(REGISTER.MODE2, MODE2.OUTDRV, enabled);
  }

  /** 
   * Sets the drive mode for all channels when device is disabled 
   * @param drivemode 0 = LOW, 1 = HIGH, 2 = HIGH-Z
   */
  setDisabledDriveMode(drivemode: number) {
    if (drivemode == DRIVEMODE.HIGHZ) {
      this.updateSetting(REGISTER.MODE2, MODE2.OUTNE1, true);
    }
    else if (drivemode == DRIVEMODE.HIGH) {
      this.updateSetting(REGISTER.MODE2, MODE2.OUTNE1, false);
      this.updateSetting(REGISTER.MODE2, MODE2.OUTNE0, true);
      this.updateSetting(REGISTER.MODE2, MODE2.OUTDRV, true);
    }
    else if (drivemode == DRIVEMODE.LOW) {
      this.updateSetting(REGISTER.MODE2, MODE2.OUTNE1, false);
      this.updateSetting(REGISTER.MODE2, MODE2.OUTNE0, false);
    }
  }

  /** Configure device to use sub address 1 (default 0xE2) */
  setSubAddr1(enabled: boolean, address = 0xE2) {
    this.device.writeByte(REGISTER.SUBADR1, address);
    this.updateSetting(REGISTER.MODE1, MODE1.SUB1, enabled);
  }

  /** Configure device to use sub address 2 (default 0xE4) */
  setSubAddr2(enabled: boolean, address = 0xE4) {
    this.device.writeByte(REGISTER.SUBADR2, address);
    this.updateSetting(REGISTER.MODE1, MODE1.SUB2, enabled);
  }

  /** Configure device to use sub address 3 (default 0xE8) */
  setSubAddr3(enabled: boolean, address = 0xE8) {
    this.device.writeByte(REGISTER.SUBADR3, address);
    this.updateSetting(REGISTER.MODE1, MODE1.SUB3, enabled);
  }

  /** Configure device to use the "all call" i2c address (default 0xE0) */
  setAllCall(enabled: boolean, address = 0xE0) {
    this.device.writeByte(REGISTER.ALLCALL, address);
    this.updateSetting(REGISTER.MODE1, MODE1.ALLCALL_EN, enabled);
  }

  /** Enable PWM outputs for this device */
  enable() {
    this.updateSetting(REGISTER.MODE1, MODE1.SLEEP, false);
  }

  /** Disable PWM outputs for this device */
  disable() {
    this.updateSetting(REGISTER.MODE1, MODE1.SLEEP, true);
  }

  /** Internal write output level to device */
  protected writeOutput(offset: number, dutyCycle: number) {
    if (dutyCycle < 0 || dutyCycle > 100) {
      log.error(`Invalid duty cycle: ${dutyCycle}`);
    }
    else if (dutyCycle == 0) {
      // Constant-off mode
      this.device.writeBlock(offset, [0, 0, 0, 0x10]);
    }
    else if (dutyCycle == 100) {
      // Constant-on mode
      this.device.writeBlock(offset, [0, 0x10, 0, 0]);
    }
    else {
      const corrected = gamma(dutyCycle, this.globalGamma);
      const steps = Math.floor(corrected * 40.96);
      const bytes = intToBytes(steps, 2);
      log.debug(`Updating duty cycle value: ${dutyCycle}, Corrected: ${corrected}, Steps: ${steps}`);

      // Byte order: [ON_MSB, ON_LSB, OFF_MSB, OFF_LSB]
      this.device.writeBlock(offset, [0, 0, bytes[1], bytes[0]]);
    }
  }

  /** Update single output channel to new duty cycle (0 - 100) */
  updateOutput(channelId: number, dutyCycle: number) {
    this.writeOutput(CHANNEL[channelId], dutyCycle);
  }

  /** Update all outputs to new duty cycle (0 - 100) */
  updateAllOutputs(dutyCycle: number) {
    this.writeOutput(CHANNEL_ALL, dutyCycle);
  }

}
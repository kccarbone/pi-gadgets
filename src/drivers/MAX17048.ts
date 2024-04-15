import { getLogger } from 'bark-logger';
import BaseDevice from '../base';
import { bytesToInt } from '../utils/bytelib';
import { hex } from '../utils/formatting';

/* MAX17048
 * Driver for MAX17048 LiPo fuel gauge 
 * 
 * Datasheet:
 *   https://datasheets.maximintegrated.com/en/ds/MAX17048-MAX17049.pdf
 */

const log = getLogger('MAX17048');

enum REGISTER {
  VCELL = 0x02,
  SOC = 0x04,
  MODE = 0x06,
  VERSION = 0x08,
  HIBERNATE = 0x0a,
  CONFIG = 0x0c,
  V_ALERT = 0x14,
  CHARGE_RATE = 0x16,
  V_RESET = 0x18,
  STATUS = 0x1a,
  POR = 0xFE
}

export class Device {
  private device: BaseDevice;

  constructor(i2cAddress = 0x36) {
    log.debug(`Init MAX17048 (${hex(i2cAddress)})`);
    this.device = new BaseDevice(i2cAddress);
  }

  /** Convenience method to read and parse a 2-byte value */
  protected readTwoByteRegister(register: REGISTER, signed = false) {
    try {
      const result = this.device.readBlock(register, 2, true);
      return bytesToInt(result, signed);
    }
    catch (err) {
      log.warn('Read register failed');
      return 0;
    }
  }

  /** Get current cell voltage (V) */
  getCellVoltage() {
    const val = this.readTwoByteRegister(REGISTER.VCELL);
    const volts = val * 0.000078125;
    log.debug(`Voltage: ${volts} V`);
    return volts;
  }

  /** Get current state-of-charge (%) */
  getSOC() {
    const val = this.device.readBlock(REGISTER.SOC, 2, true);
    const soc = val[0] + (Math.floor(val[1] / 255 * 100) / 100);
    log.debug(`SOC: ${soc}%`);
    return soc;
  }

  /** Get current charge rate (%/hr) */
  getChargeRate() {
    const val = this.readTwoByteRegister(REGISTER.CHARGE_RATE, true);
    const crate = val * 0.208;
    log.debug(`Charge rate: ${crate} %/hr`);
    return crate;
  }

}
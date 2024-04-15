import { Logger } from 'bark-logger';
import { MAX17048 } from '../src';
import { sleep } from '../src/utils/timing';
import { hex } from '../src/utils/formatting';
import InteractiveSession from '../src/utils/interactive';

const { Device } = MAX17048;
const log = new Logger('battery-monitor');
const style = (str: string, ...codes: string[]) => `\x1b[${codes.join(';')}m${str}\x1b[0m`;

const batt = new Device();

const session = new InteractiveSession();
//session.debug(data => log.info(`keypress: ${JSON.stringify(data)}`));

session.writeLine(`${style(` Battery Monitor ${style('[MAX17048] ', '90')}`, '47;30')}`);
session.writeLine(style('ctrl+c = Quit', '90'));
session.writeLine('');
session.writeLine('');
session.writeLine('');
session.writeLine('');
session.writeLine('');
session.writeLine('');
session.writeLine(`[${style('Connecting', '33')}]`);

session.onSpacebar(() => update());
session.onEnd(() => dispose());

update();
session.begin();

function progBar(ratio: number, fillColor = 44, backColor = 100) {
  const dct = Math.ceil(ratio * 10);
  let result = '';

  // Fill bar from start
  result += style(''.padEnd(dct, ' '), fillColor.toString());

  // Pad the rest
  result += style(''.padEnd((10 - dct), ' '), backColor.toString());

  return result;
}

function update() {
  session.overwriteLine(`[${style('Updating', '33')}]       `);

  const cellV = (Math.ceil(batt.getCellVoltage() * 100) / 100).toString().padEnd(4, '0');
  const soc = Math.ceil(batt.getSOC());
  const crate = Math.floor(batt.getChargeRate());

  const cellVLabel = `\u{1F539} ${style(`${cellV} V`, '34;1')}`;
  const socLabel = `\u{1F50B} ${style(`${soc}%`, '32')}`;
  const crateLabel = (crate > 0)
    ? `\u{1F50C} ${style(`${crate}%/hr`, '33')}`
    : `\u{1FAAB} ${style(`${crate * -1}%/hr`, '31')}`;
    const crateProg = (crate > 0)
    ? progBar(crate / 80, 43)
    : progBar((crate * -1) / 80, 41);

  session.overwriteLine(`Cell 1 (${(crate > 0) ? 'charging' : 'draining'})`, 6);
  session.writeLine('-----------------------------------');
  session.writeLine(`${cellVLabel}   ${socLabel}       ${crateLabel}`);
  session.writeLine(`            ${progBar(soc / 100, 42)}   ${crateProg}`);
  session.writeLine('');

  session.writeLine(`[${style('Ready', '32')}]       `);
}

function dispose() {
  session.overwriteLine(`[${style('Closing', '33')}]       `);
  session.overwriteLine('', 2);
}
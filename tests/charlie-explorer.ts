import { env, argv, stdin, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { FL3731, SETTING, OPERATING_MODE } from '../src';
import InteractiveSession from '../src/utils/interactive';

const log = new Logger('charlie-explorer');
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const ICO_FIRE = '\uD83D\uDD25';

log.info(`${ICO_FIRE} Welcome!`);
const chip = new FL3731();

const session = new InteractiveSession();

session.debug(data => log.info(`keypress: ${JSON.stringify(data)}`));

session.begin();

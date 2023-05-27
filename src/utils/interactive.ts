import { stdin, stdout, exit } from 'node:process';

const MOD_SHIFT = [49,59,50];
const KEY_INTERRUPT = [[3]];
const KEY_UP =    [[27,91,65]];
const KEY_DOWN =  [[27,91,66]];
const KEY_RIGHT = [[27,91,67],[27,91,...MOD_SHIFT,67]];
const KEY_LEFT =  [[27,91,68],[27,91,...MOD_SHIFT,68]];
const KEY_OPT_RIGHT = [[27,102]];
const KEY_OPT_LEFT =  [[27,98]];

function keyMatch(input: number[], keyTemplate: number[][]) {
  return keyTemplate.some(x => (x.length === input.length) &&
    x.every((y, i) => y === input[i]));
}

function shiftFlag(data: number[]) {
  return (data.length >= 5) && keyMatch(data.slice(2, 5), [MOD_SHIFT]);
}

interface KeypressCallback {
  condition: (data: number[]) => boolean,
  callback: Function
}

class InteractiveSession {
  private _callbacks: KeypressCallback[] = [];
  private _debug?: (data: number[]) => void;
  
  private dataReceived(data: Buffer) {
    const bytes = [...data];

    if (this._debug) {
      this._debug(bytes);
    }

    for (let i = 0; i < this._callbacks.length; i++) {
      const cb: KeypressCallback = this._callbacks[i];

      if (cb.condition(bytes)) {
        cb.callback(shiftFlag(bytes));
      }
    }

    if (keyMatch(bytes, KEY_INTERRUPT)) {
      exit();
    }
  }

  debug(callback: (data: number[]) => void) {
    this._debug = callback;
  }

  on(condition: (data: number[]) => boolean, callback: Function) {
    this._callbacks.push({ condition, callback });
  }

  onArrowUp(callback: Function) {
    this.on(x => keyMatch(x, KEY_UP), callback);
  }

  onArrowDown(callback: Function) {
    this.on(x => keyMatch(x, KEY_DOWN), callback);
  }

  onArrowRight(callback: Function) {
    this.on(x => keyMatch(x, KEY_RIGHT), callback);
  }

  onArrowLeft(callback: Function) {
    this.on(x => keyMatch(x, KEY_LEFT), callback);
  }

  onArrowRightOpt(callback: Function) {
    this.on(x => keyMatch(x, KEY_OPT_RIGHT), callback);
  }

  onArrowLeftOpt(callback: Function) {
    this.on(x => keyMatch(x, KEY_OPT_LEFT), callback);
  }

  onEnd(callback: Function) {
    this.on(x => keyMatch(x, KEY_INTERRUPT), callback);
  }

  begin() {
    stdin.on('data', this.dataReceived.bind(this));
    stdin.setRawMode(true);
    stdin.resume();
  }

  writeLine(msg: string) {
    stdout.write(msg);
    stdout.write('\n');
  }

  overwriteLine(msg: string, lines = 1) {
    stdout.moveCursor(0, (lines * -1));
    stdout.clearLine(0);
    stdout.write(msg);
    stdout.write('\n');
  }
}

export default InteractiveSession;